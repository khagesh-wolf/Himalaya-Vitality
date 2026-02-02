# Deployment Guide

This application is architected to run on **Vercel** as a hybrid app:
1.  **Frontend**: Static assets built by Vite.
2.  **Backend**: The Express API (`api/index.js`) is deployed as a Serverless Function using Vercel Rewrites.

## 1. Database Provisioning (Neon / Supabase)

1.  Create a PostgreSQL database.
2.  Obtain two connection strings:
    *   **Pooled**: For the application (`DATABASE_URL`).
    *   **Direct**: For migrations (`DIRECT_URL`).

## 2. Vercel Configuration

The repository includes a `vercel.json` file which handles the routing:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 3. Deployment Steps

1.  **Push to GitHub**: Ensure your code is committed.
2.  **Import to Vercel**: Connect your repository.
3.  **Build Settings**:
    *   Framework: **Vite**
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
    *   Install Command: `npm install`
4.  **Environment Variables**:
    Go to **Settings > Environment Variables** and add:

    | Variable | Value Description |
    |----------|-------------------|
    | `DATABASE_URL` | Pooled Postgres URL |
    | `DIRECT_URL` | Direct Postgres URL |
    | `JWT_SECRET` | Secure random string |
    | `STRIPE_SECRET_KEY` | Stripe Live Secret Key |
    | `VITE_STRIPE_PUBLIC_KEY` | Stripe Live Publishable Key |
    | `EMAIL_USER` | SMTP Username/Email |
    | `EMAIL_PASS` | SMTP Password |
    | `VITE_API_URL` | Set to `/api` (for relative pathing on same domain) |

5.  **Deploy**: Click Deploy.

## 4. Post-Deployment

After deployment, Vercel will build the frontend and serve the `api/index.js` file as a function.

1.  **Run Migrations**: You may need to run migrations against the production DB from your *local* machine:
    ```bash
    # Update .env locally to point to production DB
    npx prisma db push
    ```
2.  **Seed Data**:
    ```bash
    node prisma/seed.js
    ```
3.  **Create Admin**: Manually update a user in the database to role `ADMIN` to access the dashboard.

## 5. Troubleshooting 500 Errors

If the API returns 500 errors:
1.  Check **Vercel Logs** > **Functions**.
2.  Common issue: Database connection timeout. Ensure `?connect_timeout=30` or `60` is appended to your `DATABASE_URL` in Vercel settings.
3.  Common issue: Missing Environment Variables.
