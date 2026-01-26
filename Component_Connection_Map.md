# Component Connection Map: Himalaya Vitality

**Author**: Manus AI
**Date**: January 26, 2026

## Overview

This document provides a detailed mapping of how different components, contexts, services, and pages are interconnected within the Himalaya Vitality application. Understanding these relationships is crucial for maintaining and extending the codebase.

## 1. Context Providers & Their Consumers

### 1.1. AuthContext

**Location**: `/context/AuthContext.tsx`

**Purpose**: Manages user authentication state, login/logout operations, and user profile data.

**State Variables**:
- `user`: Current user object (null if not logged in)
- `isAuthenticated`: Boolean flag
- `isAdmin`: Boolean flag (true if user.role === 'ADMIN')
- `isLoading`: Loading state during authentication operations
- `error`: Error messages from auth operations

**Key Functions**:
- `login(data)`: Authenticates user with email/password
- `signup(data)`: Creates new user account
- `verifyEmail(email, otp)`: Verifies email with OTP code
- `socialLogin(token)`: Handles Google OAuth authentication
- `logout()`: Clears user session

**Consumed By**:
- `Navbar` (Layout.tsx): Displays user profile, login/logout buttons
- `AdminDashboard.tsx`: Checks admin role for access control
- `CheckoutPage.tsx`: Associates orders with logged-in users
- `ProfilePage.tsx`: Displays and updates user information
- `AuthPages.tsx`: Login, Signup, and Verification forms

**API Dependencies**:
- `loginUser()` from services/api.ts
- `signupUser()` from services/api.ts
- `verifyEmail()` from services/api.ts
- `googleAuthenticate()` from services/api.ts
- `fetchCurrentUser()` from services/api.ts

---

### 1.2. CartContext

**Location**: `/context/CartContext.tsx`

**Purpose**: Manages shopping cart state and operations.

**State Variables**:
- `cartItems`: Array of CartItem objects
- `discount`: Applied discount code details
- `cartSubtotal`: Total before discounts
- `cartTotal`: Final total after discounts
- `cartCount`: Total number of items in cart

**Key Functions**:
- `addToCart(product, variant, quantity)`: Adds item to cart
- `removeFromCart(variantId)`: Removes item from cart
- `updateQuantity(variantId, quantity)`: Updates item quantity
- `clearCart()`: Empties the cart
- `applyDiscount(code)`: Applies discount code
- `removeDiscount()`: Removes applied discount

**Persistence**: Cart state is automatically saved to `localStorage` under the key `himalaya_cart`.

**Consumed By**:
- `ProductPage.tsx`: Add to cart functionality
- `CartPage.tsx`: Display and manage cart contents
- `CheckoutPage.tsx`: Display cart summary and process order
- `Navbar` (Layout.tsx): Display cart count badge
- `CartDrawer.tsx`: Slide-out cart preview

**Analytics Integration**:
- Calls `trackAddToCart()` from services/analytics.ts when items are added

---

### 1.3. CurrencyContext

**Location**: `/context/CurrencyContext.tsx`

**Purpose**: Manages multi-currency support with automatic detection and conversion.

**State Variables**:
- `currency`: Currently selected currency code (USD, EUR, GBP, CAD, AUD)
- `rates`: Exchange rate object fetched from external API
- `formatPrice(priceInUSD)`: Function to convert and format prices

**Key Features**:
- **Automatic Detection**: Uses IP geolocation API to detect user's country and set appropriate currency
- **Fallback Strategy**: If IP detection fails, uses browser timezone settings
- **Live Exchange Rates**: Fetches real-time rates from exchangerate-api.com on initialization
- **Persistence**: Selected currency is saved to `localStorage` under `himalaya_currency`

**Consumed By**:
- `ProductPage.tsx`: Display product prices in user's currency
- `CartPage.tsx`: Display cart totals
- `CheckoutPage.tsx`: Display order summary
- `AdminDashboard.tsx`: Display revenue metrics
- `Navbar` (Layout.tsx): Currency selector dropdown

---

### 1.4. LoadingContext

**Location**: `/context/LoadingContext.tsx`

**Purpose**: Manages global loading states and displays loading overlay.

**State Variables**:
- `isLoading`: Boolean flag
- `loadingMessage`: Optional message to display

**Key Functions**:
- `setIsLoading(state, message?)`: Sets loading state with optional message

**Consumed By**:
- `CheckoutPage.tsx`: Shows loading during payment processing
- `GlobalLoader.tsx`: Renders the actual loading overlay

---

