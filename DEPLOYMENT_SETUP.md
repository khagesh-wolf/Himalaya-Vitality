# Deployment Setup

**Note**: This file is kept for legacy reference. Please refer to:

1.  [**DEPLOYMENT.md**](./DEPLOYMENT.md) for general architecture and Vercel configuration.
2.  [**TECHNICAL_SETUP_GUIDE.md**](./TECHNICAL_SETUP_GUIDE.md) for environment variable reference.

## Migration from Mock to Production

If you are switching from `VITE_USE_MOCK=true` to a real backend:

1.  Set `VITE_USE_MOCK=false` in your `.env`.
2.  Ensure `VITE_API_URL` is set (usually `/api` for Vercel deployments).
3.  Ensure your database is provisioned and seeded using `npm run db:init`.
