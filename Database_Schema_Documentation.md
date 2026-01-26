# Database Schema Documentation: Himalaya Vitality

**Author**: Manus AI
**Date**: January 26, 2026

## Overview

This document provides comprehensive documentation of the database schema for the Himalaya Vitality eCommerce platform. The schema is defined using Prisma ORM and uses PostgreSQL as the underlying database system.

## Schema File Location

`/prisma/schema.prisma`

## Database Configuration

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

The schema uses two connection strings:
- `DATABASE_URL`: Connection pooling URL (used by Prisma Client)
- `DIRECT_URL`: Direct connection URL (used for migrations)

This dual-URL approach is optimized for serverless environments like Vercel, where connection pooling is essential.

---

## Data Models

### 1. User Model

**Purpose**: Stores customer and admin user accounts.

**Table Name**: `User`

| Field         | Type       | Constraints                | Description                                    |
| ------------- | ---------- | -------------------------- | ---------------------------------------------- |
| `id`          | String     | @id, @default(uuid())      | Unique identifier (UUID)                       |
| `email`       | String     | @unique                    | User's email address (used for login)          |
| `password`    | String?    | Nullable                   | Hashed password (null for OAuth users)         |
| `name`        | String?    | Nullable                   | User's full name                               |
| `role`        | String     | @default("CUSTOMER")       | User role: "CUSTOMER" or "ADMIN"               |
| `avatar`      | String?    | Nullable                   | Profile picture URL                            |
| `provider`    | String     | @default("EMAIL")          | Auth provider: "EMAIL" or "GOOGLE"             |
| `firstName`   | String?    | Nullable                   | Billing/shipping first name                    |
| `lastName`    | String?    | Nullable                   | Billing/shipping last name                     |
| `phone`       | String?    | Nullable                   | Contact phone number                           |
| `address`     | String?    | Nullable                   | Street address                                 |
| `city`        | String?    | Nullable                   | City                                           |
| `country`     | String?    | Nullable                   | Country code                                   |
| `zip`         | String?    | Nullable                   | Postal/ZIP code                                |
| `isVerified`  | Boolean    | @default(false)            | Email verification status                      |
| `otp`         | String?    | Nullable                   | One-time password for email verification       |
| `otpExpires`  | DateTime?  | Nullable                   | OTP expiration timestamp                       |
| `createdAt`   | DateTime   | @default(now())            | Account creation timestamp                     |
| `updatedAt`   | DateTime   | @updatedAt                 | Last update timestamp                          |

**Relations**:
- `orders`: One-to-many relationship with `Order` model

**Indexes**: 
- Unique index on `email` (automatically created by @unique)

**Business Logic**:
- Password is hashed using bcrypt before storage (handled in backend)
- OAuth users have `password` set to null
- OTP is generated during signup and expires after 15 minutes
- Profile fields (firstName, lastName, etc.) are synced with checkout form

---

### 2. Product Model

**Purpose**: Stores product information (currently only one product: Himalayan Shilajit).

**Table Name**: `Product`

| Field          | Type     | Constraints         | Description                           |
| -------------- | -------- | ------------------- | ------------------------------------- |
| `id`           | String   | @id                 | Product identifier (slug-style)       |
| `title`        | String   |                     | Product name                          |
| `description`  | String   |                     | Product description                   |
| `rating`       | Float    | @default(5.0)       | Average rating (0-5)                  |
| `reviewCount`  | Int      | @default(0)         | Total number of reviews               |
| `features`     | String[] |                     | Array of product features             |
| `images`       | String[] |                     | Array of image URLs                   |
| `createdAt`    | DateTime | @default(now())     | Product creation timestamp            |
| `updatedAt`    | DateTime | @updatedAt          | Last update timestamp                 |

**Relations**:
- `variants`: One-to-many relationship with `ProductVariant` model
- `reviews`: One-to-many relationship with `Review` model

**Notes**:
- The `id` field uses a custom string (e.g., "himalaya-shilajit-resin") rather than auto-generated UUID
- `features` and `images` are PostgreSQL array types

---

### 3. ProductVariant Model

**Purpose**: Stores different bundle options for a product (Single, Double, Triple pack).

**Table Name**: `ProductVariant`

