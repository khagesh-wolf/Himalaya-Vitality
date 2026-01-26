# Himalaya Vitality - Premium Shilajit eCommerce Platform

A modern, fully-featured eCommerce platform for selling Pure Himalayan Shilajit Resin with integrated payment processing, admin dashboard, and customer management.

## 🌟 Features

### Customer Features
- **Product Showcase**: Detailed product pages with images, specifications, and health benefits
- **Shopping Cart**: Add/remove items, view cart summary
- **Secure Checkout**: Stripe payment integration with multiple payment methods
- **User Authentication**: Email/password signup, Google OAuth, email verification
- **Order Management**: Track orders, view order history, order confirmation emails
- **Product Reviews**: Leave and view customer reviews (moderated)
- **Blog Section**: Educational content about Shilajit and health benefits
- **Multi-Currency Support**: Display prices in different currencies
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Dashboard Analytics**: Revenue trends, order statistics, performance metrics
- **Order Management**: View, filter, and update order status
- **Review Moderation**: Approve/reject customer reviews
- **Discount Management**: Create and manage promotional codes
- **Product Management**: Update product details and variants
- **Inventory Tracking**: Monitor stock levels and inventory logs
- **Subscriber Management**: Manage newsletter subscribers
- **Shipping Configuration**: Configure deliverable countries and regions

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Stripe React**: Payment UI components
- **Recharts**: Analytics visualizations
- **Lucide React**: Icon library

### Backend
- **Express.js**: Node.js web framework
- **Prisma ORM**: Database abstraction layer
- **PostgreSQL**: Relational database (via Neon)
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Nodemailer**: Email service
- **Stripe API**: Payment processing
- **Google OAuth**: Social authentication

### Infrastructure
- **Vercel**: Hosting and deployment
- **Neon PostgreSQL**: Managed database
- **Stripe**: Payment gateway
- **Gmail SMTP**: Email service
- **Google OAuth**: Authentication provider

## 📦 Installation & Setup

### Prerequisites
- Node.js 22.x or higher
- pnpm package manager
- PostgreSQL database (Neon)
- Stripe account
- Gmail account with app-specific password

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/khagesh-wolf/Himalaya-Vitality.git
   cd Himalaya-Vitality
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Setup database**
   ```bash
   npm run db:init
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   node -r dotenv/config api/index.js
   
   # Terminal 2: Frontend
   pnpm dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Admin Dashboard: http://localhost:5173/admin

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect GitHub repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import the GitHub repository

2. **Configure environment variables**
   - Add all variables from `.env.example` in Vercel project settings

3. **Deploy**
   - Vercel automatically builds and deploys on push to `main` branch

### Database Migration

```bash
npm run db:push
npm run seed
```

### Verify Deployment

```bash
# Check API health
curl https://your-domain.com/api/health

# Test email configuration
curl https://your-domain.com/api/debug/email?to=your-email@example.com
```

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products/:id` - Get product details

### Orders
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/reviews` - All reviews
- `PUT /api/admin/reviews/:id` - Update review status
- `DELETE /api/admin/reviews/:id` - Delete review
- `GET /api/admin/discounts` - All discounts
- `POST /api/admin/discounts` - Create discount
- `DELETE /api/admin/discounts/:id` - Delete discount

## 📁 Project Structure

```
Himalaya-Vitality/
├── api/                          # Backend Express server
│   └── index.js                  # API routes and middleware
├── pages/                        # Page components
│   ├── HomePage.tsx              # Landing page
│   ├── ProductPage.tsx           # Product details
│   ├── CheckoutPage.tsx          # Checkout flow
│   ├── AdminDashboard.tsx        # Admin panel
│   └── ...
├── components/                   # Reusable components
├── context/                      # React context providers
│   ├── AuthContext.tsx           # Authentication state
│   ├── CartContext.tsx           # Shopping cart state
│   └── CurrencyContext.tsx       # Currency selection
├── services/                     # API service layer
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Database models
│   └── seed.js                   # Initial data
├── constants.ts                  # App constants and config
├── types.ts                      # TypeScript type definitions
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # TailwindCSS configuration
├── vercel.json                   # Vercel deployment config
└── package.json                  # Dependencies and scripts
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **HTTPS/SSL**: Automatic SSL certificates via Vercel
- **CORS Protection**: Configured CORS headers
- **Admin Authorization**: Role-based access control
- **Email Verification**: OTP-based email verification
- **Secure Payment**: PCI-compliant Stripe integration
- **Environment Variables**: Sensitive data stored securely

## 📈 Performance Optimizations

- **Code Splitting**: Automatic code splitting with Vite
- **Image Optimization**: Optimized product images
- **Caching**: React Query for intelligent data caching
- **Database Indexing**: Optimized Prisma queries
- **CDN**: Vercel's global CDN for static assets
- **Compression**: Gzip compression enabled

## 🧪 Testing

### Manual Testing Checklist
- [ ] User signup and email verification
- [ ] User login with email/password
- [ ] Google OAuth login
- [ ] Product page loads correctly
- [ ] Add product to cart
- [ ] Checkout flow works
- [ ] Stripe payment processes
- [ ] Order confirmation email sent
- [ ] Admin login works
- [ ] Admin dashboard displays data
- [ ] Create/update/delete discounts
- [ ] Approve/reject reviews

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## 📞 Support & Troubleshooting

### Common Issues

**Build Fails**
- Ensure Node.js version is 22.x or higher
- Run `pnpm install` to install all dependencies
- Check for TypeScript errors: `pnpm build`

**Database Connection Error**
- Verify DATABASE_URL and DIRECT_URL in `.env`
- Check if Neon database is running
- Ensure SSL mode is enabled

**Email Not Sending**
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check if Gmail app-specific password is used
- Review backend logs for SMTP errors

**Payment Not Processing**
- Verify STRIPE_SECRET_KEY is in test mode
- Check Stripe dashboard for errors
- Use test card numbers for testing

## 📚 Documentation

- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Deployment guide
- [Himalaya_Vitality_Analysis.md](./Himalaya_Vitality_Analysis.md) - Architecture overview
- [Database_Schema_Documentation.md](./Database_Schema_Documentation.md) - Database schema
- [Component_Connection_Map.md](./Component_Connection_Map.md) - Component relationships

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👨‍💼 Contact

For support and inquiries, contact: khageshbhandari76@gmail.com

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✅