### 1.5. SettingsContext

**Location**: `/context/SettingsContext.tsx`

**Purpose**: Manages application-wide settings and configurations.

**State Variables**:
- `settings.showTopBar`: Boolean to show/hide announcement bar
- `settings.topBarMessage`: HTML content for announcement bar

**Consumed By**:
- `Navbar` (Layout.tsx): Conditionally renders top announcement bar

---

## 2. Page Components & Their Dependencies

### 2.1. HomePage

**Location**: `/pages/HomePage.tsx`

**Purpose**: Landing page with hero section, benefits, reviews, and CTAs.

**Key Sections**:
- Hero with animated text and background
- Benefits grid (4 cards)
- Product showcase
- Customer reviews
- Comparison table (Himalaya vs Competitors)
- Instagram feed mockup
- Newsletter signup

**Dependencies**:
- `MAIN_PRODUCT` constant from constants.ts
- `REVIEWS` constant from constants.ts
- UI components: `Button`, `Container`, `LazyImage`, `Reveal`
- Icons from lucide-react

**No Context Dependencies**: This is a purely presentational page.

---

### 2.2. ProductPage

**Location**: `/pages/ProductPage.tsx`

**Purpose**: Detailed product page with variant selection and add-to-cart functionality.

**Key Features**:
- Product image gallery
- Bundle selection (Single, Double, Triple)
- Dynamic pricing display
- Shipping calculator
- Review filtering and display
- Sticky add-to-cart bar on scroll
- Newsletter signup section

**Context Dependencies**:
- `useCurrency()`: For price formatting
- `useCart()`: For add-to-cart functionality
- `useLoading()`: For loading states

**Data Fetching**:
- `fetchProduct(productId)` via React Query
- `fetchReviews()` via React Query

**Analytics**:
- Calls `trackViewItem(product)` on page load
- Calls `trackAddToCart(item)` when adding to cart

**URL Parameters**:
- `productId`: From route params
- `bundle`: From query string (SINGLE, DOUBLE, TRIPLE)

---

### 2.3. CheckoutPage

**Location**: `/pages/CheckoutPage.tsx`

**Purpose**: Multi-step checkout process with address form and payment.

**Key Features**:
- Two-step process: Address → Payment
- Form validation with Zod schema
- Stripe Payment Element integration
- Shipping cost calculation
- Order summary (mobile collapsible)
- Guest checkout support

**Context Dependencies**:
- `useCart()`: Access cart items and totals
- `useCurrency()`: Format prices
- `useAuth()`: Associate order with user if logged in
- `useLoading()`: Show loading during payment

**API Calls**:
- `createPaymentIntent(items, currency)`: Initialize Stripe payment
- `createOrder(data)`: Save order to database after successful payment

**Form Validation**:
- Uses `react-hook-form` with `zodResolver`
- Schema: email, firstName, lastName, address, city, country, zip, phone

**Analytics**:
- Calls `trackBeginCheckout(items, total)` when checkout starts
- Calls `trackPurchase(orderId, total, items)` after successful payment

---

### 2.4. AdminDashboard

**Location**: `/pages/AdminDashboard.tsx`

**Purpose**: Comprehensive admin interface for store management.

**Views (Tabs)**:
1. **Dashboard**: Analytics charts and key metrics
2. **Orders**: View and update order statuses
3. **Products**: Edit product details, prices, and stock
4. **Reviews**: Moderate customer reviews
5. **Discounts**: Create and manage discount codes
6. **Subscribers**: View newsletter subscribers
7. **Shipping**: Configure shipping regions
8. **Inventory Logs**: View stock change history

**Context Dependencies**:
- `useAuth()`: Verify admin role
- `useCurrency()`: Format revenue metrics

**Data Fetching** (via React Query):
- `fetchAdminStats()`: Dashboard metrics
- `fetchAdminOrders()`: All orders
- `fetchProduct()`: Product details
- `fetchAdminReviews()`: All reviews
- `fetchDiscounts()`: All discount codes
- `fetchSubscribers()`: Newsletter emails
- `fetchInventoryLogs()`: Stock history

**Mutations**:
- `updateOrderStatus(id, status)`
- `updateProduct(id, data)`
- `updateReviewStatus(id, status)`
- `deleteReview(id)`
- `createDiscount(data)`
- `deleteDiscount(id)`

**Charts**:
- Revenue trend (Area Chart)
- Order status distribution (Pie Chart)

---

### 2.5. CartPage

**Location**: `/pages/CartPage.tsx`

**Purpose**: Full-page cart view with item management.

