# Production Deployment Guide - Himalaya Vitality

This guide provides step-by-step instructions for deploying the Himalaya Vitality eCommerce platform to production on Vercel.

## 📋 Pre-Deployment Checklist

- [ ] All code changes committed and pushed to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Database migrations applied
- [ ] SSL certificate configured
- [ ] Custom domain configured
- [ ] Email service tested
- [ ] Payment gateway (Stripe) in production mode
- [ ] Admin account created
- [ ] Backup of database created

## 🚀 Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose **khagesh-wolf/Himalaya-Vitality**
5. Click **"Import"**

### 2. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

```
EMAIL_USER=khageshbhandari76@gmail.com
EMAIL_PASS=jibc hpfb nbls qjzs
JWT_SECRET=2beb75b3bc575f858c727a913b16d07e
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=681619619571-l757kjei42kdcmdo46lvfn20vbdgf1lo.apps.googleusercontent.com
DATABASE_URL=postgresql://neondb_owner:npg_AU4euBlkwj9x@ep-dawn-silence-acnnhsb7.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=60
DIRECT_URL=postgresql://neondb_owner:npg_AU4euBlkwj9x@ep-dawn-silence-acnnhsb7.sa-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=60
STRIPE_SECRET_KEY=sk_test_51So84iBQxUTMwjNpelkNT3VhSNLnEilu7Q24zlBmPYBCptutzkB7g6ElHJ0m9lYX1t4MsZiHsPPWTCT5fGjZr5yk00MClBrxbc
VITE_USE_MOCK=false
```

### 3. Configure Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Node.js Version**: 22.x (or latest LTS)

### 4. Configure Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `himalaya-vitality.com`)
3. Update DNS records according to Vercel's instructions
4. Wait for DNS propagation (typically 24-48 hours)

### 5. Enable HTTPS/SSL

Vercel automatically provisions SSL certificates for all domains. No additional configuration needed.

### 6. Database Setup

1. Ensure your Neon PostgreSQL database is configured
2. Run migrations on production:
   ```bash
   npm run db:push
   ```
3. Seed initial data:
   ```bash
   npm run seed
   ```

### 7. Verify Deployment

After deployment, verify the following:

1. **Frontend**: Visit your domain and check if the site loads
2. **API Health**: Check `/api/health` endpoint
3. **Database**: Verify database connectivity
4. **Email**: Test email sending via `/api/debug/email`
5. **Authentication**: Test login/signup flow
6. **Payments**: Test Stripe payment flow (use test cards)

## 🔐 Security Checklist

- [ ] All sensitive credentials stored in Vercel environment variables (not in `.env`)
- [ ] `.env` file added to `.gitignore` (never commit secrets)
- [ ] Stripe is in test mode for initial testing
- [ ] JWT_SECRET is a strong, random string
- [ ] Database connection uses SSL
- [ ] CORS is properly configured
- [ ] Admin routes are protected with authentication
- [ ] Email credentials are app-specific passwords (not main password)

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Monitor build times and performance
- Check error rates and logs
- Review traffic patterns

### Database Monitoring
- Monitor query performance
- Check connection pool usage
- Set up automated backups

### Email Monitoring
- Monitor email delivery rates
- Check spam folder for test emails
- Monitor bounce rates

## 🔄 Deployment Workflow

### For Updates:
1. Make changes locally and test
2. Commit and push to GitHub
3. Vercel automatically deploys on push to `main` branch
4. Monitor deployment in Vercel dashboard

### For Hotfixes:
1. Create a hotfix branch
2. Make necessary changes
3. Test thoroughly
4. Merge to `main` and push
5. Vercel deploys automatically

## 📞 Support & Troubleshooting

### Common Issues:

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

**Database Connection Issues**
- Verify DATABASE_URL and DIRECT_URL are correct
- Check if database is accessible from Vercel
- Verify SSL mode settings

**Email Not Sending**
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check Gmail app-specific password settings
- Review email logs in backend

**Payment Not Processing**
- Verify STRIPE_SECRET_KEY is correct
- Check if Stripe is in test mode
- Review Stripe dashboard for errors

## 🎯 Post-Launch Checklist

- [ ] Monitor error logs daily for first week
- [ ] Test all customer workflows
- [ ] Verify admin dashboard functionality
- [ ] Monitor database performance
- [ ] Set up automated backups
- [ ] Create runbook for common issues
- [ ] Train team on deployment process
- [ ] Set up monitoring alerts

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Prisma ORM Guide](https://www.prisma.io/docs)

---

**Last Updated**: January 2026
**Maintained By**: Development Team