| Field             | Type    | Constraints         | Description                              |
| ----------------- | ------- | ------------------- | ---------------------------------------- |
| `id`              | String  | @id                 | Variant identifier                       |
| `productId`       | String  |                     | Foreign key to Product                   |
| `type`            | String  |                     | Bundle type: "SINGLE", "DOUBLE", "TRIPLE"|
| `name`            | String  |                     | Display name (e.g., "Starter Pack")      |
| `price`           | Float   |                     | Current price in USD                     |
| `compareAtPrice`  | Float   |                     | Original price (for showing savings)     |
| `label`           | String  |                     | Subtitle (e.g., "1 Month Supply")        |
| `savings`         | String  |                     | Savings text (e.g., "Save $16")          |
| `isPopular`       | Boolean | @default(false)     | Flag for "Most Popular" badge            |
| `stock`           | Int     | @default(100)       | Available inventory count                |

**Relations**:
- `product`: Many-to-one relationship with `Product` model

**Business Logic**:
- Prices are stored in USD; frontend converts to other currencies
- Stock is decremented when orders are placed (future implementation)
- `compareAtPrice` is used to calculate discount percentage

---

### 4. Review Model

**Purpose**: Stores customer product reviews.

**Table Name**: `Review`

| Field        | Type     | Constraints            | Description                              |
| ------------ | -------- | ---------------------- | ---------------------------------------- |
| `id`         | String   | @id, @default(uuid())  | Unique identifier                        |
| `productId`  | String   |                        | Foreign key to Product                   |
| `author`     | String   |                        | Reviewer name                            |
| `rating`     | Int      |                        | Star rating (1-5)                        |
| `title`      | String?  | Nullable               | Review headline                          |
| `content`    | String   |                        | Review text                              |
| `date`       | String   |                        | Display date (e.g., "2 days ago")        |
| `verified`   | Boolean  | @default(false)        | Verified purchase badge                  |
| `tags`       | String[] |                        | Category tags (e.g., "Energy", "Athlete")|
| `status`     | String   | @default("Approved")   | Moderation status                        |
| `createdAt`  | DateTime | @default(now())        | Creation timestamp                       |

**Relations**:
- `product`: Many-to-one relationship with `Product` model

**Status Values**:
- "Approved": Visible on frontend
- "Pending": Awaiting moderation
- "Hidden": Not displayed
- "Spam": Marked as spam

**Notes**:
- `date` is stored as a string for display flexibility (e.g., "2 days ago" vs "2024-01-15")
- Reviews can be filtered by tags on the frontend

---

### 5. Order Model

**Purpose**: Stores completed customer orders.

**Table Name**: `Order`

| Field              | Type     | Constraints            | Description                           |
| ------------------ | -------- | ---------------------- | ------------------------------------- |
| `id`               | String   | @id, @default(uuid())  | Unique identifier                     |
| `orderNumber`      | String   | @unique                | Human-readable order ID (e.g., "HV-1234567890") |
| `userId`           | String?  | Nullable               | Foreign key to User (null for guest checkout) |
| `customerEmail`    | String   |                        | Customer email address                |
| `customerName`     | String   |                        | Full name (firstName + lastName)      |
| `shippingAddress`  | Json     |                        | Complete address object               |
| `total`            | Float    |                        | Order total in USD                    |
| `status`           | String   |                        | Order status                          |
| `paymentId`        | String?  | Nullable               | Stripe PaymentIntent ID               |
| `createdAt`        | DateTime | @default(now())        | Order creation timestamp              |

**Relations**:
- `user`: Many-to-one relationship with `User` model (optional)
- `items`: One-to-many relationship with `OrderItem` model

**Status Values**:
- "Pending": Payment initiated but not confirmed
- "Paid": Payment successful
- "Fulfilled": Order packed and shipped
- "Delivered": Order received by customer

