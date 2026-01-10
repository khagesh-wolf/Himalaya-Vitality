
# Project Documentation: Himalaya Vitality

## 1. Project Overview
Himalaya Vitality is a conversion-focused, single-product eCommerce platform built to sell high-end Shilajit resin. The architecture prioritizes performance (Core Web Vitals), SEO, and a seamless checkout experience.

## 2. Tech Stack

- **Frontend**: React 18, TailwindCSS, Lucide Icons, Framer Motion (animations).
- **Backend (API)**: Next.js API Routes (Serverless Functions) or standalone Node.js.
- **Database**: PostgreSQL with Prisma ORM.
- **Payments**: Stripe Payment Intents API.
- **State Management**: React Context API (`CartContext`, `CurrencyContext`).
- **Data Fetching**: TanStack Query (React Query) for caching and optimistic updates.
- **Validation**: Zod + React Hook Form.

## 3. Architecture

### Directory Structure
```
/
├── components/         # Reusable UI components (Buttons, Cards, Modals)
├── context/           # Global State (Cart, Auth, Currency)
├── pages/             # Route components
├── services/          # API adapter layer (fetch wrappers)
├── types/             # TypeScript interfaces
├── utils/             # Helper functions (Currency formatting, Shipping logic)
└── prisma/            # Database schema and migrations
```

### Key Flows

#### Checkout Flow
1. **Cart**: User adds items. `CartContext` persists to LocalStorage.
2. **Checkout Init**: `/checkout` mounts.
   - Client fetches current exchange rates.
   - Client calls `/api/create-payment-intent` with cart items.
   - Server calculates total (server-side authority) and creates Stripe Intent.
   - Server returns `clientSecret`.
3. **Payment**: Stripe Elements collects card data and confirms payment directly with Stripe.
4. **Order Creation**: 
   - On success, Webhook triggers `order.created` (Server-side) OR Client calls `/api/orders` to record the transaction immediately.

#### Internationalization
- **Currency**: Detected via IP or Browser settings. Exchange rates fetched from API and cached.
- **Shipping**: Dynamic calculation based on ISO country codes defined in `utils.ts` and managed in Admin Dashboard.

## 4. Design System
- **Typography**: `Montserrat` (Headings) + `Inter` (Body).
- **Color Palette**:
  - Primary: Brand Red (`#D0202F`)
  - Secondary: Deep Black (`#111111`)
  - Accent: Gold (`#FACC15`)
- **Spacing**: 8pt grid system.

## 5. SEO Strategy
- **Meta Tags**: Dynamic generation via `SEO.tsx` component.
- **Schema.org**: JSON-LD injected for `Product`, `BreadcrumbList`, `Article`, and `Organization`.
- **Sitemap**: Auto-generated listing all static pages and blog posts.
