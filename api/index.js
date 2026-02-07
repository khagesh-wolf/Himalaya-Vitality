
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const { z } = require('zod');

// --- Initialization ---
const app = express();
const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// --- Security Middleware ---
app.use(helmet()); // Set secure HTTP headers
app.use(express.json({ limit: '10kb' })); // Body limit to prevent DoS
app.use(cors({
    origin: process.env.SITE_URL || '*', // Restrict in production
    credentials: true
}));
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// --- Rate Limiting ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/signup requests per hour
    message: { error: 'Too many login attempts, please try again later.' }
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many messages sent. Please try again later.' }
});

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    next();
};

// --- Email Templates & Helper ---
const emailStyles = `
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
  .header { background-color: #111111; padding: 30px 20px; text-align: center; }
  .header img { height: 32px; }
  .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
  .button { display: inline-block; padding: 14px 28px; background-color: #D0202F; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 25px; text-align: center; }
  .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
  .h1 { font-size: 24px; font-weight: 700; margin-bottom: 15px; color: #111111; letter-spacing: -0.5px; }
  .text-gray { color: #666666; }
  .otp-box { background-color: #f0f0f0; border: 1px solid #e0e0e0; padding: 15px; font-size: 32px; font-weight: 800; letter-spacing: 8px; text-align: center; margin: 25px 0; border-radius: 8px; color: #111111; }
  .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .info-table td { padding: 10px 0; border-bottom: 1px solid #eeeeee; }
  .info-table td:last-child { text-align: right; font-weight: bold; }
`;

const wrapEmail = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
       <img src="https://i.ibb.co/mr2hH8wK/logo-white.png" alt="Himalaya Vitality" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
       ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Himalaya Vitality. All rights reserved.</p>
      <p>Elevate your potential.</p>
    </div>
  </div>