**Shipping Address JSON Structure**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "New York",
  "country": "US",
  "zip": "10001",
  "phone": "+1234567890"
}
```

**Business Logic**:
- `orderNumber` is generated as `HV-{timestamp}` for easy reference
- Guest checkout is supported (userId is null)
- Address is stored as JSON snapshot to preserve data even if user updates profile

---

### 6. OrderItem Model

**Purpose**: Stores individual line items within an order.

**Table Name**: `OrderItem`

| Field       | Type   | Constraints            | Description                        |
| ----------- | ------ | ---------------------- | ---------------------------------- |
| `id`        | String | @id, @default(uuid())  | Unique identifier                  |
| `orderId`   | String |                        | Foreign key to Order               |
| `variantId` | String |                        | Product variant ID                 |
| `quantity`  | Int    |                        | Quantity purchased                 |
| `price`     | Float  |                        | Price per unit at time of purchase |

**Relations**:
- `order`: Many-to-one relationship with `Order` model

**Business Logic**:
- Price is captured at time of purchase to preserve historical data
- `variantId` references `ProductVariant.id` but is not a foreign key (allows for deleted products)

---

### 7. Subscriber Model

**Purpose**: Stores newsletter email subscriptions.

**Table Name**: `Subscriber`

| Field       | Type     | Constraints            | Description                    |
| ----------- | -------- | ---------------------- | ------------------------------ |
| `id`        | String   | @id, @default(uuid())  | Unique identifier              |
| `email`     | String   | @unique                | Subscriber email address       |
| `source`    | String?  | Nullable               | Subscription source (e.g., "homepage", "checkout") |
| `createdAt` | DateTime | @default(now())        | Subscription timestamp         |

**Business Logic**:
- Email uniqueness prevents duplicate subscriptions
- `source` tracks where the subscription came from for analytics

---

### 8. Discount Model

**Purpose**: Stores discount/promo codes.

**Table Name**: `Discount`

| Field       | Type     | Constraints            | Description                          |
| ----------- | -------- | ---------------------- | ------------------------------------ |
| `id`        | String   | @id, @default(uuid())  | Unique identifier                    |
| `code`      | String   | @unique                | Discount code (e.g., "WELCOME10")    |
| `type`      | String   |                        | "PERCENTAGE" or "FIXED"              |
| `value`     | Float    |                        | Discount amount (10 = 10% or $10)    |
| `active`    | Boolean  | @default(true)         | Whether code is currently active     |
| `expiresAt` | String   | @default("Never")      | Expiration date (stored as string)   |
| `createdAt` | DateTime | @default(now())        | Creation timestamp                   |

**Business Logic**:
- `type` determines how `value` is interpreted:
  - "PERCENTAGE": `value` is percentage off (e.g., 10 = 10% off)
  - "FIXED": `value` is dollar amount off (e.g., 10 = $10 off)
- Codes are case-insensitive in the application logic
- Admin can deactivate codes without deleting them

---

### 9. InventoryLog Model

**Purpose**: Tracks inventory changes for auditing.

**Table Name**: `InventoryLog`

| Field       | Type     | Constraints            | Description                          |
| ----------- | -------- | ---------------------- | ------------------------------------ |
| `id`        | String   | @id, @default(uuid())  | Unique identifier                    |
| `sku`       | String   |                        | Product variant identifier           |
| `action`    | String   |                        | Type of action                       |
| `quantity`  | Int      |                        | Quantity changed (+ or -)            |
| `user`      | String   | @default("System")     | User who made the change             |
| `createdAt` | DateTime | @default(now())        | Timestamp of change                  |

**Action Types**:
- "RESTOCK": Inventory added
- "SALE": Inventory sold
- "ADJUSTMENT": Manual correction

**Business Logic**:
- Provides audit trail for inventory changes
- `quantity` can be positive (increase) or negative (decrease)
- `user` defaults to "System" for automated changes

---

### 10. BlogPost Model

**Purpose**: Stores blog articles and content marketing.

**Table Name**: `BlogPost`

| Field       | Type     | Constraints            | Description                    |
| ----------- | -------- | ---------------------- | ------------------------------ |
| `id`        | String   | @id, @default(uuid())  | Unique identifier              |
| `slug`      | String   | @unique                | URL-friendly identifier        |
| `title`     | String   |                        | Article title                  |
| `excerpt`   | String   |                        | Short summary                  |
| `content`   | String   |                        | Full article HTML              |
| `author`    | String   |                        | Author name                    |
| `date`      | String   |                        | Display date                   |
| `image`     | String   |                        | Featured image URL             |
| `category`  | String   |                        | Article category               |
| `published` | Boolean  | @default(true)         | Publish status                 |
| `createdAt` | DateTime | @default(now())        | Creation timestamp             |
| `updatedAt` | DateTime | @updatedAt             | Last update timestamp          |

**Business Logic**:
- `slug` is used in URLs (e.g., `/blog/benefits-of-shilajit`)
- `content` stores HTML markup for rich formatting
- Unpublished posts (`published: false`) are hidden from frontend

---

## Relationships Diagram

```
User (1) ──────< (N) Order
                      │
                      └──< (N) OrderItem

