import React, { useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Navbar, Footer } from './components/Layout';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { LoadingProvider } from './context/LoadingContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SEO } from './components/SEO';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalLoader } from './components/GlobalLoader';

// Eager load critical pages
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';

// Lazy load non-critical pages for performance
const ReviewsPage = React.lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const BlogIndex = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogIndex })));
const BlogPostPage = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPostPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const LoginPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.SignupPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Lazy load static pages
const AboutPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.AboutPage })));
const SciencePage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.SciencePage })));
const FAQPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.FAQPage })));
const ContactPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ContactPage })));
const TrackOrderPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.TrackOrderPage })));
const PrivacyPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.TermsPage })));
const HowToUsePage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.HowToUsePage })));
const ShippingReturnsPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ShippingReturnsPage })));
const SitemapPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.SitemapPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Replace with your actual Google Client ID from console.cloud.google.com
const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <LoadingProvider>
            <AuthProvider>
              <SettingsProvider>
                <CurrencyProvider>
                  <CartProvider>
                    <HashRouter>
                      <ScrollToTop />
                      <div className="flex flex-col min-h-screen font-sans text-earth-900">
                        <Navbar />
                        <main className="flex-grow">
                          <Suspense fallback={<GlobalLoader />}>
                            <Routes>
                              <Route path="/" element={<><SEO title="Premium Shilajit Resin" description="Boost your energy naturally." /><HomePage /></>} />
                              <Route path="/product/:productId" element={<><SEO title="Shop Shilajit" /><ProductPage /></>} />
                              <Route path="/shop" element={<><SEO title="Shop Shilajit" /><ProductPage /></>} /> 
                              <Route path="/cart" element={<><SEO title="Your Cart" /><CartPage /></>} />
                              <Route path="/checkout" element={<><SEO title="Secure Checkout" /><CheckoutPage /></>} />
                              <Route path="/login" element={<LoginPage />} />
                              <Route path="/signup" element={<SignupPage />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="/admin" element={<AdminDashboard />} />
                              <Route path="/admin/login" element={<AdminLoginPage />} />
                              <Route path="/about" element={<><SEO title="Our Story" /><AboutPage /></>} />
                              <Route path="/science" element={<><SEO title="The Science" /><SciencePage /></>} />
                              <Route path="/how-to-use" element={<><SEO title="How To Use" /><HowToUsePage /></>} />
                              <Route path="/faq" element={<><SEO title="FAQ" /><FAQPage /></>} />
                              <Route path="/blog" element={<BlogIndex />} />
                              <Route path="/blog/:slug" element={<BlogPostPage />} />
                              <Route path="/contact" element={<><SEO title="Contact Us" /><ContactPage /></>} />
                              <Route path="/track" element={<><SEO title="Track Order" /><TrackOrderPage /></>} />
                              <Route path="/reviews" element={<><SEO title="Reviews" /><ReviewsPage /></>} />
                              <Route path="/sitemap" element={<><SEO title="Sitemap" /><SitemapPage /></>} />
                              <Route path="/privacy" element={<><SEO title="Privacy Policy" /><PrivacyPage /></>} />
                              <Route path="/terms" element={<><SEO title="Terms of Service" /><TermsPage /></>} />
                              <Route path="/shipping-returns" element={<><SEO title="Shipping & Returns" /><ShippingReturnsPage /></>} />
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </Suspense>
                        </main>
                        <Footer />
                      </div>
                    </HashRouter>
                  </CartProvider>
                </CurrencyProvider>
              </SettingsProvider>
            </AuthProvider>
          </LoadingProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
};

export default App;