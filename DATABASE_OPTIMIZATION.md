
# Database Optimization Strategy

## Overview
This document outlines the performance tuning and optimization strategies for the Himalaya Vitality PostgreSQL database (hosted on Neon/Supabase) accessed via Prisma ORM.

## 1. Indexing Strategy

To ensure sub-100ms query times for critical paths (Product Page, Checkout), the following indexes must be applied in the `schema.prisma` file:

### Product Catalog
- **Composite Index on Product Variants**: `@@index([productId, type])` to quickly fetch specific bundle configurations.
- **Search Index**: GIN index on `Product.title` and `Product.description` for full-text search capabilities if not using an external search engine (Algolia/Typesense).

### Orders
- **Customer Lookup**: `@@index([customerEmail])` for fast order history retrieval.
- **Status Filtering**: `@@index([status, date])` for the admin dashboard to quickly filter "Pending" or "Fulfilled" orders sorted by date.

### Reviews
- **Product Reviews**: `@@index([productId, rating])` to efficiently calculate average ratings and fetch reviews for specific products.
- **Status**: `@@index([status])` for admin moderation queues.

## 2. Connection Pooling

Since Next.js runs in a serverless environment (Vercel Functions), opening a new database connection for every request will exhaust the connection limit.

- **Implementation**: Use a connection pooler like **PgBouncer** (built-in with Neon/Supabase).
- **Prisma Config**: Update the connection string to use the pooler URL:
  ```env
  DATABASE_URL="postgres://user:pass@host:6543/db?pgbouncer=true"
  DIRECT_URL="postgres://user:pass@host:5432/db"
  ```

## 3. Caching Strategy (Redis/Upstash)

Database hits should be minimized for static content.

### Critical Cache Keys
- **Product Data**: `product:{id}`. TTL: 1 hour. Invalidate on Admin update.
- **Review Stats**: `product:{id}:reviews:stats`. TTL: 15 minutes. Recompute on new review approval.
- **Inventory**: **DO NOT CACHE** inventory levels for checkout. Always read from the primary database or use atomic Redis counters (`INCR/DECR`) for high-concurrency stock management.

## 4. Query Optimization Tips (Prisma)

- **Select Specific Fields**: Avoid `findMany()` without a `select` clause. Only fetch the data needed for the UI.
  ```ts
  // Bad
  const orders = await prisma.order.findMany();
  
  // Good
  const orders = await prisma.order.findMany({
    select: { id: true, total: true, status: true }
  });
  ```
- **Pagination**: Use cursor-based pagination for Reviews and Order History instead of `skip/take` for better performance on large datasets.

## 5. Maintenance
- **Vacuuming**: Ensure auto-vacuuming is enabled on Postgres to prevent bloat.
- **Analyze**: Run `ANALYZE` after bulk imports to update query planner statistics.
