
import { CartItem, Product } from '../types';

// Configuration - In production, these should come from env variables
// Updated to user provided ID
const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_ID || 'G-HEF88PY146'; 
const PIXEL_ID = (import.meta as any).env?.VITE_PIXEL_ID || '1234567890';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// --- Initialization ---
export const initAnalytics = () => {
  if (typeof window === 'undefined') return;

  // 1. Google Analytics 4
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);}
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  // 2. Meta Pixel
  const pixelScript = document.createElement('script');
  pixelScript.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(pixelScript);
};

// --- Standard Events ---

export const trackViewItem = (product: Product) => {
  if (!product) return;
  
  const value = product.variants?.[0]?.price || 0;

  // GA4
  window.gtag('event', 'view_item', {
    currency: 'USD',
    value: value,
    items: [{
      item_id: product.id,
      item_name: product.title,
      price: value,
      quantity: 1
    }]
  });

  // Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: value,
      currency: 'USD'
    });
  }
};

export const trackAddToCart = (item: CartItem) => {
  // GA4
  window.gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [{
      item_id: item.variantId,
      item_name: item.productTitle,
      variant: item.variantName,
      price: item.price,
      quantity: item.quantity
    }]
  });

  // Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [item.variantId],
      content_name: item.productTitle,
      content_type: 'product',
      value: item.price * item.quantity,
      currency: 'USD'
    });
  }
};

export const trackBeginCheckout = (items: CartItem[], total: number) => {
  // GA4
  window.gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: total,
    items: items.map(item => ({
      item_id: item.variantId,
      item_name: item.productTitle,
      price: item.price,
      quantity: item.quantity
    }))
  });

  // Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      num_items: items.reduce((acc, i) => acc + i.quantity, 0),
      value: total,
      currency: 'USD'
    });
  }
};

export const trackPurchase = (orderId: string, total: number, items: CartItem[]) => {
  // GA4
  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    value: total,
    currency: 'USD',
    items: items.map(item => ({
      item_id: item.variantId,
      item_name: item.productTitle,
      price: item.price,
      quantity: item.quantity
    }))
  });

  // Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: total,
      currency: 'USD',
      num_items: items.length,
      order_id: orderId
    });
  }
};
