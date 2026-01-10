
# Live Deployment & Database Integration Guide

This guide details how to move from "Mock Mode" to a production environment with a real PostgreSQL database.

---

## Phase 1: Database Setup (PostgreSQL)

We recommend **Neon**, **Supabase**, or **Railway** for hosting your Postgres database.

1.  **Create a Project**: Sign up for one of the providers above and create a new project.
2.  **Get Connection String**: Copy the "Transaction Pooler" connection string (usually starts with `postgres://...`).
3.  **Update Environment**:
    In your project root, create a `.env` file (if not exists) and add:
    ```env
    DATABASE_URL="postgres://user:password@host:5432/db?pgbouncer=true"
    DIRECT_URL="postgres://user:password@host:5432/db"
    ```
4.  **Run Migrations**:
    Apply the schema defined in `DATABASE_IMPLEMENTATION_GUIDE.md` to your live database.
    ```bash
    npx prisma migrate deploy
    ```
5.  **Seed Data** (Optional):
    If you have a seed script, run `npx prisma db seed` to populate initial products.

---

## Phase 2: The Backend Server

Because this is a React Single Page Application (SPA), you cannot connect directly to the database from the browser (it's insecure). You need a **Node.js/Express Server** to act as the middleman.

### 1. Create Server Directory
Create a new folder `server/` in your project root.

### 2. Initialize Server
Inside `server/`, run:
```bash
npm init -y
npm install express cors dotenv @prisma/client stripe
```

### 3. Create `server/index.js`
Paste this code to create the API that your Frontend will talk to:

```javascript
// server/index.js
require('dotenv').config({ path: '../.env' }); // Load .env from root
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- ENDPOINTS ---

// 1. Get Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: true }
    });
    res.json(product);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

// 2. Create Payment Intent (Checkout)
app.post('/api/create-payment-intent', async (req, res) => {
  const { items, currency } = req.body;
  // Calculate total on server to prevent client-side manipulation
  const amount = 1000; // Replace with real calculation logic based on DB prices
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency.toLowerCase(),
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

// 3. Create Order
app.post('/api/orders', async (req, res) => {
  const { customer, items, total, paymentId } = req.body;
  
  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: `HV-${Date.now()}`,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        shippingAddress: customer, // JSON
        total: total,
        status: 'PAID',
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
    res.json({ success: true, orderId: order.orderNumber });
  } catch (e) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// 4. Get Reviews
app.get('/api/reviews', async (req, res) => {
    const reviews = await prisma.review.findMany({ where: { status: 'APPROVED' }});
    res.json(reviews);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Phase 3: Connect Frontend to Backend

Now that your database and server are ready, you need to tell the Frontend to stop using Mock data and start talking to your new server.

### 1. Update Frontend Environment
In your **Root Directory**, edit (or create) `.env`:

```env
# Disable Mock Mode
VITE_USE_MOCK=false

# Point to your production server URL
# If testing locally, use http://localhost:3000
VITE_API_URL=https://your-backend-app.onrender.com
```

### 2. Verify `services/api.ts`
The file `services/api.ts` has been updated to automatically read these variables.
- If `VITE_USE_MOCK` is `false`, it uses `fetch()` to hit `VITE_API_URL`.
- If `VITE_USE_MOCK` is `true`, it uses the internal javascript mock data.

---

## Phase 4: Deployment Steps

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Go to Vercel -> New Project -> Import Repository.
3. **Important**: Add the Environment Variables in Vercel Settings:
   - `VITE_USE_MOCK`: `false`
   - `VITE_API_URL`: (Your backend URL, see below)
4. Click Deploy.

### Backend Deployment (Render / Railway)
Since Vercel is optimized for Next.js/Frontend, use **Render.com** for the Node.js backend.
1. Create a "Web Service" on Render connected to your repo.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install`.
4. Set Start Command: `node index.js`.
5. Add Environment Variables:
   - `DATABASE_URL`: (Your neon/supabase string)
   - `STRIPE_SECRET_KEY`: (Your Stripe key)
6. **Copy the Render URL** (e.g., `https://himalaya-api.onrender.com`) and paste it into your Frontend Vercel Environment variables as `VITE_API_URL`.

---

## Phase 5: Go Live Checklist

- [ ] **Stripe**: Switch Stripe API keys from Test Mode (`pk_test_...`) to Live Mode (`pk_live_...`).
- [ ] **Database**: Ensure `npx prisma migrate deploy` ran successfully on the production DB.
- [ ] **CORS**: Ensure your Backend (`server/index.js`) allows requests from your Frontend Domain (`app.use(cors({ origin: 'https://your-frontend.vercel.app' }))`).
- [ ] **Admin User**: Manually insert an Admin User into the `User` table via your Database Dashboard so you can log in to `/admin`.
