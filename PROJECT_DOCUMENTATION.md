# Project Documentation: Himalaya Vitality

## 1. Project Overview
Himalaya Vitality is a premium, single-product eCommerce platform designed for high conversion rates and operational efficiency. It sells Himalayan Shilajit Resin with a focus on educational content, trust, and speed.

## 2. Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Framer Motion.
- **Backend**: Node.js, Express (running as Serverless Function).
- **Database**: PostgreSQL (Neon Tech) via Prisma ORM.
- **Payments**: Stripe (Payment Intents + Elements).
- **Email**: Nodemailer (SMTP).
- **State**: React Context API + TanStack Query (React Query).

## 3. Directory Structure

```
/
├── api/                # Express Backend Entry Point
├── prisma/             # Database Schema & Seed Scripts
├── src/
│   ├── components/     # UI Components (Atomic Design)
│   ├── context/        # Global State (Auth, Cart, Currency)
│   ├── pages/          # Route Views (Admin, Shop, Checkout)
│   ├── services/       # API Fetch Wrappers
│   └── types/          # TypeScript Interfaces
└── public/             # Static Assets
```

## 4. Key Workflows

### Checkout Process
1.  **Guest/User**: User adds items to Cart (LocalStorage).
2.  **Order Summary**: Cart calculates dynamic totals, including bundle logic.
3.  **Checkout Page**:
    *   **Step 1**: User enters Address. System calculates Shipping based on `ShippingRegion` table.
    *   **Step 2**: Backend creates Stripe PaymentIntent.
    *   **Step 3**: User pays via Stripe Elements.
    *   **Step 4**: On success, Order is created in DB, Inventory is deducted, and Confirmation Email is sent.

### Admin Dashboard
Access via `/admin`. Requires `ADMIN` role.
- **Stats**: Real-time revenue/order graphs.
- **Orders**: View details, update status to "Fulfilled", enter Tracking Number (triggers email).
- **Products**: Manage Master Stock and Pricing.
- **Marketing**: Manage Discount Codes and Newsletter Subscribers.

## 5. Security Features
- **JWT Auth**: HttpOnly methodology (conceptually) / Token storage.
- **Role-Based Access**: Middleware protects `/admin` routes.
- **Input Validation**: Zod schemas used on Checkout and Profile forms.
- **Payment Security**: PCI compliance via Stripe Elements (no raw card data touches server).
