
import { Product, BundleType, Review, Order, BlogPost } from './types';

// ==========================================
// 🛠️ PRODUCT CONFIGURATION (HARDCODED)
// Update Title, Description, and Images here.
// Prices and Stock are managed in the Admin Panel / Database.
// ==========================================

export const MAIN_PRODUCT: Product = {
  id: 'himalaya-shilajit-resin', // Database ID reference
  title: 'Pure Himalayan Shilajit Resin',
  description: 'Sourced from 18,000ft in the Himalayas, our Gold Grade Shilajit is purified using traditional Ayurvedic methods to ensure maximum potency and purity. Rich in Fulvic Acid and over 85+ trace minerals.',
  rating: 4.9,
  reviewCount: 1248,
  features: [
    '85+ Trace Minerals & Fulvic Acid',
    'Lab Tested for Purity & Safety',
    'Supports Energy & Vitality',
    'Traditional Ayurvedic Purification'
  ],
  images: [
    'https://picsum.photos/600/600?random=1',
    'https://picsum.photos/600/600?random=2',
    'https://picsum.photos/600/600?random=3'
  ],
  // These variants act as the "Template". 
  // The actual Price and Stock will be overwritten by the Database/Admin Panel.
  variants: [
    {
      id: 'var_single',
      type: BundleType.SINGLE,
      name: 'Starter Pack (1 Jar)',
      price: 49, // Default/Fallback
      compareAtPrice: 65,
      label: '1 Month Supply',
      savings: 'Save $16',
      stock: 100 // Default/Fallback
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
// END PRODUCT CONFIGURATION
// ==========================================

export const ACCESSORY_PRODUCTS = [
    {
        id: 'acc_spoon',
        title: 'Golden Measuring Spoon',
        price: 9.95,
        image: 'https://picsum.photos/300/300?random=spoon'
    },
    {
        id: 'acc_honey',
        title: 'Raw Manuka Honey Sticks (10pk)',
        price: 14.95,
        image: 'https://picsum.photos/300/300?random=honey'
    }
];

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
    date: '1 week ago',
    title: 'Real deal Shilajit',
    content: 'Passed the solubility test. The taste is earthy as expected. Great packaging.',
    verified: true,
    tags: ['Quality']
  },
  {
    id: 'r_athlete_1',
    author: 'David K., Crossfit Coach',
    rating: 5,
    date: '1 week ago',
    title: 'Recovery time is nonexistent now',
    content: 'As a competitive athlete, recovery is everything. Since adding Himalaya Vitality to my stack, my DOMS (muscle soreness) has virtually vanished. Peak physical output achieved.',
    verified: true,
    tags: ['Athlete', 'Recovery']
  },
  {
    id: 'r_athlete_2',
    author: 'Elena R., Marathon Runner',
    rating: 5,
    date: '3 weeks ago',
    title: 'Endurance for miles',
    content: 'I used to hit the wall at mile 18. Now I have sustained energy through the finish line. No jitters like caffeine, just pure endurance.',
    verified: true,
    tags: ['Athlete', 'Endurance']
  },
  {
    id: 'r3',
    author: 'Emma W.',
    rating: 4,
    date: '3 weeks ago',
    title: 'Great product, slow shipping',
    content: 'The product itself is amazing, but shipping took an extra 2 days.',
    verified: true,
    tags: ['Shipping']
  }
];

export const MOCK_ORDERS: Order[] = [
  { id: '#ORD-7829', customer: 'Alex Thompson', email: 'alex.t@example.com', phone: '+1 (555) 010-9988', date: '2023-10-24', total: 117.00, status: 'Paid', items: 1 },
  { id: '#ORD-7828', customer: 'Maria Garcia', email: 'm.garcia@testmail.com', phone: '+1 (555) 012-3344', date: '2023-10-24', total: 49.00, status: 'Fulfilled', items: 1 },
  { id: '#ORD-7827', customer: 'James Wilson', email: 'jwilson@provider.net', phone: '+1 (555) 019-2211', date: '2023-10-23', total: 88.00, status: 'Delivered', items: 1 },
  { id: '#ORD-7826', customer: 'Linda Brown', email: 'linda.b@example.com', phone: '+1 (555) 015-6677', date: '2023-10-23', total: 117.00, status: 'Delivered', items: 1 },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'benefits-of-shilajit',
    title: '5 Science-Backed Benefits of Shilajit',
    excerpt: 'Discover why this ancient resin is known as the "Destroyer of Weakness" in Ayurvedic medicine and how it can optimize your modern lifestyle.',
    content: `
      <p>Shilajit has been used for centuries in Ayurveda, but modern science is finally catching up. Here are the top 5 benefits backed by research.</p>
      <h3>1. Boosts Testosterone & Fertility</h3>
      <p>Clinical studies have shown that daily supplementation of purified Shilajit can significantly increase testosterone levels in healthy men.</p>
      <h3>2. Enhances Mitochondrial Function</h3>
      <p>The high Fulvic Acid content helps transport nutrients directly into the mitochondria, the power plants of your cells, increasing ATP production.</p>
      <h3>3. Supports Brain Health</h3>
      <p>Some studies suggest that the antioxidant properties of Shilajit may inhibit the accumulation of tau protein, which helps protect against cognitive decline.</p>
    `,
    author: 'Dr. A. Sharma',
    date: 'Oct 12, 2023',
    image: 'https://picsum.photos/800/600?random=10',
    category: 'Education'
  },
  {
    id: '2',
    slug: 'how-to-test-purity',
    title: 'How to Tell if Your Shilajit is Pure',
    excerpt: 'Not all resin is created equal. Learn the simple home tests you can perform to ensure you aren\'t consuming heavy metals or fillers.',
    content: `
      <p>The market is flooded with counterfeit products. Here is how to test yours:</p>
      <h3>The Solubility Test</h3>
      <p>Pure Shilajit dissolves completely in warm water without leaving any residue. If there is grit or sand at the bottom, it is not pure.</p>
      <h3>The Flame Test</h3>
      <p>Pure resin will bubble and turn to ash when exposed to flame. It will not burn like a candle.</p>
    `,
    author: 'Himalaya Team',
    date: 'Nov 05, 2023',
    image: 'https://picsum.photos/800/600?random=11',
    category: 'Guide'
  },
  {
    id: '3',
    slug: 'morning-routine',
    title: 'The Ultimate Morning Routine for Energy',
    excerpt: 'Combine Shilajit with these simple morning habits to maximize your productivity and focus throughout the day.',
    content: '...',
    author: 'Sarah J.',
    date: 'Nov 20, 2023',
    image: 'https://picsum.photos/800/600?random=12',
    category: 'Lifestyle'
  }
];

export const FAQ_DATA = [
    {
        question: "How do I take Shilajit resin?",
        answer: "Using the included measuring spoon, take a pea-sized amount (300-500mg) and dissolve it in lukewarm water, tea, or milk. Consume it on an empty stomach in the morning for best results."
    },
    {
        question: "How long does shipping take?",
        answer: "US orders typically arrive in 2-4 business days. International orders take 6-12 business days depending on customs. We ship all orders within 24 hours."
    },
    {
        question: "Is it safe? Does it contain heavy metals?",
        answer: "Yes, it is completely safe. Raw Shilajit can contain impurities, which is why ours is purified and 3rd-party tested to strictly ensure heavy metals are well within safe limits established by US and EU standards."
    },
    {
        question: "What does it taste like?",
        answer: "Pure Shilajit has a strong, earthy, herbal taste and smell. It is not sweet. Most people get used to it quickly, or mix it with honey or tea to mask the flavor."
    }
];