Product (1) ──────< (N) ProductVariant
    │
    └──< (N) Review
```

---

## Database Seeding

**Seed File**: `/prisma/seed.js`

The seed script initializes the database with:
1. **Main Product**: "Pure Himalayan Shilajit Resin"
2. **Three Variants**: Single, Double, Triple packs
3. **Sample Reviews**: 3 approved customer reviews
4. **Default Discount**: "WELCOME10" code (10% off)

**Running the Seed**:
```bash
npm run seed
```

**Behavior**:
- Uses `upsert` to prevent duplicate products
- Checks if reviews exist before adding to prevent duplicates on re-seeding
- Safe to run multiple times

---

## Migrations

Prisma migrations are stored in `/prisma/migrations/` directory.

**Key Commands**:
- `npx prisma migrate dev`: Create and apply new migration
- `npx prisma migrate deploy`: Apply migrations in production
- `npx prisma db push`: Push schema changes without creating migration (dev only)
- `npx prisma studio`: Open database GUI

---

## Indexing Strategy

### Current Indexes

1. **User.email**: Unique index (for login lookups)
2. **Order.orderNumber**: Unique index (for order tracking)
3. **Discount.code**: Unique index (for code validation)
4. **Subscriber.email**: Unique index (prevents duplicates)
5. **BlogPost.slug**: Unique index (for URL routing)

### Recommended Additional Indexes

For production optimization, consider adding:

```prisma
@@index([createdAt])  // On Order model for date-based queries
@@index([status])     // On Order model for filtering by status
@@index([productId])  // On Review model for product page queries
@@index([userId])     // On Order model for user order history
```

---

## Data Integrity & Constraints

### Referential Integrity

Prisma enforces referential integrity through foreign key constraints:
- Deleting a `Product` will cascade delete its `ProductVariant` and `Review` records
- Deleting a `User` will cascade delete their `Order` records
- Deleting an `Order` will cascade delete its `OrderItem` records

### Data Validation

Validation is handled at multiple levels:
1. **Database Level**: Unique constraints, not-null constraints
2. **Prisma Level**: Type checking, relation validation
3. **Application Level**: Zod schemas for input validation
4. **Frontend Level**: React Hook Form validation

---

## Performance Considerations

### Connection Pooling

The schema uses `directUrl` for migrations and `url` for queries, enabling connection pooling in serverless environments.

**Recommended Pool Size**:
- Development: 5-10 connections
- Production: 10-20 connections per region

### Query Optimization

**Efficient Queries**:
- Use `include` to fetch related data in single query
- Use `select` to fetch only needed fields
- Implement pagination for large result sets

**Example**:
```typescript
const orders = await prisma.order.findMany({
  take: 20,
  skip: page * 20,
  include: { items: true },
  orderBy: { createdAt: 'desc' }
});
```

---

## Security Considerations

### Sensitive Data

1. **Passwords**: Always hashed with bcrypt (never stored in plain text)
2. **Payment Info**: Never stored (handled by Stripe)
3. **OTP Codes**: Expire after 15 minutes

### SQL Injection Prevention

Prisma automatically parameterizes all queries, preventing SQL injection attacks.

### Data Privacy

- User passwords are excluded from API responses using destructuring:
  ```typescript
  const { password, otp, ...safeUser } = user;
  ```
- Admin endpoints are protected by role-based access control

---

## Backup & Recovery

### Recommended Backup Strategy

1. **Automated Daily Backups**: Configure database provider for daily snapshots
2. **Point-in-Time Recovery**: Enable WAL (Write-Ahead Logging) for PostgreSQL
3. **Export Critical Data**: Regularly export orders and customer data

### Data Export Script

```bash
npx prisma db pull  # Pull schema from database
npx prisma db seed  # Re-seed if needed
```

---

## Conclusion

The Himalaya Vitality database schema is designed for scalability, data integrity, and performance. It follows PostgreSQL best practices and leverages Prisma's type-safe ORM for robust data access. The schema supports both guest and authenticated checkout, comprehensive admin management, and detailed order tracking. Future enhancements could include adding indexes for frequently queried fields and implementing soft deletes for critical records.
