require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 

const prisma = new PrismaClient();
// Initialize Stripe only if key exists
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    authenticate(req, res, () => {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
        next();
    });
};

// --- Helpers ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- EMAIL SETUP ---
// Production Setup using Environment Variables
const transporter = nodemailer.createTransport({
    // If SMTP_HOST is provided (e.g. smtp.resend.com), use it. Otherwise default to gmail.
    service: process.env.SMTP_HOST ? undefined : 'gmail', 
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        console.log(`[EMAIL] Attempting to send to ${to}...`);
        const info = await transporter.sendMail({ 
            from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text,
            html: `<div style="font-family: sans-serif; color: #333;">
                    <h2>Himalaya Vitality</h2>
                    <p>${text}</p>
                    <hr />
                    <small>If you did not request this, please ignore this email.</small>
                   </div>`
        });
        console.log(`[EMAIL SENT] MessageId: ${info.messageId}`);
    } catch (e) {
        console.error('[EMAIL FAIL] Check EMAIL_USER and EMAIL_PASS environment variables.', e);
        throw new Error('Failed to send email verification.');
    }
};

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires }
        });

        // Send REAL email
        await sendEmail(email, 'Verify your email - Himalaya Vitality', `Your verification code is: ${otp}`);
        
        // Do NOT return the OTP in the response for security in production
        res.json({ message: 'Signup successful. Please check your email for the verification code.', requiresVerification: true, email });
    } catch (e) {
        console.error('Signup Error:', e);
        res.status(500).json({ error: e.message || 'Internal server error during signup' });
    }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            const otp = generateOTP();
            await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpires: new Date(Date.now() + 15*60000) }});
            
            await sendEmail(email, 'Verify your email', `Your verification code is: ${otp}`);
            
            return res.status(403).json({ message: 'Verification required. A new code has been sent to your email.', requiresVerification: true, email });
        }

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (e) {
        console.error('Login Error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Auth: Verify Email
app.post('/api/auth/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Loose comparison for string/number match
        if (String(user.otp).trim() !== String(otp).trim() || new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null, otpExpires: null }
        });

        const token = jwt.sign({ id: updated.id, role: updated.role, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = updated;
        
        res.json({ message: 'Email successfully verified', token, user: safeUser });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Auth: Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const otp = generateOTP();
            await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpires: new Date(Date.now() + 15*60000) }});
            await sendEmail(email, 'Reset Password', `Your password reset code is: ${otp}`);
        }
        // Always return success to prevent email enumeration
        res.json({ message: 'If an account exists with this email, a reset code has been sent.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Auth: Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || String(user.otp).trim() !== String(otp).trim() || new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, otp: null, otpExpires: null, isVerified: true }
        });
        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Auth: Get Profile
app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if(user) {
            const { password: _, otp: __, ...safeUser } = user;
            res.json(safeUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch(e) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Auth: Update Profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
    try {
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: req.body
        });
        const { password: _, otp: __, ...safeUser } = updated;
        res.json(safeUser);
    } catch(e) {
        res.status(500).json({error: 'Failed to update profile'});
    }
});

// Data: Product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ 
            where: { id: req.params.id },
            include: { variants: true }
        });
        res.json(product);
    } catch (e) {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Data: Blog
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await prisma.blogPost.findMany({ 
            where: { published: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

// Data: Orders
app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                orderNumber: `HV-${Date.now()}`,
                customerEmail: customer.email,
                customerName: `${customer.firstName} ${customer.lastName}`,
                shippingAddress: customer,
                total,
                status: 'PAID',
                paymentId,
                items: {
                    create: items.map(i => ({
                        variantId: i.variantId,
                        quantity: i.quantity,
                        price: i.price
                    }))
                }
            }
        });
        res.json({ success: true, orderId: order.orderNumber });
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

// Data: My Orders
app.get('/api/orders/my-orders', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id }});
        const orders = await prisma.order.findMany({
            where: { 
                OR: [
                    { userId: req.user.id },
                    { customerEmail: user.email }
                ]
            },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status === 'PAID' ? 'Paid' : o.status,
            items: o.items.length,
            itemsDetails: o.items.map(i => ({
                title: 'Himalayan Shilajit',
                quantity: i.quantity,
                image: 'https://picsum.photos/200'
            }))
        }));
        res.json(formatted);
    } catch(e) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin endpoints (omitted for brevity, assume similar structure)
// ...

// IMPORTANT for Vercel: Export the app, do NOT listen if running in serverless mode
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;