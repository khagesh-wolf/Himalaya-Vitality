
const path = require('path');
// Explicitly load .env from the project root (one level up) if possible, but don't crash
try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
    console.warn("Could not load local .env file", e);
}

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

// --- CONSTANTS ---
const DEFAULT_PRODUCT_ID = 'himalaya-shilajit-resin';
const DEFAULT_PRODUCT_DATA = {
    id: DEFAULT_PRODUCT_ID,
    title: 'Pure Himalayan Shilajit Resin',
    description: 'Sourced from 18,000ft in the Himalayas, our Gold Grade Shilajit is purified using traditional Ayurvedic methods.',
    rating: 4.9,
    reviewCount: 1248,
    features: ['85+ Trace Minerals', 'Lab Tested', 'Supports Energy'],
    images: ['https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg', 'https://i.ibb.co/9H8yWSgP/Whats-App-Image-2026-01-26-at-7-08-21-PM.jpg'],
    variants: [
        { id: 'var_single', type: 'SINGLE', name: 'Starter Pack (1 Jar)', price: 49, compareAtPrice: 65, label: '1 Month Supply', savings: 'Save $16', stock: 100 },
        { id: 'var_double', type: 'DOUBLE', name: 'Commitment Pack (2 Jars)', price: 88, compareAtPrice: 130, label: '2 Month Supply', savings: 'Save $42', stock: 100 },
        { id: 'var_triple', type: 'TRIPLE', name: 'Transformation Pack (3 Jars)', price: 117, compareAtPrice: 195, label: '3 Month Supply', savings: 'Save $78', isPopular: true, stock: 100 }
    ]
};

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
        if (req.user && req.user.role === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ message: 'Admin access required' });
        }
    });
};

// --- Helpers ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Force Gmail host
    port: 465, // Force SSL Port
    secure: true, // Force Secure
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: { rejectUnauthorized: false }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        console.log(`[EMAIL] Attempting send to ${to}...`);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('EMAIL_USER or EMAIL_PASS missing in .env');
            return;
        }

        const info = await transporter.sendMail({ 
            from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text,
            html: html || `<div style="font-family: sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #D0202F;">Himalaya Vitality</h2>
                    <p style="font-size: 16px;">${text}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <small style="color: #888;">This is an automated message.</small>
                   </div>`
        });
        console.log('[EMAIL] Sent successfully:', info.messageId);
        return info;
    } catch (e) {
        console.error('[EMAIL FAIL]', e.message);
        throw e;
    }
};

// --- ROUTES ---

