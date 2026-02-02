# Technical Setup Guide

## System Requirements
- **Node.js**: v18.17.0 or higher (Recommended: v20 LTS).
- **npm** or **pnpm**.
- **PostgreSQL Database**: Local Docker instance or a cloud provider (Neon, Supabase).

## 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/himalaya-vitality.git
cd himalaya-vitality
npm install
```

## 2. Environment Configuration

Create a `.env` file in the root directory. Use the following template:

```env
# --- DATABASE (Neon / Supabase) ---
# Connection Pool URL (Transaction Mode)
DATABASE_URL="postgres://user:pass@host:5432/db?sslmode=require&pgbouncer=true"
# Direct Connection URL (Session Mode - Required for Migrations)
DIRECT_URL="postgres://user:pass@host:5432/db?sslmode=require"

# --- AUTHENTICATION ---
JWT_SECRET="generate-a-secure-random-string-here"
# Optional: Google OAuth Client ID for Social Login
VITE_GOOGLE_CLIENT_ID="your-google-client-id"

# --- PAYMENTS (Stripe) ---
# Secret Key (Backend)
STRIPE_SECRET_KEY="sk_test_..."
# Publishable Key (Frontend)
VITE_STRIPE_PUBLIC_KEY="pk_test_..."

# --- EMAIL (SMTP / Nodemailer) ---
# Used for Order Confirmations and OTPs
EMAIL_USER="support@himalayavitality.com"
EMAIL_PASS="your-app-password"

# --- APP CONFIG ---
VITE_API_URL="/api"
PORT=3000
```

## 3. Database Initialization

We use Prisma ORM. You need to push the schema to your database and seed initial data.

```bash
# This command generates the client, pushes schema, and runs the seed script
npm run db:init
```

If you encounter connection errors, ensure your `DATABASE_URL` and `DIRECT_URL` are correct in `.env`.

## 4. Running Development Server

The project runs both the Frontend (Vite) and the Backend (Express) concurrently or via proxy in development.

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5173/api (Proxied to Express)

## 5. Development Workflow

- **Schema Changes**: If you modify `prisma/schema.prisma`, run:
  ```bash
  npx prisma generate
  npx prisma db push
  ```
- **Admin Access**:
  - Visit `/admin/login`.
  - Ensure your user has `role: "ADMIN"` in the database.
  - You can manually promote a user via Prisma Studio: `npx prisma studio`.

## 6. Testing Payments
In Development mode with Test keys:
- Use Stripe Test Cards (e.g., `4242 4242 4242 4242`).
- Any future date, any CVC.
