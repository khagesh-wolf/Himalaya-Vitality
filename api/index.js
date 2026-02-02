
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
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// --- SECURITY: RATE LIMITING ---
// Trust Proxy is required for Vercel/Serverless to correctly identify the Client IP
app.set('trust proxy', 1);

// 1. General API Limiter (Protection against DDoS/Scraping)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// 2. Auth Limiter (Protection against Brute Force & OTP Spam)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Strict: 10 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login/signup attempts. Please wait 15 minutes.' }
});

// 3. Checkout Limiter (Protection against Card Testing Attacks)
const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Strict: 20 payment attempts per hour
    message: { error: 'Payment initialization limit reached. Please try again later.' }
});

app.use(cors());
app.use(express.json());

// Apply Global Limiters
app.use('/api', apiLimiter); // Global limit for all API routes
app.use('/api/auth', authLimiter); // Stricter limit for auth routes
app.use('/api/create-payment-intent', checkoutLimiter); // Strict limit for payments
app.use('/api/newsletter/subscribe', authLimiter); // Prevent spam subscriptions
app.use('/api/reviews', authLimiter); // Prevent spam reviews

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

// --- EMAIL INFRASTRUCTURE ---

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

// Brand Configuration
const BRAND = {
    name: "Himalaya Vitality",
    color: "#D0202F",
    dark: "#111111",
    logo: "https://i.ibb.co/tMXQXvJn/logo-red.png", // Direct link to logo
    address: "Melbourne, Australia",
    support: "support@himalayavitality.com",
    website: "https://himalayavitality.com"
};

// Base HTML Layout (Responsive Table Wrapper)
const emailLayout = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .footer { background-color: #111111; padding: 30px; text-align: center; color: #888888; font-size: 12px; }
        .button { display: inline-block; background-color: ${BRAND.color}; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${BRAND.dark}; margin: 20px 0; display: block; text-align: center; background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px dashed #cccccc; }
        .divider { height: 1px; background-color: #eeeeee; margin: 20px 0; }
        .item-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        a { color: ${BRAND.color}; text-decoration: none; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; margin-top: 0 !important; border-radius: 0 !important; }
            .content { padding: 20px !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${BRAND.logo}" alt="${BRAND.name}" style="height: 40px; width: auto;">
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
            <p>${BRAND.address}</p>
            <p>You received this email because you recently interacted with our store.</p>
        </div>
    </div>
</body>
</html>
`;

// --- EMAIL TEMPLATES ---

const Templates = {
    otp: (otp) => emailLayout(
        "Verify Your Email",
        `
        <h2 style="text-align: center; color: ${BRAND.dark}; margin-top: 0;">Verify Your Identity</h2>
        <p>Welcome to the tribe. Use the code below to complete your verification or login request.</p>
        <div class="code">${otp}</div>
        <p style="text-align: center; font-size: 13px; color: #666;">This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        `
    ),

    orderConfirmation: (order, items) => {
        const itemsHtml = items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                <span style="font-weight: 500;">${item.quantity}x ${item.productTitle || 'Premium Shilajit'} <span style="color: #666; font-size: 12px;">(${item.variantName || 'Bundle'})</span></span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `).join('');

        const address = order.shippingAddress;
        
        return emailLayout(
            `Order #${order.orderNumber} Confirmed`,
            `
            <h2 style="color: ${BRAND.dark}; margin-top: 0;">Order Confirmed</h2>
            <p>Thank you for your investment in your health, <strong>${order.customerName}</strong>.</p>
            <p>We have received your order <strong>#${order.orderNumber}</strong> and are preparing it for shipment from our Melbourne warehouse.</p>
            
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 16px;">Order Summary</h3>
                ${itemsHtml}
                <div style="margin-top: 15px; text-align: right; font-size: 18px; font-weight: bold; color: ${BRAND.color};">
                    Total: $${order.total.toFixed(2)}
                </div>
            </div>

            <h3 style="font-size: 16px;">Shipping To:</h3>
            <p style="color: #555; line-height: 1.5;">
                ${address.address}<br>
                ${address.city}, ${address.country} ${address.zip}
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${BRAND.website}/#/track" class="button">Track Order Status</a>
            </div>
            `
        );
    },

    shippingUpdate: (orderNumber, trackingNumber, carrier) => {
        const trackingUrl = carrier.toLowerCase().includes('dhl') 
            ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}&brand=DHL`
            : `https://auspost.com.au/mypost/track/#/details/${trackingNumber}`;

        return emailLayout(
            `Order #${orderNumber} Shipped`,
            `
            <h2 style="color: ${BRAND.dark}; margin-top: 0;">Your Order is on the Way!</h2>
            <p>Great news! Your supply of Himalaya Vitality has been dispatched and is making its way to you.</p>
            
            <div style="text-align: center; background-color: #fafafa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Tracking Number</p>
                <div style="font-size: 24px; font-weight: bold; color: ${BRAND.dark}; margin: 10px 0;">${trackingNumber}</div>
                <p style="margin: 0; font-size: 14px; color: #555;">Carrier: ${carrier}</p>
            </div>

            <div style="text-align: center;">
                <a href="${trackingUrl}" class="button">Track Your Package</a>
            </div>

            <p style="margin-top: 30px; font-size: 13px; color: #666;">Note: It may take up to 24 hours for the tracking information to update on the carrier's website.</p>
            `
        );
    }
};

