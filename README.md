# Himalaya Vitality - Premium eCommerce Platform

![Himalaya Vitality Banner](https://placehold.co/1200x400/111111/D0202F?text=Himalaya+Vitality)

A high-performance, conversion-optimized eCommerce web application for a single-product premium supplement brand. Built with a modern full-stack architecture ensuring speed, SEO dominance, and a seamless global checkout experience.

## 🚀 Features

### Storefront
- **Performance First**: Built on React 19/Vite with aggressive code splitting and asset optimization.
- **Global Commerce**: Multi-currency support and dynamic shipping calculation based on region.
- **Conversion Optimized**: Sticky Add-to-Cart, Bundle Logic (Single/Double/Triple packs), and a one-page Checkout experience.
- **SEO Ready**: JSON-LD Schema markup, semantic HTML, and OpenGraph tagging.

### Backend & Admin
- **Custom Admin Dashboard**: Manage Orders, Products, Pricing, Subscribers, and Shipping Regions.
- **Real-time Inventory**: Master stock tracking with bundle logic deduction.
- **Order Fulfillment**: Update tracking numbers and automatically notify customers via email.
- **Analytics**: Revenue, AOV, and Order trends visualization.

### Security & Infrastructure
- **Secure Payments**: Integrated Stripe Payment Intents with PCI-compliant Elements.
- **Authentication**: Custom JWT-based authentication with Google OAuth support.
- **Database**: PostgreSQL with Prisma ORM (Connection Pooling enabled).

## 📚 Documentation

- [**Technical Setup Guide**](./TECHNICAL_SETUP_GUIDE.md): Installation and local development.
- [**Database Guide**](./DATABASE_IMPLEMENTATION_GUIDE.md): Prisma schema and data models.
- [**Deployment Guide**](./DEPLOYMENT_GUIDE_VERCEL_NEON.md): How to deploy to Vercel with Neon DB.
- [**Project Architecture**](./PROJECT_DOCUMENTATION.md): System overview.

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup Environment
# Copy .env.example to .env and fill in API keys
cp .env.example .env

# 3. Initialize Database
npm run db:init

# 4. Run local development server
npm run dev
```

## 🏗️ Architecture

The application uses a **Serverless Monolith** pattern:
1.  **Frontend**: React SPA served via Vite.
2.  **Backend**: Express.js app running as a Vercel Serverless Function (via `vercel.json` rewrites).
3.  **Database**: Neon Serverless PostgreSQL.

## 📄 License

Proprietary software developed for Himalaya Vitality.