
# Technical Setup Guide

## System Requirements
- Node.js v18.17+ 
- npm or pnpm
- Docker (optional, for local Postgres)

## 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/himalaya-vitality.git
cd himalaya-vitality
npm install
```

## 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database (Example: Local Docker Postgres)
DATABASE_URL="postgresql://postgres:password@localhost:5432/himalaya?schema=public"

# Authentication
NEXTAUTH_SECRET="your-development-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Feature Flags
VITE_USE_MOCK="true"  # Set to "false" to use real backend API
```

## 3. Running the Development Server

The project uses **Vite** for the frontend.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 4. Backend Mocking vs. Real API

### Demo Mode (Current Default)
The application currently runs in **Mock Mode** (`VITE_USE_MOCK=true` in `services/api.ts`). This allows the frontend to be fully navigable without a running backend server or database. API calls are intercepted and return static data from `constants.ts`.

### Real Backend Integration
To connect to a real backend:
1. Ensure your backend API is running (e.g., at `http://localhost:3000/api`).
2. Update `services/api.ts`: Set `USE_MOCK = false`.
3. Configure the `API_URL` to point to your backend.
4. Ensure the backend implements the endpoints defined in `DATABASE_IMPLEMENTATION_GUIDE.md`.

## 5. Testing Payments
In Test Mode (`VITE_USE_MOCK=true` or Stripe Test Mode):
- Use Stripe Test Cards (e.g., `4242 4242 4242 4242`).
- Any future date, any CVC.