</body>
</html>
`;

const templates = {
    otp: (code) => wrapEmail(`
        <h1 class="h1">Verify Your Email</h1>
        <p class="text-gray">Welcome to the tribe. Use the code below to complete your verification.</p>
        <div class="otp-box">${code}</div>
        <p class="text-gray" style="font-size: 12px; text-align: center;">This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
    `),
    forgotPassword: (code) => wrapEmail(`
        <h1 class="h1">Reset Password</h1>
        <p class="text-gray">We received a request to reset your password. Use the code below to proceed.</p>
        <div class="otp-box">${code}</div>
        <p class="text-gray" style="font-size: 12px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
    `),
    orderConfirmation: (orderId, total, customerName) => wrapEmail(`
        <h1 class="h1">Order Confirmed!</h1>
        <p class="text-gray">Hi ${customerName},</p>
        <p class="text-gray">Thank you for choosing Himalaya Vitality. Your journey to peak performance starts now. We have received your order and are preparing it for dispatch.</p>
        
        <table class="info-table">
            <tr><td>Order Reference</td><td>${orderId}</td></tr>
            <tr><td>Total Amount</td><td>$${total.toFixed(2)}</td></tr>
            <tr><td>Status</td><td style="color: #D0202F;">Processing</td></tr>
        </table>

        <div style="text-align: center;">
            <a href="${process.env.SITE_URL || 'https://himalayavitality.com'}/track" class="button">Track Order</a>
        </div>
    `),
    shipping: (orderId, carrier, trackingNumber) => wrapEmail(`
        <h1 class="h1">Your Order has Shipped!</h1>
        <p class="text-gray">Great news! Your package is on its way.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eeeeee;">
            <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #888; font-weight: bold;">Order ID</p>
            <p style="margin: 0 0 20px 0; font-weight: bold; font-size: 16px;">${orderId}</p>
            
            <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #888; font-weight: bold;">Carrier</p>
            <p style="margin: 0 0 20px 0; font-weight: bold;">${carrier}</p>
            
            <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #888; font-weight: bold;">Tracking Number</p>
            <p style="margin: 0; font-weight: bold; font-family: monospace; font-size: 18px;">${trackingNumber}</p>
        </div>

        <div style="text-align: center;">
            <a href="${process.env.SITE_URL || 'https://himalayavitality.com'}/track" class="button">Track Package</a>
        </div>
    `),
    contactReply: (name) => wrapEmail(`
        <h1 class="h1">Message Received</h1>
        <p class="text-gray">Hi ${name},</p>
        <p class="text-gray">Thanks for reaching out to Himalaya Vitality Support. We have received your message and a member of our team will get back to you within 24 hours.</p>
        <p class="text-gray">Stay vital,</p>
        <p style="font-weight: bold;">Himalaya Vitality Team</p>
    `)
};

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use host/port from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Skipping email: Credentials missing.");
            return false;
        }
        await transporter.sendMail({ from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, to, subject, html });
        return true;
    } catch (e) {
        console.error("Email Error:", e);
        return false;
    }
};

// --- Routes ---

// 1. Products
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { variants: true }
        });
        res.json(product);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const { productId, rating, title, content } = req.body;
        const review = await prisma.review.create({
            data: {
                productId,
                author: req.user.name || 'Verified Customer',
                rating: parseInt(rating),
                title,
                content,
                verified: true, // Since they are logged in
                status: 'Pending' // Requires admin approval
            }
        });
        res.json(review);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Shipping Regions
app.get('/api/shipping-regions', async (req, res) => {
    try {
        const regions = await prisma.shippingRegion.findMany();
        res.json(regions);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/shipping-regions', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.create({ data: req.body });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/shipping-regions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/shipping-regions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await prisma.shippingRegion.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Discounts
app.get('/api/discounts', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(discounts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/discounts', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { code, type, value, active } = req.body;
        const discount = await prisma.discount.create({
            data: { code, type, value, active: active ?? true }
        });
        res.json(discount);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/discounts/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/discounts/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const discount = await prisma.discount.findUnique({ where: { code } });
        if (!discount || !discount.active) return res.status(404).json({ error: 'Invalid code' });
        res.json(discount);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. Auth
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        if (!user.isVerified) {
             // Resend OTP logic could go here
             return res.status(403).json({ requiresVerification: true, email });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { ...user, password: undefined } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await prisma.user.create({
            data: { name, email, password: hashed, otp }
        });

        // Send Styled OTP Email
        await sendEmail(email, 'Verify Your Account', templates.otp(otp));

        res.json({ success: true, requiresVerification: true, email });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) return res.status(400).json({ error: 'Invalid Code' });

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null }
        });

        const token = jwt.sign({ id: updated.id, email: updated.email, role: updated.role, name: updated.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { ...updated, password: undefined } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.sendStatus(404);
    res.json({ ...user, password: undefined });
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, city, country, zip } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone, address, city, country, zip, name: `${firstName} ${lastName}` }
        });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.user.update({ where: { id: user.id }, data: { otp } });
            // Send Styled OTP Email
            await sendEmail(email, 'Reset Password', templates.forgotPassword(otp));
        }
        res.json({ success: true }); // Always return true for security
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) return res.status(400).json({ error: 'Invalid Code' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, otp: null }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. Checkout
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { total, currency } = req.body;
        const amount = Math.round(total * 100); // Cents
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, total, paymentId, userId } = req.body;
        const orderNumber = `HV-${Date.now().toString().slice(-6)}`;
        
        // Transaction: Create order and deduct stock
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    customerEmail: customer.email,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    shippingAddress: customer,
                    total,
                    status: 'Paid',
                    paymentId,
                    userId: userId || null,
                    items: {
                        create: items.map(i => ({
                            variantId: i.variantId,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    }
                }
            });

            // 2. Deduct Inventory (Simplified: Deduct from Master Stock based on Bundle)
            const product = await tx.product.findUnique({ where: { id: 'himalaya-shilajit-resin' } });
            let jarsSold = 0;
            items.forEach(item => {
                const multiplier = item.bundleType === 'TRIPLE' ? 3 : item.bundleType === 'DOUBLE' ? 2 : 1;
                jarsSold += (item.quantity * multiplier);
            });
            
            await tx.product.update({
                where: { id: 'himalaya-shilajit-resin' },
                data: { totalStock: { decrement: jarsSold } }
            });

            // 3. Log Inventory
            await tx.inventoryLog.create({
                data: {
                    sku: 'himalaya-shilajit-resin',
                    action: 'ORDER_SALE',
                    quantity: -jarsSold,
                    user: 'SYSTEM',
                    date: new Date().toISOString().split('T')[0]
                }
            });

            return order;
        });

        // Send Styled Confirmation Email
        sendEmail(
            customer.email, 
            `Order Confirmed ${orderNumber}`, 
            templates.orderConfirmation(orderNumber, total, customer.firstName)
        );

        res.json({ success: true, orderId: orderNumber });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: 'Order creation failed' }); 
    }
});

app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        
        // Enrich items with images (Mock logic for now, in real app join with product)
        const enriched = orders.map(o => ({
            id: o.orderNumber,
            date: o.createdAt.toISOString().split('T')[0],
            total: o.total,
            status: o.status,
            itemsDetails: o.items.map(i => ({
                title: 'Himalaya Shilajit',
                image: 'https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg',
                quantity: i.quantity,
                productId: 'himalaya-shilajit-resin'
            }))
        }));

        res.json(enriched);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id/track', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.id }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        res.json({
            orderNumber: order.orderNumber,
            status: order.status,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            date: order.createdAt.toISOString().split('T')[0]
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/checkout/lead', async (req, res) => {
    // Capture email during checkout for abandoned cart recovery
    // Implementation: Upsert into a Leads table or Subscribers with specific tag
    res.json({ received: true });
});

// 7. Admin Routes (Protected)
app.use('/api/admin', authenticateToken, authorizeAdmin);

app.get('/api/admin/stats', async (req, res) => {
    try {
        // Simple aggregated stats
        const orders = await prisma.order.findMany({ where: { status: 'Paid' } });
        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        // Mock Chart Data
        const chart = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return { date: d.toISOString().split('T')[0], revenue: Math.floor(Math.random() * 500) };
        }).reverse();

        res.json({
            totalRevenue,
            totalOrders: orders.length,
            avgOrderValue,
            chart
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        
        // Transform for frontend and calculate Jars
        const mapped = orders.map(o => {
            let totalJars = 0;
            const itemsMapped = o.items.map(i => {
                let multiplier = 1;
                let variantName = 'Shilajit Resin';
                
                // Determine multiplier based on variant ID convention from seed/constants
                if (i.variantId.includes('triple') || i.variantId.includes('TRIPLE') || i.variantId.includes('Triple')) {
                    multiplier = 3;
                    variantName = 'Transformation Pack (3 Jars)';
                } else if (i.variantId.includes('double') || i.variantId.includes('DOUBLE') || i.variantId.includes('Double')) {
                    multiplier = 2;
                    variantName = 'Commitment Pack (2 Jars)';
                } else {
                    variantName = 'Starter Pack (1 Jar)';
                }
                
                totalJars += (i.quantity * multiplier);
                
                return { name: variantName, quantity: i.quantity };
            });

            return {
                id: o.orderNumber,
                customer: o.customerName,
                email: o.customerEmail,
                total: o.total,
                status: o.status,
                date: o.createdAt.toISOString().split('T')[0],
                trackingNumber: o.trackingNumber,
                carrier: o.carrier,
                totalJars: totalJars, // Return calculated count
                items: itemsMapped
            };
        });
        res.json(mapped);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    await prisma.order.update({
        where: { orderNumber: req.params.id },
        data: { status }
    });
    res.json({ success: true });
});

app.put('/api/admin/orders/:id/tracking', async (req, res) => {
    const { trackingNumber, carrier, notify } = req.body;
    const order = await prisma.order.update({
        where: { orderNumber: req.params.id },
        data: { trackingNumber, carrier, status: 'Fulfilled' }
    });
    
    if (notify) {
        // Send Styled Shipping Email
        sendEmail(
            order.customerEmail, 
            'Order Shipped!', 
            templates.shipping(order.orderNumber, carrier, trackingNumber)
        );
    }
    
    res.json({ success: true });
});

// Admin Product Management
app.put('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { variants, totalStock } = req.body;
    
    // Update Variants Prices
    if (variants) {
        for (const v of variants) {
            await prisma.productVariant.update({
                where: { id: v.id },
                data: { price: v.price, compareAtPrice: v.compareAtPrice }
            });
        }
    }
    
    // Update Master Stock
    if (totalStock !== undefined) {
        const old = await prisma.product.findUnique({ where: { id: req.params.id } });
        const diff = totalStock - old.totalStock;
        
        await prisma.product.update({
            where: { id: req.params.id },
            data: { totalStock }
        });
        
        await prisma.inventoryLog.create({
            data: {
                sku: req.params.id,
                action: 'ADMIN_UPDATE',
                quantity: diff,
                user: req.user.name,
                date: new Date().toISOString().split('T')[0]
            }
        });
    }
    
    res.json({ success: true });
});

// Admin Inventory Logs
app.get('/api/admin/inventory-logs', async (req, res) => {
    const logs = await prisma.inventoryLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(logs);
});

// Admin Subscribers
app.get('/api/admin/subscribers', async (req, res) => {
    const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(subs.map(s => ({ ...s, date: s.createdAt.toISOString().split('T')[0] })));
});

app.post('/api/admin/newsletter/send', async (req, res) => {
    const { subject, message } = req.body;
    const subscribers = await prisma.subscriber.findMany();
    // In real app, use queue (Bull/Redis) to send bulk email
    // Here we simulate loop
    let sentCount = 0;
    for (const sub of subscribers) {
        // sendEmail(sub.email, subject, message); // Commented out to prevent accidental spam in dev
        sentCount++;
    }
    res.json({ sent: sentCount });
});

// Admin Messages (New)
app.get('/api/admin/messages', async (req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
});

// 8. Public Forms
app.post('/api/contact', contactLimiter, async (req, res) => {
    // 1. Validate Input (Zod)
    const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().min(10, "Message too short")
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, email, subject, message } = req.body;

    try {
        // 2. Save to DB (Persistence)
        try {
            await prisma.contactMessage.create({
                data: { name, email, subject: subject || 'No Subject', message }
            });
        } catch (dbError) {
            console.error("DB Save failed - Ensure 'npx prisma db push' ran", dbError);
        }

        // 3. Send Notification to Admin
        await sendEmail(
            process.env.EMAIL_USER, 
            `New Contact: ${subject || 'Inquiry'}`, 
            wrapEmail(`
                <h1 class="h1">New Contact Message</h1>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background:#f4f4f4; padding:15px; border-radius:5px;">${message}</div>
            `)
        );

        // 4. Send Auto-Reply to User
        await sendEmail(email, "We received your message", templates.contactReply(name));

        res.json({ success: true, message: "Message received." });
    } catch (e) {
        console.error("Contact API Error:", e);
        res.status(500).json({ error: 'Failed to process message.' });
    }
});

app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email, source } = req.body;
    try {
        await prisma.subscriber.create({ data: { email, source } });
        res.json({ success: true });
    } catch (e) {
        // Unique constraint failed likely
        res.json({ success: true }); // Silent success
    }
});

// --- Sitemap XML Route ---
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://himalayavitality.com';
        
        // Static Pages
        const staticPages = [
            '', '/science', '/about', '/reviews', '/blog', '/track', '/contact', 
            '/faq', '/shipping-returns', '/privacy', '/terms', '/how-to-use'
        ];

        // Products (Hardcoded ID for now as per constant structure)
        const products = ['himalaya-shilajit-resin'];

        // Fetch Blogs dynamically
        let blogs = [];
        try {
            blogs = await prisma.blogPost.findMany({ select: { slug: true, updatedAt: true } });
        } catch (e) {
            // If DB fail or table missing, fallback to empty or handle gracefully
            console.warn("Could not fetch blogs for sitemap");
        }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Static
        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
        });

        // Products
        products.forEach(slug => {
             xml += `
  <url>
    <loc>${baseUrl}/product/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });

        // Blogs
        blogs.forEach(post => {
            xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (e) {
        console.error("Sitemap generation error:", e);
        res.status(500).end();
    }
});

// --- Serverless Export ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
