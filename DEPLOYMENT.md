
# Deployment Guide

## Prerequisites
- A **Vercel** account.
- A **PostgreSQL** database provider (Neon, Supabase, or AWS RDS).
- A **Stripe** account (for payments).
- A domain name (e.g., himalayavitality.com).

## 1. Database Setup (Production)

1. **Provision Database**: Create a new Postgres project.
2. **Get Connection Strings**: You need the Transaction Pooler URL (for `DATABASE_URL`) and the Session URL (for `DIRECT_URL`).
3. **Run Migrations**:
   Run the migration command locally pointing to the production DB to sync the schema.
   ```bash
   npx prisma migrate deploy
   ```

## 2. Environment Variables

Configure the following variables in Vercel **Settings > Environment Variables**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres Connection Pool URL |
| `DIRECT_URL` | Postgres Direct Connection URL (for migrations) |
| `NEXTAUTH_SECRET` | 32+ char random string for encryption |
| `NEXTAUTH_URL` | `https://himalayavitality.com` |
| `STRIPE_SECRET_KEY` | Stripe Live Secret Key (`sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Live Public Key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying Stripe webhooks |
| `RESEND_API_KEY` | API Key for transactional emails |
| `ADMIN_EMAIL` | Email address for admin notifications |

## 3. Vercel Deployment

1. **Connect Repository**: Import your GitHub/GitLab repository into Vercel.
2. **Framework Preset**: Vercel should auto-detect **Next.js**.
3. **Build Command**: `next build` (or `npm run build`).
4. **Install Command**: `npm install`.
5. **Deploy**: Click "Deploy".

## 4. Post-Deployment Configuration

### Webhooks
1. Go to the Stripe Dashboard > Developers > Webhooks.
2. Add Endpoint: `https://himalayavitality.com/api/webhooks/stripe`.
3. Select Events: `payment_intent.succeeded`, `charge.refunded`.

### Domain DNS
1. Add your custom domain in Vercel.
2. Update your registrar's Nameservers or A Records as instructed by Vercel.

### Admin Account
1. Access the database directly or use a seed script to create the initial Admin User if you haven't implemented a sign-up flow.

## 5. Monitoring
- **Vercel Analytics**: Enable for Core Web Vitals tracking.
- **Logs**: Monitor Vercel Runtime Logs for 500 errors.
- **Database**: Monitor connection count on your DB provider dashboard.
