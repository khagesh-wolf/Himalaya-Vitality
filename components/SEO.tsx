
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  keywords?: string[];
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg', 
  type = 'website',
  keywords = []
}) => {
  const location = useLocation();
  // Ensure we use the actual production domain
  const siteUrl = 'https://himalayavitality.com';
  const canonicalUrl = `${siteUrl}${location.pathname === '/' ? '' : location.pathname}`;
  const fullTitle = `${title} | Himalaya Vitality`;
  
  // Default keywords for every page (SEO Boosting)
  const defaultKeywords = [
    "Himalaya Vitality", 
    "Shilajit Resin", 
    "Pure Shilajit", 
    "शिलाजित", // Nepali
    "Silajit", 
    "Asphaltum Punjabianum", // Scientific
    "Fulvic Acid", 
    "Natural Testosterone Booster", 
    "Ayurvedic Supplement", 
    "Nepal Shilajit"
  ];
  
  const combinedKeywords = [...defaultKeywords, ...keywords].join(', ');

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Himalaya Vitality",
    "alternateName": ["Himalaya Shilajit", "शिलाजित", "Himalaya Vitality Australia"],
    "url": siteUrl,
    "logo": "https://i.ibb.co/tMXQXvJn/logo-red.png",
    "sameAs": [
        "https://instagram.com/himalaya_vitality",
        "https://facebook.com/himalayavitality"
    ],
    "description": "Providers of Gold Grade, lab-tested Himalayan Shilajit resin sourced from 18,000ft."
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

    // Standard Meta
    if (description) updateMeta('description', description);
    updateMeta('keywords', combinedKeywords);
    updateLink('canonical', canonicalUrl);

    // Open Graph / Facebook
    updateMeta('og:type', type, 'property');
    updateMeta('og:url', canonicalUrl, 'property');
    updateMeta('og:title', fullTitle, 'property');
    if (description) updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:site_name', 'Himalaya Vitality', 'property');
    updateMeta('og:locale', 'en_US', 'property');

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:url', canonicalUrl);
    updateMeta('twitter:title', fullTitle);
    if (description) updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

  }, [title, description, image, type, canonicalUrl, fullTitle, combinedKeywords]);

  return (
    <>
        <script type="application/ld+json">
            {JSON.stringify(orgSchema)}
        </script>
        <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
        </script>
    </>
  );
};
