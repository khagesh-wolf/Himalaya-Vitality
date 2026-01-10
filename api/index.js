
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Stripe (Only if key is present)
const stripe = process.env.STRIPE_SECRET_KEY 
    ? require('stripe')(process.env.STRIPE_SECRET_KEY) 
    : null;

const app = express();

// Allow CORS for the frontend
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Health Check
app.get('/api/health', (req, res) => res.send('API is Online'));

// --- STOREFRONT ROUTES ---

// Get Product
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findFirst({
            where: { id: id },
            include: { variants: true }
        });
        
        if (!product) {
             // Fallback: If specific ID not found, return the first product
             const firstProduct = await prisma.product.findFirst({ include: { variants: true }});
             if(firstProduct) return res.json(firstProduct);
             return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error("Product Fetch Error:", error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Get Public Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        console.error("Review Fetch Error:", error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe is not configured' });
    const { items, currency } = req.body;
    try {
        let total = 0;
        for (const item of items) {
             const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId }});
             if (variant) total += Number(variant.price) * item.quantity;
        }
        if (total === 0) throw new Error("Total calculated to 0");

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: currency.toLowerCase() || 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Order
app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                orderNumber: `HV-${Date.now().toString().slice(-6)}`,
                customerEmail: customer.email,
                customerName: `${customer.firstName} ${customer.lastName}`,
                shippingAddress: customer,
                total: total,
                status: 'Paid',
                paymentId: paymentId,
                items: {
                    create: items.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });
        
        // Update Stock
        for (const item of items) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        res.json({ success: true, orderId: order.orderNumber });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Subscribe (Newsletter)
app.post('/api/subscribe', async (req, res) => {
    const { email, source } = req.body;
    try {
        const sub = await prisma.subscriber.create({
            data: { email, source }
        });
        res.json(sub);
    } catch (error) {
        // Ignore unique constraint errors
        res.json({ status: 'subscribed' });
    }
});

// --- ADMIN ROUTES ---

// Get Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ select: { total: true } });
        const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        res.json({ totalRevenue, totalOrders, avgOrderValue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get All Orders
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        // Map to frontend format
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            customer: o.customerName,
            email: o.customerEmail,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status,
            items: o.items.length
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update Order Status
app.put('/api/admin/orders/:id', async (req, res) => {
    const { id } = req.params; // Expects orderNumber e.g. HV-12345
    const { status } = req.body;
    try {
        const order = await prisma.order.update({
            where: { orderNumber: id },
            data: { status }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Update Product (Variants Only)
app.put('/api/admin/products/:id', async (req, res) => {
    const { id } = req.params;
    const { variants } = req.body;
    // NOTE: Title and Description updates are ignored as they are managed by constants.ts
    
    try {
        // Update Variants Only
        if (variants && variants.length > 0) {
            for (const v of variants) {
                // Ensure we only update existing variants
                await prisma.productVariant.update({
                    where: { id: v.id },
                    data: {
                        price: v.price,
                        compareAtPrice: v.compareAtPrice,
                        stock: v.stock
                    }
                });
            }
        }
        res.json({ success: true, message: "Prices and Stock Updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product variants' });
    }
});

// Get Discounts
app.get('/api/admin/discounts', async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany();
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
});

// Create Discount
app.post('/api/admin/discounts', async (req, res) => {
    try {
        const discount = await prisma.discount.create({
            data: req.body
        });
        res.json(discount);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create discount' });
    }
});

// Delete Discount
app.delete('/api/admin/discounts/:id', async (req, res) => {
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete discount' });
    }
});

// Admin Reviews (All)
app.get('/api/admin/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Update Review Status
app.put('/api/admin/reviews/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const review = await prisma.review.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Delete Review
app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
        await prisma.review.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// Get Subscribers
app.get('/api/admin/subscribers', async (req, res) => {
    try {
        const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
        // Format date
        const formatted = subs.map(s => ({ ...s, date: new Date(s.createdAt).toLocaleDateString() }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

// Get Inventory Logs (Mocked logic for now, or implement real logging table)
app.get('/api/admin/inventory-logs', async (req, res) => {
    try {
        const logs = await prisma.inventoryLog.findMany({ orderBy: { createdAt: 'desc' } });
        const formatted = logs.map(l => ({ ...l, date: new Date(l.createdAt).toLocaleString() }));
        res.json(formatted);
    } catch (error) {
        // Return empty if table not exists or error
        res.json([]); 
    }
});

// Export for Vercel Serverless
module.exports = app;