**Key Features**:
- List all cart items with images
- Quantity adjustment controls
- Remove item functionality
- Discount code input
- Cart summary with subtotal, discount, and total
- Continue shopping and checkout CTAs

**Context Dependencies**:
- `useCart()`: All cart operations
- `useCurrency()`: Price formatting

---

### 2.6. AuthPages

**Location**: `/pages/AuthPages.tsx`

**Purpose**: Contains all authentication-related pages.

**Pages Exported**:
1. **LoginPage**: Email/password login + Google OAuth
2. **SignupPage**: User registration form
3. **VerifyEmailPage**: OTP verification
4. **ForgotPasswordPage**: Password reset request

**Context Dependencies**:
- `useAuth()`: All auth operations

**Form Validation**:
- Uses `react-hook-form` with Zod schemas

**Features**:
- Google OAuth button integration
- Error message display
- Redirect to verification page if email not verified
- Auto-redirect to home after successful login

---

## 3. Service Layer

### 3.1. api.ts

**Location**: `/services/api.ts`

**Purpose**: Centralized API communication layer with mock adapter support.

**Configuration**:
- `USE_MOCK`: Environment variable to toggle mock data
- `API_URL`: Base URL for API endpoints

**Key Functions**:

**Authentication**:
- `loginUser(data)`
- `signupUser(data)`
- `verifyEmail(email, otp)`
- `googleAuthenticate(token)`
- `fetchCurrentUser()`
- `updateUserProfile(data)`

**Products & Reviews**:
- `fetchProduct(id)`
- `fetchReviews()`
- `fetchBlogPosts()`

**Orders & Payments**:
- `createPaymentIntent(items, currency)`
- `createOrder(data)`
- `fetchUserOrders()`

**Admin Operations**:
- `fetchAdminStats()`
- `fetchAdminOrders()`
- `updateOrderStatus(id, status)`
- `updateProduct(id, data)`
- `fetchDiscounts()`
- `createDiscount(data)`
- `deleteDiscount(id)`
- `fetchAdminReviews()`
- `updateReviewStatus(id, status)`
- `deleteReview(id)`
- `fetchSubscribers()`
- `fetchInventoryLogs()`

**Authentication Handling**:
- Automatically attaches JWT token from `localStorage` to all requests
- Handles 403 responses with `requiresVerification` flag

---

### 3.2. analytics.ts

**Location**: `/services/analytics.ts`

**Purpose**: Integration with Google Analytics 4 and Meta Pixel.

**Initialization**:
- `initAnalytics()`: Loads GA4 and Meta Pixel scripts

**Event Tracking**:
- `trackViewItem(product)`: Product page view
- `trackAddToCart(item)`: Add to cart action
- `trackBeginCheckout(items, total)`: Checkout initiated
- `trackPurchase(orderId, total, items)`: Order completed

**Configuration**:
- `GA_MEASUREMENT_ID`: From environment variable
- `PIXEL_ID`: From environment variable

---

## 4. Component Hierarchy

### 4.1. Layout Components

**Navbar** (`components/Layout.tsx`):
- Logo
- Desktop navigation links (Shop, Science, Story, Reviews)
- Search button → Opens SearchModal
- User account dropdown
- Currency selector
- Cart icon with badge → Opens CartDrawer
- Mobile menu toggle

**Footer** (`components/Layout.tsx`):
- Company info
- Quick links
- Social media icons
- Newsletter signup form
- Legal links (Privacy, Terms)

---

### 4.2. Shared Components

**CartDrawer** (`components/CartDrawer.tsx`):
- Slide-out panel from right
- Mini cart view
- Quick checkout button
- Uses `useCart()` context

**SearchModal** (`components/SearchModal.tsx`):
- Full-screen overlay
- Search input with Fuse.js fuzzy search
- Product and page results
- Keyboard navigation support

**SEO** (`components/SEO.tsx`):
- Dynamic meta tags
- OpenGraph tags
- JSON-LD structured data
- Used on every page

**GlobalLoader** (`components/GlobalLoader.tsx`):
- Full-screen loading overlay
- Animated spinner
- Controlled by `LoadingContext`

**NewsletterModal** (`components/NewsletterModal.tsx`):
- Popup modal for email collection
- Appears after delay on first visit
- Uses `localStorage` to track if shown

---

## 5. Data Flow Examples

### Example 1: Adding Product to Cart

