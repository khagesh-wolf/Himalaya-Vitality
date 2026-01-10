import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ productName }: { productName?: string }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Generate Breadcrumb Schema JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://himalayavitality.com"
      },
      ...pathnames.map((name, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": productName && index === pathnames.length - 1 ? productName : name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        "item": `https://himalayavitality.com/${pathnames.slice(0, index + 1).join('/')}`
      }))
    ]
  };

  return (
    <nav className="flex items-center text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      <Link to="/" className="hover:text-brand-red flex items-center transition-colors">
        <Home size={14} className="mr-1" /> Home
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = (isLast && productName) 
            ? productName 
            : value.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="mx-2 text-gray-400" />
            {isLast ? (
              <span className="font-bold text-brand-dark">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-brand-red transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
