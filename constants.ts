
import { Product, BundleType, Review, Order, BlogPost } from './types';

// ==========================================
// 🛠️ PRODUCT CONFIGURATION (HARDCODED)
// ==========================================

export const MAIN_PRODUCT: Product = {
  id: 'himalaya-shilajit-resin',
  title: 'Pure Himalayan Shilajit Resin',
  description: 'A natural substance ranging in color from pale brown to blackish-brown that exudes from rocks in the Himalayas. Formed for centuries from compressed plant materials under high pressure and temperature. Our premium resin is sourced from the pristine landscapes of Nepal. It is soft, sticky, and viscous with an earthy, pungent smell and a bitter, astringent taste.',
  rating: 4.9,
  reviewCount: 24,
  features: [
    '>80% Fulvic Acid & Humic (80-85%)',
    'Rich in Dibenzo-a-pyrones & Trace Minerals',
    'Sun Dried for 60-90 Days (Surya Tapi)',
    'Lab Tested (IAS, FDA, DDA Certified)',
    'Supports Testosterone & Cognitive Function'
  ],
  images: [
    'https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg',
    'https://i.ibb.co/9H8yWSgP/Whats-App-Image-2026-01-26-at-7-08-21-PM.jpg',
    'https://i.ibb.co/bMWsMg0T/Whats-App-Image-2026-01-26-at-7-08-20-PM.jpg',
    'https://i.ibb.co/VYcz2Tky/Whats-App-Image-2026-01-26-at-7-08-20-PM-1.jpg',
    'https://i.ibb.co/KzWf8byr/Whats-App-Image-2026-01-26-at-7-08-20-PM-3.jpg'
  ],
  variants: [
    {
      id: 'var_single',
      type: BundleType.SINGLE,
      name: 'Starter Pack (1 Jar)',
      price: 49,
      compareAtPrice: 65,
      label: '1 Month Supply',
      savings: 'Save $16',
      stock: 100
    },
    {
      id: 'var_double',
      type: BundleType.DOUBLE,
      name: 'Commitment Pack (2 Jars)',
      price: 88,
      compareAtPrice: 130,
      label: '2 Month Supply',
      savings: 'Save $42',
      stock: 100
    },
    {
      id: 'var_triple',
      type: BundleType.TRIPLE,
      name: 'Transformation Pack (3 Jars)',
      price: 117,
      compareAtPrice: 195,
      label: '3 Month Supply',
      savings: 'Save $78',
      isPopular: true,
      stock: 100
    }
  ]
};

// ==========================================
// HARDCODED REVIEWS (No API)
// ==========================================
export const REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Sarah Jenkins',
    rating: 5,
    date: '2 days ago',
    title: 'Life changing energy levels',
    content: 'I was skeptical at first, but after 2 weeks I feel like a different person. No more afternoon crash. My endurance during spin class has doubled.',
    verified: true,
    tags: ['General', 'Energy']
  },
  {
    id: 'r2',
    author: 'Michael Chen',
    rating: 5,
    date: '5 days ago',
    title: 'Real deal Shilajit',
    content: 'Passed the solubility test immediately. The taste is earthy as expected, not like the fake tar stuff I bought on Amazon before. Great packaging too.',
    verified: true,
    tags: ['Quality']
  },
  {
    id: 'r3',
    author: 'David K., Crossfit Coach',
    rating: 5,
    date: '1 week ago',
    title: 'Recovery time is nonexistent now',
    content: 'As a competitive athlete, recovery is everything. Since adding Himalaya Vitality to my stack, my DOMS (muscle soreness) has virtually vanished. Peak physical output achieved.',
    verified: true,
    tags: ['Athlete', 'Recovery']
  },
  {
    id: 'r4',
    author: 'Elena R.',
    rating: 5,
    date: '2 weeks ago',
    title: 'Endurance for miles',
    content: 'I used to hit the wall at mile 18. Now I have sustained energy through the finish line. No jitters like caffeine, just pure endurance.',
    verified: true,
    tags: ['Athlete', 'Endurance']
  },
  {
    id: 'r5',
    author: 'James Wilson',
    rating: 4,
    date: '3 weeks ago',
    title: 'Great product, fast shipping',
    content: 'The product itself is amazing. Shipping via AusPost was quick to Sydney.',
    verified: true,
    tags: ['Shipping']
  },
  {
    id: 'r6',
    author: 'Sophie T.',
    rating: 5,
    date: '1 month ago',
    title: 'Brain Fog Gone',
    content: 'I take a pea sized amount in my coffee every morning. The mental clarity is unmatched.',
    verified: true,
    tags: ['Focus']
  },
  {
    id: 'r7',
    author: 'Mark D.',
    rating: 5,
    date: '1 month ago',
    title: 'Best investment for health',
    content: 'Should have started taking this years ago. I feel 10 years younger.',
    verified: true,
    tags: ['General']
  }
];

export const MOCK_ORDERS: Order[] = [
  { id: '#HV-7829', customer: 'Alex Thompson', email: 'alex.t@example.com', phone: '+61 400 010 998', date: '2023-10-24', total: 117.00, status: 'Paid', items: 1 },
  { id: '#HV-7828', customer: 'Maria Garcia', email: 'm.garcia@testmail.com', phone: '+61 400 012 334', date: '2023-10-24', total: 49.00, status: 'Fulfilled', items: 1 },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'benefits-of-shilajit',
    title: '5 Science-Backed Benefits of Shilajit',
    excerpt: 'Discover why this ancient resin is known as the "Destroyer of Weakness" in Ayurvedic medicine and how it can optimize your modern lifestyle.',
    content: `<p>Shilajit has been used for centuries in Ayurveda...</p>`,
    author: 'Dr. A. Sharma',
    date: 'Oct 12, 2023',
    image: MAIN_PRODUCT.images[0], // Use product image instead of random
    category: 'Education'
  },
  {
    id: '2',
    slug: 'how-to-test-purity',
    title: 'How to Tell if Your Shilajit is Pure',
    excerpt: 'Not all resin is created equal. Learn the simple home tests you can perform to ensure you aren\'t consuming heavy metals or fillers.',
    content: `<p>The market is flooded with counterfeit products...</p>`,
    author: 'Himalaya Team',
    date: 'Nov 05, 2023',
    image: MAIN_PRODUCT.images[1], // Use product image
    category: 'Guide'
  }
];

export const FAQ_DATA = [
    {
        question: "How do I take Shilajit resin?",
        answer: "General adult dosage is 250-500 mg per day. Using the included measuring spoon, dissolve the resin in lukewarm water, milk, or herbal tea. For best results, take it twice a day (morning and between meals)."
    },
    {
        question: "Where do you ship from?",
        answer: "We are proudly Australian operated. All orders are dispatched from our warehouse in Australia via Australia Post."
    },
    {
        question: "How long does shipping take?",
        answer: "Australian orders typically arrive in 2-5 business days via Australia Post Express. International orders take 6-12 business days."
    },
    {
        question: "Is it safe? Does it contain heavy metals?",
        answer: "Yes, it is completely safe. Our Shilajit is purified via the Surya Tapi method and 3rd-party tested to strictly ensure heavy metals are well within safe limits."
    }
];
