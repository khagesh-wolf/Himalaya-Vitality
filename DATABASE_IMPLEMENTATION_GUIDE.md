
# Database Implementation Guide

## 1. The Schema (Copy this to prisma/schema.prisma)

This schema is configured to handle the "Direct URL" requirement for Neon/Supabase and matches your frontend data structure exactly, including Admin Panel features like Discounts and Inventory Logs.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Product {
  id          String           @id
  title       String
  description String
  rating      Float            @default(5.0)
  reviewCount Int              @default(0)
  features    String[]
  images      String[]
  variants    ProductVariant[]
  reviews     Review[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model ProductVariant {
  id             String   @id
  productId      String
  product        Product  @relation(fields: [productId], references: [id])
  type           String   // SINGLE, DOUBLE, TRIPLE
  name           String
  price          Float
  compareAtPrice Float
  label          String
  savings        String
  isPopular      Boolean  @default(false)
  stock          Int      @default(100)
}

model Review {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  author    String
  rating    Int
  title     String?
  content   String
  date      String   // Keeping as string to match "2 days ago" format from frontend
  verified  Boolean  @default(false)
  tags      String[]
  status    String   @default("Approved") // Approved, Pending, Hidden
  createdAt DateTime @default(now())
}

model Order {
  id            String      @id @default(uuid())
  orderNumber   String      @unique
  customerEmail String
  customerName  String
  shippingAddress Json
  total         Float
  status        String      // Paid, Pending, Fulfilled
  paymentId     String?
  items         OrderItem[]
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  variantId String
  quantity  Int
  price     Float
}

model Subscriber {
  id        String   @id @default(uuid())
  email     String   @unique
  source    String?
  createdAt DateTime @default(now())
}

model Discount {
  id        String   @id @default(uuid())
  code      String   @unique
  type      String   // PERCENTAGE, FIXED
  value     Float
  active    Boolean  @default(true)
  expiresAt String   @default("Never")
  createdAt DateTime @default(now())
}

model InventoryLog {
  id        String   @id @default(uuid())
  sku       String
  action    String   // RESTOCK, SALE, ADJUSTMENT
  quantity  Int
  user      String   @default("System")
  createdAt DateTime @default(now())
}
```

## 2. Environment Variables (.env)

Ensure your `.env` file looks exactly like this to avoid connection errors:

```env
# POOLED connection (Transaction mode) - Ends with ?pgbouncer=true
DATABASE_URL="postgres://[user]:[password]@[host]:5432/[db-name]?sslmode=require&pgbouncer=true"

# DIRECT connection (Session mode) - Standard URL
DIRECT_URL="postgres://[user]:[password]@[host]:5432/[db-name]?sslmode=require"
```

## 3. How to Apply

1.  **Install dependencies** (to ensure version match):
    ```bash
    npm install
    ```
2.  **Generate Client**:
    ```bash
    npx prisma generate
    ```
3.  **Push the schema**:
    ```bash
    npx prisma db push
    ```
4.  **Seed data**:
    ```bash
    node prisma/seed.js
    ```
