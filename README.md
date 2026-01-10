
# Himalaya Vitality - Premium eCommerce Platform

![Himalaya Vitality Banner](https://placehold.co/1200x400/111111/D0202F?text=Himalaya+Vitality)

A high-performance, conversion-optimized eCommerce web application for a single-product premium supplement brand. Built with modern web technologies to ensure speed, SEO dominance, and a seamless global checkout experience.

## 🚀 Features

- **Performance First**: Built on React/Vite with aggressive code splitting and asset optimization.
- **Global Commerce**: Multi-currency support and dynamic shipping calculation logic.
- **Conversion Optimized**: 
  - Sticky Add-to-Cart
  - Bundle Logic (Single/Double/Triple packs)
  - One-page Checkout experience
- **Admin Dashboard**: Complete management of Orders, Products, Reviews, and Inventory.
- **SEO Ready**: JSON-LD Schema markup, semantic HTML, and OpenGraph tagging.
- **Secure**: Integration ready for Stripe Elements and Zod validation.

## 📚 Documentation

Detailed documentation has been generated for this project:

- [**Technical Setup Guide**](./TECHNICAL_SETUP_GUIDE.md): How to install and run locally.
- [**Database Implementation**](./DATABASE_IMPLEMENTATION_GUIDE.md): Prisma schema and data models.
- [**Database Optimization**](./DATABASE_OPTIMIZATION.md): Indexing and caching strategies for scale.
- [**Deployment Guide**](./DEPLOYMENT.md): Steps to push to Vercel/Netlify.
- [**Project Documentation**](./PROJECT_DOCUMENTATION.md): Architecture overview.

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

## 🏗️ Architecture

The app is currently configured in a **Hybrid Mode**:
1. **Frontend**: Fully functional React SPA.
2. **Backend Adapter**: Located in `services/api.ts`. It acts as a bridge. It currently returns mock data for demonstration purposes but is structured to easily switch to a real REST API by toggling a flag.

## 📄 License

Proprietary software developed for Himalaya Vitality.
