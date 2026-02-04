
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  schema?: object; // Accept custom JSON-LD schema
  noIndex?: boolean; // For pages like 404, Checkout, Account
  productData?: {
    price: number;
    currency: string;
    availability?: 'instock' | 'outofstock';
  };
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop', 
  type = 'website',
  schema,
  noIndex = false,
  productData
}) => {
  const location = useLocation();
  const siteUrl = 'https://himalayavitality.com';
  const canonicalUrl = `${siteUrl}${location.pathname}`;
  const fullTitle = `${title} | Himalaya Vitality`;

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Himalaya Vitality",
    "url": siteUrl,
    "logo": "https://i.ibb.co/tMXQXvJn/logo-red.png",
    "sameAs": [
        "https://instagram.com/himalayavitality",
        "https://facebook.com/himalayavitality"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@himalayavitality.com",
      "contactType": "customer service"
    }
  };

  // Generate Breadcrumb Schema automatically based on route
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      ...pathnames.map((name, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        "item": `${siteUrl}/${pathnames.slice(0, index + 1).join('/')}`
      }))
    ]
  };

  useEffect(() => {
    // Update Title
    document.title = fullTitle;
    
    // Helper function to manage meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to manage link tags (canonical)
    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Robots
    updateMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Standard Meta
    if (description) updateMeta('description', description);
    updateLink('canonical', canonicalUrl);

    // Open Graph / Facebook
    updateMeta('og:type', type, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:title', fullTitle, 'property');
    if (description) updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:site_name', 'Himalaya Vitality', 'property');

    // Product Specific OG Tags
    if (type === 'product' && productData) {
        updateMeta('product:price:amount', productData.price.toString(), 'property');
        updateMeta('product:price:currency', productData.currency, 'property');
        if (productData.availability) {
            updateMeta('product:availability', productData.availability, 'property');
        }
    }

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:url', canonicalUrl);
    updateMeta('twitter:title', fullTitle);
    if (description) updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

  }, [title, description, image, type, canonicalUrl, fullTitle, noIndex, productData]);

  return (
    <>
        <script type="application/ld+json">
            {JSON.stringify(orgSchema)}
        </script>
        <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
        </script>
        {schema && (
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        )}
    </>
  );
};
