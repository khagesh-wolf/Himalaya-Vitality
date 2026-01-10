
import React, { useState, useEffect, useRef } from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-dark' | 'ghost' | 'black';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full active:scale-95 touch-manipulation";
  
  const variants = {
    primary: "bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red shadow-md shadow-brand-red/20 hover:shadow-lg hover:shadow-brand-red/30",
    black: "bg-brand-dark text-white hover:bg-black focus:ring-brand-dark shadow-md hover:shadow-lg",
    secondary: "bg-white text-brand-dark border border-gray-300 hover:border-brand-dark hover:bg-gray-50 shadow-sm",
    outline: "border-2 border-white text-white hover:bg-white/10", // For dark backgrounds
    "outline-dark": "border border-gray-300 text-brand-dark hover:border-brand-dark hover:bg-gray-50 bg-transparent", // For light backgrounds
    ghost: "text-brand-dark hover:bg-gray-100"
  };

  // Adjusted sizes for better mobile touch targets
  const sizes = {
    sm: "px-4 py-2 text-xs min-h-[32px]",
    md: "px-6 py-3 text-sm min-h-[44px]",
    lg: "px-8 py-4 text-base min-h-[56px]"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-brand-red' }) => (
  <span className={`${color} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap`}>
    {children}
  </span>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Container ---
// Added proper padding for mobile (px-4) vs larger screens
export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
    {children}
  </div>
);

// --- LazyImage (Performance Component) ---
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    srcSet?: string;
    sizes?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className = '', srcSet, sizes, ...props }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>
            )}
            <img 
                src={src} 
                alt={alt}
                srcSet={srcSet}
                sizes={sizes}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className={`transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} ${className}`}
                {...props}
            />
        </div>
    );
};

// --- Reveal (Scroll Animation) ---
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  width?: 'full' | 'auto';
}

export const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0, width = 'full' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${width === 'full' ? 'w-full' : 'inline-block'} transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
