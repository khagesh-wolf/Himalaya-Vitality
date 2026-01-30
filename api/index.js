
const path = require('path');
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
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

app.use(cors());
app.use(express.json());

// --- CONSTANTS & HELPERS ---
const DEFAULT_PRODUCT_ID = 'himalaya-shilajit-resin';
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Bundle Multipliers for Inventory Logic
const BUNDLE_MULTIPLIERS = {
    'SINGLE': 1,
    'DOUBLE': 2,
    'TRIPLE': 3
};

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

// Optional auth: attempts to identify user but doesn't block if token missing
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) req.user = user;
            next();
        });
    } else {
        next();
    }
};

const requireAdmin = (req, res, next) => {
    authenticate(req, res, () => {
        // Case-insensitive check for ADMIN role
        if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ message: 'Admin access required' });
        }
    });
};

// --- EMAIL SETUP (Standard SMTP) ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465, 
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: { rejectUnauthorized: false }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
        await transporter.sendMail({ 
            from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, 
            to, subject, text, html: html || text 
        });
    } catch (e) { console.error('Email error:', e); }
};

// --- ROUTES ---

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Blog (New)
app.get('/api/blog', async (req, res) => {
    try {
        const posts = await prisma.blogPost.findMany({ 
            where: { published: true }, 
            orderBy: { createdAt: 'desc' } 
        });
        res.json(posts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reviews (New)
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const review = await prisma.review.create({ data: req.body });
        res.json(review);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Inventory Logs (New)
app.get('/api/admin/inventory-logs', requireAdmin, async (req, res) => {
    try {
        const logs = await prisma.inventoryLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
        res.json(logs);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Products
app.get('/api/products/:id', async (req, res) => {
    try {
        let product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { variants: true }
        });
        if (!product) return res.status(404).json({ error: "Product not found" });
        
        // Dynamic Stock Calculation:
        // Variant stock = floor(TotalStock / BundleSize)
        product.variants = product.variants.map(v => ({
            ...v,
            stock: Math.floor(product.totalStock / (BUNDLE_MULTIPLIERS[v.type] || 1))
        })).sort((a, b) => a.price - b.price);

        res.json(product);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const { variants, totalStock } = req.body;
    try {
        // Update Prices
        if (variants) {
            await prisma.$transaction(
                variants.map(v => prisma.productVariant.update({
                    where: { id: v.id },
                    data: {
                        price: parseFloat(v.price),
                        compareAtPrice: parseFloat(v.compareAtPrice),
                        // Note: we do NOT update variant 'stock' here anymore
                    }
                }))
            );
        }

        // Update Master Stock if provided
        if (totalStock !== undefined) {
            await prisma.product.update({
                where: { id: req.params.id },
                data: { totalStock: parseInt(totalStock) }
            });

            // Log the inventory change
            await prisma.inventoryLog.create({
                data: {
                    sku: 'MASTER_JAR_STOCK',
                    action: 'ADMIN_UPDATE',
                    quantity: parseInt(totalStock),
                    user: req.user.email,
                    date: new Date().toLocaleDateString()
                }
            });
        }

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Shipping Regions - PUBLIC GET
app.get('/api/shipping-regions', async (req, res) => {
    try {
        const regions = await prisma.shippingRegion.findMany({ orderBy: { name: 'asc' } });
        res.json(regions);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Shipping Regions - ADMIN ONLY WRITE
app.post('/api/shipping-regions', requireAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.create({ data: req.body });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/shipping-regions/:id', requireAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/shipping-regions/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.shippingRegion.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Discounts
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

// Validate Code - STRICT AUTH REQUIRED
app.post('/api/discounts/validate', authenticate, async (req, res) => {
    const { code } = req.body;
    try {
        const discount = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
        
        if (!discount || !discount.active) {
            return res.status(404).json({ error: 'Invalid or expired code' });
        }

        // User is present because 'authenticate' middleware is used
        const existingUsage = await prisma.discountUsage.findFirst({
            where: {
                userId: req.user.id,
                discountId: discount.id
            }
        });

        if (existingUsage) {
            return res.status(409).json({ error: 'You have already used this coupon code.' });
        }

        res.json(discount);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Payment & Orders
app.post('/api/create-payment-intent', async (req, res) => {
    const { items, currency, total } = req.body;
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    try {
        const amount = Math.round((total || 50) * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount > 50 ? amount : 50,
            currency: currency || 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USER ORDERS HISTORY (Must be before other /api/orders routes) ---
app.get('/api/orders/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });

        // Enrich with product info for UI
        const enhancedOrders = await Promise.all(orders.map(async (order) => {
            const itemsDetails = await Promise.all(order.items.map(async (item) => {
                // Find variant to get product details (title/image)
                const variant = await prisma.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true }
                });
                return {
                    ...item,
                    title: variant?.product?.title || variant?.name || 'Product',
                    image: variant?.product?.images?.[0],
                    productId: variant?.productId
                };
            }));
            
            return {
                id: order.orderNumber,
                date: new Date(order.createdAt).toLocaleDateString(),
                total: order.total,
                status: order.status,
                itemsDetails
            };
        }));

        res.json(enhancedOrders);
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// Public Tracking Endpoint
app.get('/api/orders/:id/track', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.id },
            select: { orderNumber: true, status: true, trackingNumber: true, carrier: true }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId, userId, discountCode } = req.body;
    try {
        // 1. Calculate Total Jars to Remove
        let totalJarsToRemove = 0;
        
        // We need to look up the variants to know their 'type' (multiplier)
        const enrichedItems = await Promise.all(items.map(async (item) => {
            const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
            return { ...item, type: variant.type };
        }));

        for (const item of enrichedItems) {
            const multiplier = BUNDLE_MULTIPLIERS[item.type] || 1;
            totalJarsToRemove += (item.quantity * multiplier);
        }

        // 2. Perform Transaction: Verify Usage, Create Order & Decrement Master Stock & Record Discount Usage
        const result = await prisma.$transaction(async (tx) => {
            // Check stock
            const product = await tx.product.findUnique({ where: { id: DEFAULT_PRODUCT_ID } });
            if (product.totalStock < totalJarsToRemove) {
                throw new Error("Insufficient stock");
            }

            // CHECK COUPON USAGE AGAIN STRICTLY FOR GUESTS AND USERS
            if (discountCode) {
                const discount = await tx.discount.findUnique({ where: { code: discountCode.toUpperCase() } });
                if (discount) {
                    // Logic updated: If user is logged in (userId present), check usage against userId.
                    // If no userId (guest), we theoretically check email, but the new requirement enforces login for coupons.
                    // However, we keep email check as a fallback if policy changes or for legacy guest orders.
                    const usageCheckQuery = userId 
                        ? { userId: userId, discountId: discount.id }
                        : { guestEmail: customer.email, discountId: discount.id };

                    const existingUsage = await tx.discountUsage.findFirst({ where: usageCheckQuery });
                    
                    if (existingUsage) {
                        throw new Error(`The coupon '${discountCode}' has already been used by this account.`);
                    }

                    // Record Usage
                    await tx.discountUsage.create({
                        data: {
                            userId: userId || null,
                            guestEmail: userId ? null : customer.email, // If guest, save email
                            discountId: discount.id
                        }
                    });
                }
            }

            // Decrement Stock
            await tx.product.update({
                where: { id: DEFAULT_PRODUCT_ID },
                data: { totalStock: { decrement: totalJarsToRemove } }
            });

            // Log Inventory
            await tx.inventoryLog.create({
                data: {
                    sku: 'MASTER_JAR_STOCK',
                    action: 'ORDER_SALE',
                    quantity: -totalJarsToRemove, // negative for sale
                    user: 'System',
                    date: new Date().toLocaleDateString()
                }
            });

            // Create Order
            const order = await tx.order.create({
                data: {
                    orderNumber: `HV-${Date.now()}`,
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
            return order;
        });

        await sendEmail(customer.email, `Order Confirmation ${result.orderNumber}`, `Your order has been received.`);
        res.json({ success: true, orderId: result.orderNumber });
    } catch(e) { 
        console.error("Order error", e);
        res.status(500).json({ error: e.message || 'Failed to create order' }); 
    }
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const totalRevenue = (await prisma.order.aggregate({ _sum: { total: true }, where: { status: 'Paid' } }))._sum.total || 0;
        const totalOrders = await prisma.order.count();
        res.json({ totalRevenue, totalOrders, avgOrderValue: totalOrders ? totalRevenue/totalOrders : 0, chart: [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
        res.json(orders.map(o => ({
            id: o.orderNumber, dbId: o.id, customer: o.customerName, email: o.customerEmail,
            date: new Date(o.createdAt).toLocaleDateString(), total: o.total, status: o.status,
            items: o.items.length, trackingNumber: o.trackingNumber, carrier: o.carrier
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        await prisma.order.update({ where: { orderNumber: req.params.id }, data: { status: req.body.status } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/orders/:id/tracking', requireAdmin, async (req, res) => {
    try {
        const { trackingNumber, carrier } = req.body;
        await prisma.order.update({ where: { orderNumber: req.params.id }, data: { trackingNumber, carrier, status: 'Fulfilled' } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Subscribers
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email, source } = req.body;
        await prisma.subscriber.create({ data: { email, source } });
        res.json({ success: true });
    } catch (e) { res.json({ message: 'Already subscribed' }); }
});

app.get('/api/admin/subscribers', requireAdmin, async (req, res) => {
    try {
        const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(subs.map(s => ({ id: s.id, email: s.email, date: new Date(s.createdAt).toLocaleDateString(), source: s.source })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/newsletter/send', requireAdmin, async (req, res) => {
    try {
        const { subject, message } = req.body;
        const subs = await prisma.subscriber.findMany();
        for (const sub of subs) { await sendEmail(sub.email, subject, message); }
        res.json({ success: true, sent: subs.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Auth
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.isVerified && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Verification required', requiresVerification: true, email });
        }
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(400).json({ message: 'User exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        await prisma.user.create({ data: { name, email, password: hashedPassword, otp } });
        await sendEmail(email, 'Verify Email', `Code: ${otp}`);
        res.json({ message: 'Signup successful', requiresVerification: true, email });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) return res.status(400).json({ message: 'Invalid code' });
        const updated = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, otp: null } });
        const token = jwt.sign({ id: updated.id, role: updated.role, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = updated;
        res.json({ token, user: safeUser });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if(user) {
        const { password: _, otp: __, ...safeUser } = user;
        res.json(safeUser);
    } else { res.status(404).json({ message: 'User not found' }); }
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
    const { firstName, lastName, address, city, country, zip, phone } = req.body;
    const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { firstName, lastName, name: `${firstName} ${lastName}`, address, city, country, zip, phone }
    });
    const { password: _, otp: __, ...safeUser } = updated;
    res.json(safeUser);
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
