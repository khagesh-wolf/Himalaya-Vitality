# 🚀 Deployment Guide: Vercel + Neon

This specific guide covers deploying the Himalaya Vitality stack using Vercel for hosting and Neon for the database.

## 1. Database (Neon)

1.  Create a project at [Neon.tech](https://neon.tech).
2.  Go to **Dashboard > Connection Details**.
3.  **Pooled Connection**: Enable "Connection Pooling". Copy this URL. It ends with `pooler.region.neon.tech...`.
4.  **Direct Connection**: Copy the direct URL.

## 2. Application Config

1.  Clone the repo.
2.  Install dependencies: `npm install`.
3.  Update `prisma/schema.prisma` if needed.
4.  **Push Schema**:
    ```bash
    # Create .env with DIRECT_URL
    npx prisma db push
    ```

## 3. Vercel Deployment

1.  Install Vercel CLI or use the Web Dashboard.
2.  **Environment Variables** (Essential):
    *   `DATABASE_URL`: Paste the **Pooled** connection string. Append `?pgbouncer=true&connect_timeout=15`.
    *   `DIRECT_URL`: Paste the **Direct** connection string.
    *   `JWT_SECRET`: Random string.
    *   `VITE_API_URL`: `/api`
    *   `STRIPE_SECRET_KEY`: Live key.
    *   `VITE_STRIPE_PUBLIC_KEY`: Live key.

3.  **Deploy**:
    ```bash
    vercel --prod
    ```

## 4. Post-Launch

1.  **Seed Data**: Use the local seed script pointed at the remote DB to create the initial Product and Reviews.
    ```bash
    npm run seed
    ```
2.  **Webhooks**: Configure Stripe Webhooks to point to `https://your-domain.com/api/webhooks` (if webhook handling is implemented for async events).