const sendEmail = async (to, subject, htmlContent) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Skipping email: Credentials not found.");
            return;
        }
        await transporter.sendMail({ 
            from: `"${BRAND.name}" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            html: htmlContent 
        });
        console.log(`[Email] Sent to ${to}: ${subject}`);
    } catch (e) { 
        console.error('[Email] Failed:', e); 
    }
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

// Validate Code - STRICT AUTH REQUIRED & RATE LIMITED
app.post('/api/discounts/validate', authenticate, authLimiter, async (req, res) => {
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

// Public Tracking Endpoint - GUEST CHECKOUT ORDER LOOKUP
app.get('/api/orders/:id/track', async (req, res) => {
    try {
        // Explicit selection to avoid 'updatedAt' errors if column missing in DB
        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.id },
            select: { 
                orderNumber: true, 
                status: true, 
                trackingNumber: true, 
                carrier: true,
                createdAt: true
            }
        });
        if (!order) return res.status(404).json({ error: 'Order not found. Check your ID.' });
        
        // Return a simplified object safe for public viewing
        res.json({
            orderNumber: order.orderNumber,
            status: order.status,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            date: new Date(order.createdAt).toLocaleDateString()
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ABANDONED CART RECOVERY: Capture Lead - RATE LIMITED
app.post('/api/checkout/lead', authLimiter, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    try {
        // Upsert subscriber with source "Checkout" or "Abandoned Cart"
        await prisma.subscriber.upsert({
            where: { email },
            update: {}, // Don't overwrite if exists
            create: { email, source: 'Abandoned Cart' }
        });
        res.json({ success: true });
    } catch (e) {
        // Silently fail for frontend
        res.json({ success: false });
    }
});

// CREATE ORDER - RATE LIMITED
app.post('/api/orders', checkoutLimiter, async (req, res) => {
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
            // Explicitly do NOT include updatedAt to prevent errors with legacy DB schema
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
            return { order, items: enrichedItems }; // Return enriched items for email
        });

        // Send Professional HTML Email
        const emailHtml = Templates.orderConfirmation(result.order, result.items);
        await sendEmail(customer.email, `Order Confirmation ${result.order.orderNumber}`, emailHtml);
        
        res.json({ success: true, orderId: result.order.orderNumber });
    } catch(e) { 
        console.error("Order error", e);
        res.status(500).json({ error: e.message || 'Failed to create order' }); 
    }
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        // Valid statuses including Fulfilled
        const validStatuses = ['Paid', 'Fulfilled', 'Delivered'];
        const { startDate, endDate } = req.query;
        
        // Parse date range (Default to last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

        // Define filter criteria for the selected range
        const metricsWhere = {
            status: { in: validStatuses },
            createdAt: { gte: start, lte: end }
        };

        // 1. Total Metrics (Filtered by range)
        const totalRevenue = (await prisma.order.aggregate({ 
            _sum: { total: true }, 
            where: metricsWhere
        }))._sum.total || 0;
        
        const totalOrders = await prisma.order.count({
            where: metricsWhere
        });

        const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

        // 2. Chart Data Aggregation (Daily Breakdown)
        const ordersInRange = await prisma.order.findMany({
            where: metricsWhere,
            select: { createdAt: true, total: true },
            orderBy: { createdAt: 'asc' }
        });

        // Initialize map with 0 for every day in range to have a continuous line
        const chartData = {};
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            chartData[d.toISOString().split('T')[0]] = 0;
        }

        // Fill with actual data
        ordersInRange.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0];
            if (chartData[date] !== undefined) {
                chartData[date] += o.total;
            } else {
                // In case of timezone edge cases or if order falls slightly outside initialized loop
                // (Though query should prevent this, good for safety)
                chartData[date] = (chartData[date] || 0) + o.total;
            }
        });

        const chart = Object.keys(chartData).map(date => ({
            date,
            revenue: chartData[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Trends (Compare vs Previous Period)
        const duration = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - duration);
        const prevEnd = start;

        const prevWhere = {
            status: { in: validStatuses },
            createdAt: { gte: prevStart, lte: prevEnd }
        };

        const prevRevenue = (await prisma.order.aggregate({ 
            _sum: { total: true }, 
            where: prevWhere 
        }))._sum.total || 0;

        const prevOrders = await prisma.order.count({ where: prevWhere });
        const prevAov = prevOrders ? prevRevenue / prevOrders : 0;
        
        const calculateTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        res.json({ 
            totalRevenue, 
            totalOrders, 
            avgOrderValue,
            trends: {
                revenue: calculateTrend(totalRevenue, prevRevenue),
                orders: calculateTrend(totalOrders, prevOrders),
                aov: calculateTrend(avgOrderValue, prevAov)
            },
            chart 
        });
    } catch (e) { 
        console.error("Stats Error:", e);
        res.status(500).json({ error: e.message }); 
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        // Explicitly select columns to exclude 'updatedAt' if schema is out of sync
        const orders = await prisma.order.findMany({ 
            orderBy: { createdAt: 'desc' }, 
            select: {
                id: true,
                orderNumber: true,
                customerName: true,
                customerEmail: true,
                shippingAddress: true,
                total: true,
                status: true,
                paymentId: true,
                trackingNumber: true,
                carrier: true,
                createdAt: true,
                items: true // Relation can be selected
            }
        });
        
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
        const { trackingNumber, carrier, notify } = req.body; // Added notify flag check if coming from frontend
        
        const order = await prisma.order.update({ 
            where: { orderNumber: req.params.id }, 
            data: { trackingNumber, carrier, status: 'Fulfilled' } 
        });

        // Send Shipping Email if tracking is added/updated
        if (notify !== false && trackingNumber) {
            const emailHtml = Templates.shippingUpdate(order.orderNumber, trackingNumber, carrier || 'Australia Post');
            await sendEmail(order.customerEmail, `Your Order #${order.orderNumber} is on the way!`, emailHtml);
        }

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
        const htmlContent = emailLayout(subject, message); // Wrap ad-hoc email in template
        for (const sub of subs) { await sendEmail(sub.email, subject, htmlContent); }
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
        
        // Send OTP Email
        const emailHtml = Templates.otp(otp);
        await sendEmail(email, 'Verify Your Email - Himalaya Vitality', emailHtml);
        
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
