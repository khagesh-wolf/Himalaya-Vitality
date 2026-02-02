
# Database Implementation Guide

## 1. Prisma Schema

The application uses PostgreSQL. Below is the definitive schema used in production. It handles Users, Products with dynamic inventory, Orders with tracking, and Admin configurations.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String?  // Nullable for OAuth/Guest users who register later
  name          String?
  role          String   @default("CUSTOMER") // 'CUSTOMER' or 'ADMIN'
  avatar        String?
  provider      String   @default("EMAIL")
  
  // Profile Fields
  firstName     String?
  lastName      String?
  phone         String?
  address       String?
  city          String?
  country       String?
  zip           String?

  // Verification
  isVerified    Boolean  @default(false)
  otp           String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  orders        Order[]
  discountUsage DiscountUsage[]
}

model Product {
  id          String           @id
  title       String
  description String
  rating      Float            @default(5.0)
  reviewCount Int              @default(0)
  features    String[]
  images      String[]
  totalStock  Int              @default(0) // Master Inventory
  variants    ProductVariant[]
  reviews     Review[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model ProductVariant {
  id             String   @id
  productId      String
  product        Product  @relation(fields: [productId], references: [id])
  type           String   // 'SINGLE', 'DOUBLE', 'TRIPLE'
  name           String
  price          Float
  compareAtPrice Float
  label          String
  savings        String
  isPopular      Boolean  @default(false)
}

model Order {
  id             String      @id @default(uuid())
  orderNumber    String      @unique // Format: HV-Timestamp
  
  userId         String?
  user           User?       @relation(fields: [userId], references: [id])
  
  customerEmail  String
  customerName   String
  shippingAddress Json       // Snapshot of address at time of order
  total          Float
  status         String      // 'Pending', 'Paid', 'Fulfilled', 'Delivered'
  paymentId      String?
  
  // Fulfillment
  trackingNumber String?
  carrier        String?
  
  items          OrderItem[]
  createdAt      DateTime    @default(now())
  // updatedAt removed to match production DB state
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  variantId String
  quantity  Int
  price     Float
}

model Review {
  id        String   @id @default(uuid())
  productId String?
  product   Product? @relation(fields: [productId], references: [id])
  author    String
  rating    Int
  title     String?
  content   String
  date      String   // Display date string
  verified  Boolean  @default(false)
  tags      String[]
  status    String   @default("Approved")
  createdAt DateTime @default(now())
}

model Discount {
  id        String          @id @default(uuid())
  code      String          @unique
  type      String          // 'PERCENTAGE' or 'FIXED'
  value     Float
  active    Boolean         @default(true)
  createdAt DateTime        @default(now())
  usages    DiscountUsage[]
}

model DiscountUsage {
  id         String   @id @default(uuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  guestEmail String?
  discountId String
  discount   Discount @relation(fields: [discountId], references: [id])
  usedAt     DateTime @default(now())
}

model ShippingRegion {
  id           String   @id @default(uuid())
  code         String   @unique // ISO Country Code (e.g., 'US', 'AU')
  name         String
  shippingCost Float
  taxRate      Float
  eta          String
  createdAt    DateTime @default(now())
}

model InventoryLog {
  id        String   @id @default(uuid())
  sku       String
  action    String   // 'ORDER_SALE', 'ADMIN_UPDATE'
  quantity  Int      // Positive for add, negative for sale
  user      String
  date      String
  createdAt DateTime @default(now())
}

model Subscriber {
  id        String   @id @default(uuid())
  email     String   @unique
  source    String?
  createdAt DateTime @default(now())
}

model BlogPost {
  id        String   @id @default(uuid())
  slug      String   @unique
  title     String
  excerpt   String
  content   String
  author    String
  date      String
  image     String
  category  String
  published Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

## 2. Inventory Logic

Inventory is managed at the **Product** level (`totalStock`), not per variant.
- **Single Pack**: Consumes 1 stock.
- **Double Pack**: Consumes 2 stock.
- **Triple Pack**: Consumes 3 stock.

The `InventoryLog` table tracks all movements for audit purposes.

## 3. Deployment Notes

- **Connection Pooling**: Use `pgbouncer=true` in `DATABASE_URL` for Vercel/Serverless environments to prevent connection exhaustion.
- **Direct Connection**: Use `DIRECT_URL` for running migrations (`prisma db push`).
