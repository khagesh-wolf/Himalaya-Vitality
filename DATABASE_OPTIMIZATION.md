# Database Optimization Strategy

## 1. Indexing (Applied)

The following indexes are defined in `schema.prisma` to ensure query performance:

- **Users**: `email` (Unique Index) for fast login lookups.
- **Orders**: `orderNumber` (Unique) for tracking page lookups.
- **Discounts**: `code` (Unique) for cart validation.
- **Discount Usage**: `@@index([userId])` and `@@index([guestEmail])` to prevent coupon abuse.
- **Shipping Regions**: `code` (Unique) for shipping calculation during checkout.

## 2. Connection Pooling

**Crucial for Serverless**: The application uses `api/index.js` deployed as a serverless function. Without pooling, traffic spikes would exhaust database connections immediately.

- **Neon/PgBouncer**: We use the Neon pooled connection string in production (`DATABASE_URL`).
- **Prisma Client**: Initialized *outside* the request handler in `api/index.js` to reuse the instance across "warm" function invocations.

## 3. Data Integrity

- **Transactions**: Order creation, Stock deduction, and Discount usage recording happen inside a `prisma.$transaction`. This ensures that if stock is missing or payment fails, the entire operation rolls back, preventing data drift.

## 4. Caching (Frontend)

- **TanStack Query**: The frontend aggressively caches product data (`staleTime: Infinity` for static product details) and user sessions to minimize API calls to the backend.