1. User on `ProductPage` selects a bundle variant
2. User clicks "Add to Cart" button
3. `ProductPage` calls `addToCart(product, variant, quantity)` from `useCart()`
4. `CartContext` updates `cartItems` state
5. `CartContext` saves updated cart to `localStorage`
6. `trackAddToCart(item)` is called to send event to GA4/Meta Pixel
7. `Navbar` re-renders with updated cart count badge
8. User sees success notification

### Example 2: Completing Checkout

1. User on `CheckoutPage` fills out shipping form
2. Form is validated with Zod schema
3. User proceeds to payment step
4. Frontend calls `createPaymentIntent(items, currency)`
5. Backend creates Stripe PaymentIntent and returns `clientSecret`
6. Stripe Payment Element is initialized with `clientSecret`
7. User enters card details in Stripe iframe
8. User clicks "Pay Now"
9. Frontend calls `stripe.confirmPayment()`
10. Stripe processes payment and returns success
11. Frontend calls `createOrder(data)` with payment ID
12. Backend creates `Order` and `OrderItem` records in database
13. Backend sends confirmation email via Nodemailer
14. `trackPurchase()` sends conversion event to analytics
15. User is redirected to confirmation page
16. Cart is cleared via `clearCart()`

### Example 3: Admin Updating Product Price

1. Admin navigates to Admin Dashboard
2. `AuthContext` verifies user has `ADMIN` role
3. Admin clicks "Products" tab
4. `AdminDashboard` calls `fetchProduct()` via React Query
5. Product data is displayed in editable form
6. Admin changes price for "Triple Pack" variant
7. Admin clicks "Save Changes"
8. `AdminDashboard` calls `updateProduct(id, data)` mutation
9. Backend updates `ProductVariant` record in database
10. React Query invalidates cache and refetches data
11. Admin sees success message
12. Frontend product pages now show updated price

---

## 6. Key Integration Points

### 6.1. Stripe Integration

**Files Involved**:
- `CheckoutPage.tsx`: Frontend payment UI
- `api/index.js`: Backend payment intent creation

**Flow**:
1. Frontend requests payment intent from backend
2. Backend calculates amount server-side (prevents tampering)
3. Backend creates Stripe PaymentIntent
4. Frontend receives `clientSecret`
5. Frontend initializes Stripe Elements with secret
6. User enters payment details in secure Stripe iframe
7. Frontend confirms payment with Stripe
8. Backend receives webhook (optional) or frontend calls order endpoint

**Security**:
- Card details never touch the application server
- Amount calculation done server-side
- Payment confirmation handled by Stripe

---

### 6.2. Google OAuth Integration

**Files Involved**:
- `AuthPages.tsx`: Google login button
- `AuthContext.tsx`: Social login handler
- `api/index.js`: Token verification endpoint

**Flow**:
1. User clicks "Continue with Google"
2. Google OAuth popup opens
3. User authorizes the application
4. Google returns access token to frontend
5. Frontend sends token to `/api/auth/google`
6. Backend verifies token with Google's API
7. Backend creates or updates user record
8. Backend issues JWT token
9. Frontend stores JWT and updates auth state

---

### 6.3. Email System

**Files Involved**:
- `api/index.js`: Email sending logic

**Provider**: Gmail SMTP via Nodemailer

**Email Types**:
1. **Verification Email**: Sent during signup with OTP code
2. **Order Confirmation**: Sent after successful payment
3. **Password Reset**: Sent when user requests password reset (if implemented)

**Configuration**:
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: App-specific password

---

## 7. State Persistence

The application uses `localStorage` for persisting several key pieces of state:

| Key                          | Data                      | Purpose                          |
| ---------------------------- | ------------------------- | -------------------------------- |
| `hv_token`                   | JWT token                 | User authentication              |
| `himalaya_cart`              | Cart items array          | Shopping cart persistence        |
| `himalaya_currency`          | Currency code             | User's preferred currency        |
| `himalaya_admin_session`     | Admin session flag        | Admin authentication             |
| `himalaya_regions`           | Shipping regions config   | Custom shipping settings         |
| `himalaya_newsletter_shown`  | Boolean flag              | Track if newsletter modal shown  |
| `himalaya_cookie_consent`    | Boolean flag              | Cookie consent acceptance        |

---

## 8. Conclusion

The Himalaya Vitality application demonstrates a well-organized component architecture with clear separation of concerns. The use of React Context for global state management, combined with React Query for server state, creates a maintainable and scalable codebase. The service layer abstracts API communication, making it easy to switch between mock and real data sources. The component connection map shows that while components are interconnected, they maintain loose coupling through context providers and the service layer, which is a hallmark of good software design.