// Health & Debug
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// --- PRODUCTS ---
app.get('/api/products/:id', async (req, res) => {
    try {
        let product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { variants: true }
        });

        // --- AUTO-SEED FALLBACK ---
        if (!product && req.params.id === DEFAULT_PRODUCT_ID) {
            console.log("⚠️ Product not found in DB. Auto-seeding default data...");
            try {
                // Ensure no partial state exists
                const { variants, ...productData } = DEFAULT_PRODUCT_DATA;
                
                // Use upsert on product just in case
                product = await prisma.product.upsert({
                    where: { id: DEFAULT_PRODUCT_ID },
                    update: {},
                    create: {
                        ...productData,
                        variants: {
                            create: variants.map(v => ({
                                id: v.id,
                                type: v.type,
                                name: v.name,
                                price: v.price,
                                compareAtPrice: v.compareAtPrice,
                                label: v.label,
                                savings: v.savings,
                                isPopular: v.isPopular,
                                stock: v.stock
                            }))
                        }
                    },
                    include: { variants: true }
                });
                console.log("✅ Auto-seed successful");
            } catch (seedErr) {
                console.error("Auto-seed failed:", seedErr);
                // Even if seed fails, return a 404 with error details so frontend developer knows
                return res.status(404).json({ error: "Product not found and auto-seed failed", details: seedErr.message });
            }
        }

        if (!product) return res.status(404).json({ error: "Product not found" });
        
        // Sort variants by price to ensure consistent order
        product.variants.sort((a, b) => a.price - b.price);
        
        res.json(product);
    } catch (e) {
        console.error("Fetch Product Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const { variants } = req.body;
    const productId = req.params.id;

    try {
        // 1. Ensure Product Exists First
        const productExists = await prisma.product.findUnique({ where: { id: productId } });
        
        if (!productExists) {
            console.log("⚠️ PUT: Product missing. Creating full product structure.");
            // If product doesn't exist, create it fully using default data + incoming variant overrides
            const { variants: defaultVariants, ...productData } = DEFAULT_PRODUCT_DATA;
            
            // Merge defaults with incoming updates
            const mergedVariants = defaultVariants.map(dv => {
                const incoming = variants.find(v => v.id === dv.id);
                return incoming ? { ...dv, ...incoming } : dv;
            });

            await prisma.product.create({
                data: {
                    ...productData,
                    id: productId, // Ensure ID matches URL
                    variants: {
                        create: mergedVariants.map(v => ({
                            id: v.id,
                            type: v.type,
                            name: v.name,
                            price: parseFloat(v.price),
                            compareAtPrice: parseFloat(v.compareAtPrice),
                            label: v.label,
                            savings: v.savings,
                            isPopular: v.isPopular || false,
                            stock: parseInt(v.stock)
                        }))
                    }
                }
            });
            return res.json({ success: true, message: "Product created via recovery" });
        }

        // 2. Product Exists - UPSERT Variants (Handle Update or Create)
        await prisma.$transaction(
            variants.map(v => {
                // Find default for missing fields if this is a new variant
                const defaultV = DEFAULT_PRODUCT_DATA.variants.find(dv => dv.id === v.id) || {};
                
                return prisma.productVariant.upsert({
                    where: { id: v.id },
                    update: {
                        price: parseFloat(v.price),
                        compareAtPrice: parseFloat(v.compareAtPrice),
                        stock: parseInt(v.stock)
                    },
                    create: {
                        id: v.id,
                        productId: productId,
                        type: v.type || defaultV.type || 'SINGLE',
                        name: v.name || defaultV.name || 'New Variant',
                        price: parseFloat(v.price),
                        compareAtPrice: parseFloat(v.compareAtPrice),
                        stock: parseInt(v.stock),
                        label: v.label || defaultV.label || '',
                        savings: v.savings || defaultV.savings || '',
                        isPopular: v.isPopular || defaultV.isPopular || false
                    }
                });
            })
        );
        res.json({ success: true });
    } catch (e) {
        console.error("Update Product Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// --- DISCOUNTS ---
app.get('/api/discounts', requireAdmin, async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(discounts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/discounts', requireAdmin, async (req, res) => {
    try {
        const discount = await prisma.discount.create({ data: req.body });
        res.json(discount);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/discounts/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Validate Discount (Public)
app.post('/api/discounts/validate', async (req, res) => {
    const { code } = req.body;
    try {
        const discount = await prisma.discount.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!discount || !discount.active) {
            return res.status(404).json({ error: 'Invalid or expired code' });
        }

        res.json({
            code: discount.code,
            amount: discount.value,
            type: discount.type
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- PAYMENT ROUTES ---
app.post('/api/create-payment-intent', async (req, res) => {
    const { items, currency, total } = req.body;
    
    if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured on server" });
    }

    try {
        let amount;
        if (total) {
            // Use the total calculated by the frontend (includes shipping/tax/discounts)
            amount = Math.round(total * 100);
        } else {
            // Fallback
            const calculatedTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            amount = Math.round(calculatedTotal * 100);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount > 50 ? amount : 50,
            currency: currency || 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });

    } catch (e) {
        console.error("Stripe Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); 

        // Send Email FIRST.
        try {
            await sendEmail(email, 'Verify your email', `Your verification code is: ${otp}`);
        } catch (mailError) {
            console.error("Mail error during signup:", mailError);
            return res.status(500).json({ error: 'Failed to send verification email. Check server logs.' });
        }

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires }
        });
        
        res.json({ message: 'Signup successful', requiresVerification: true, email });
    } catch (e) {
        console.error("Signup Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check verification - skipping for Admin to prevent lockout if manually inserted
        if (!user.isVerified && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Verification required', requiresVerification: true, email });
        }
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || String(user.otp).trim() !== String(otp).trim()) return res.status(400).json({ message: 'Invalid code' });

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null, otpExpires: null }
        });
        const token = jwt.sign({ id: updated.id, role: updated.role, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = updated;
        res.json({ token, user: safeUser });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        if(!googleRes.ok) throw new Error('Invalid Google Token');
        const googleUser = await googleRes.json();
        
        let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
        
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    provider: 'GOOGLE',
                    isVerified: true,
                    avatar: googleUser.picture
                }
            });
        }

        const jwtToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token: jwtToken, user: safeUser });

    } catch (e) {
        console.error('Google Auth Error:', e);
        res.status(401).json({ message: 'Google Auth Failed: ' + e.message });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if(user) {
            const { password: _, otp: __, ...safeUser } = user;
            res.json(safeUser);
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch(e) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
    const { firstName, lastName, address, city, country, zip, phone } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, name: `${firstName} ${lastName}`, address, city, country, zip, phone }
        });
        const { password: _, otp: __, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (e) {
        console.error("Profile Update Error:", e);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// --- ADMIN ROUTES ---

// Get Stats (Advanced)
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Define date ranges
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30)); // Default 30 days
        
        // Calculate previous period for comparison (same duration)
        const duration = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime());
        const prevStart = new Date(prevEnd.getTime() - duration);

        // Fetch Current Period Data
        const currentOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                },
                status: 'Paid' // Only count paid revenue
            },
            select: { total: true, createdAt: true }
        });

        // Fetch Previous Period Data
        const prevOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: prevStart,
                    lte: prevEnd
                },
                status: 'Paid'
            },
            select: { total: true }
        });

        const totalRevenue = currentOrders.reduce((acc, curr) => acc + curr.total, 0);
        const prevRevenue = prevOrders.reduce((acc, curr) => acc + curr.total, 0);
        
        const totalOrders = await prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }); // Count all orders (incl pending)
        const prevTotalOrders = await prisma.order.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } });

        const avgOrderValue = totalOrders > 0 ? totalRevenue / currentOrders.length : 0;
        const prevAvgOrderValue = prevOrders.length > 0 ? prevRevenue / prevOrders.length : 0;

        // Calculate Percent Changes
        const calcTrend = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        // Chart Data (Group by Day)
        const chartData = {};
        currentOrders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            chartData[dateStr] = (chartData[dateStr] || 0) + order.total;
        });
        
        // Fill in missing days
        const chart = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            chart.push({
                date: dateStr,
                revenue: chartData[dateStr] || 0
            });
        }

        res.json({
            totalRevenue,
            totalOrders,
            avgOrderValue,
            trends: {
                revenue: calcTrend(totalRevenue, prevRevenue),
                orders: calcTrend(totalOrders, prevTotalOrders),
                aov: calcTrend(avgOrderValue, prevAvgOrderValue)
            },
            chart
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Stats failed' });
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            dbId: o.id, // Internal ID for updates
            customer: o.customerName,
            email: o.customerEmail,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status,
            items: o.items.length,
            trackingNumber: o.trackingNumber,
            carrier: o.carrier
        }));
        res.json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        await prisma.order.update({
            where: { orderNumber: req.params.id },
            data: { status }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

app.put('/api/admin/orders/:id/tracking', requireAdmin, async (req, res) => {
    const { trackingNumber, carrier, notify } = req.body;
    try {
        const order = await prisma.order.update({
            where: { orderNumber: req.params.id },
            data: { 
                trackingNumber, 
                carrier,
                status: 'Fulfilled' // Auto set to fulfilled
            }
        });

        if (notify) {
            try {
                await sendEmail(
                    order.customerEmail,
                    `Your Order ${order.orderNumber} has shipped!`,
                    `Good news! Your order is on the way.\n\nCarrier: ${carrier}\nTracking Number: ${trackingNumber}\n\nTrack here: https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`
                );
            } catch (emailErr) {
                console.warn("Failed to send tracking email:", emailErr);
            }
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Tracking update failed' });
    }
});

app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId, userId } = req.body;
    
    try {
        const orderData = {
            orderNumber: `HV-${Date.now()}`,
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            shippingAddress: customer, 
            total,
            status: 'Paid', 
            paymentId,
            items: {
                create: items.map(i => ({
                    variantId: i.variantId,
                    quantity: i.quantity,
                    price: i.price
                }))
            }
        };

        if (userId) {
            orderData.user = { connect: { id: userId } };
        }

        const order = await prisma.order.create({ data: orderData });
        
        try {
            await sendEmail(
                customer.email, 
                `Order Confirmation ${order.orderNumber}`, 
                `Thank you for your purchase, ${customer.firstName}! Your order ${order.orderNumber} has been received.`
            );
        } catch(e) {
            console.warn("Order email failed:", e);
        }

        res.json({ success: true, orderId: order.orderNumber });
    } catch(e) {
        console.error("Order Create Error:", e);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

app.get('/api/orders/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status,
            trackingNumber: o.trackingNumber, 
            carrier: o.carrier,
            itemsDetails: o.items.map(i => ({
                title: 'Himalaya Shilajit', 
                quantity: i.quantity,
                price: i.price,
                productId: 'himalaya-shilajit-resin',
                image: 'https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg' 
            }))
        }));
        res.json(formatted);
    } catch(e) {
        console.error("[ORDERS] Fetch Error:", e);
        res.status(500).json({ error: 'Failed to fetch orders. DB Sync Required: ' + e.message });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
