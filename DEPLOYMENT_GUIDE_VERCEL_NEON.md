
# 🚀 Step-by-Step Deployment Guide (Vercel + Neon)

This guide assumes you have the project files locally on your computer.

## Phase 1: Local Setup

### 1. Install Dependencies
Open your terminal in the project folder and install the necessary packages for the backend and database.

```bash
# Install Prisma (Database ORM), Stripe, and Express
npm install prisma @prisma/client stripe express cors dotenv
```

### 2. Initialize Git (If not done)
```bash
git init
git add .
git commit -m "Initial commit"
```
*Push this to a GitHub repository.*

---

## Phase 2: Database Setup (Neon)

1.  Go to [Neon.tech](https://neon.tech) and Sign Up.
2.  Create a **New Project**.
3.  **Copy the Connection String**:
    *   Look for the **"Pooled connection string"** (It usually includes `-pooler` in the host or ends with `?pgbouncer=true`).
    *   Also look for the **"Direct connection string"**.
4.  Create a `.env` file in your project root locally:

    ```env
    # .env
    # Replace with YOUR Neon strings
    DATABASE_URL="postgres://user:pass@ep-xyz-pooler.region.aws.neon.tech/neondb?pgbouncer=true"
    DIRECT_URL="postgres://user:pass@ep-xyz.region.aws.neon.tech/neondb"
    
    # Stripe Keys (Get from Stripe Dashboard)
    STRIPE_SECRET_KEY="sk_test_..."
    
    # App Config
    VITE_USE_MOCK="false"
    ```

5.  **Push Schema to Database**:
    Run this command to create the tables in your Neon database based on `prisma/schema.prisma`.
    ```bash
    npx prisma db push
    ```

6.  **Seed the Database**:
    Run the seed script to add the initial Product and Reviews.
    ```bash
    node prisma/seed.js
    ```

---

## Phase 3: Vercel Deployment

### 1. Import to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.

### 2. Configure Build Settings
Vercel usually detects Vite/React automatically.
*   **Framework Preset**: Vite
*   **Build Command**: `npm run build` (Default)
*   **Output Directory**: `dist` (Default)

### 3. Configure Environment Variables
**Crucial Step**: You must add the environment variables in Vercel settings so the backend can access the database.

Add the following variables in the Vercel Project Settings:

| Name | Value |
|------|-------|
| `DATABASE_URL` | (Your Neon **Pooled** Connection String) |
| `DIRECT_URL` | (Your Neon **Direct** Connection String) |
| `STRIPE_SECRET_KEY` | (Your Stripe Secret Key `sk_live_...` or `sk_test_...`) |
| `VITE_USE_MOCK` | `false` |
| `VITE_API_URL` | (Leave empty or set to `/api`) |

### 4. Deploy
Click **"Deploy"**.

---

## Phase 4: Verification

1.  Wait for the deployment to finish.
2.  Open the Vercel URL (e.g., `https://himalaya-vitality.vercel.app`).
3.  **Test the Backend**:
    *   Go to `https://your-app.vercel.app/api/health`. It should say "OK".
    *   Go to `https://your-app.vercel.app/api/products/himalaya-shilajit-resin`. It should return JSON data from your Neon database.
4.  **Test the App**:
    *   Go to the Product Page. It should load data from the DB.
    *   Add to Cart -> Checkout.
    *   The Payment Element should load (if Stripe key is valid).

## Troubleshooting

**Error: 500 on /api routes**
*   Check Vercel Logs (Dashboard -> Project -> Logs).
*   Ensure `DATABASE_URL` is set correctly in Vercel.
*   Ensure `stripe` and `@prisma/client` are in `dependencies` in `package.json`, not `devDependencies`.

**Error: "Prisma Client could not find its schema"**
*   In `package.json`, add a postinstall script:
    ```json
    "scripts": {
      "postinstall": "prisma generate"
    }
    ```
    This ensures Vercel generates the Prisma Client during the build process.
