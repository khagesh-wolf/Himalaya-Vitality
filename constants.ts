
import { Product, BundleType, Review, Order, BlogPost } from './types';

// ==========================================
// 🛠️ PRODUCT CONFIGURATION (HARDCODED)
// Update Title, Description, and Images here.
// Prices and Stock are managed in the Admin Panel / Database.
// ==========================================

export const MAIN_PRODUCT: Product = {
  id: 'himalaya-shilajit-resin', // Database ID reference
  title: 'Pure Himalayan Shilajit Resin',
  description: 'Sourced from the pristine Himalayan landscape of Nepal (Dolpa, Mugu, Jajarkot, Humla, Rukum, Gorkha), our Gold Grade Shilajit is a natural substance formed for centuries from compressed plant materials under high pressure and temperature. Rich in 80-85% humic compounds, including Fulvic Acid and over 84+ trace minerals in their ionic forms.',
  rating: 4.9,
  reviewCount: 1248,
  features: [
    '84+ Trace Minerals in Ionic Form',
    '80-85% Humic & 15-20% Non-Humic Compounds',
    'Sourced from Nepal (Dolpa, Mugu, Gorkha)',
    'FDA Certified & ISO 22000 Certified Facility',
    'Third-Party Lab Tested for Purity',
    'Rich in Fulvic Acid, Vitamins B1 & B12'
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
        answer: "Mix 250-500 mg of the resin into warm water, milk, herbal tea, or another warm beverage and dissolve it properly. Take it in the morning or between meals for better absorption."
    },
    {
        question: "What are the therapeutic indications?",
        answer: "When taken with water or milk, it helps with urinary disorders, back pain, and anemia. With honey or milk, it's beneficial for general weakness and respiratory problems. With goat's milk or lukewarm water, it helps with urinary tract disorders and kidney stones."
    },
    {
        question: "Is it safe and certified?",
        answer: "Yes, our products are rigorously tested by independent laboratories, produced in FDA-certified facilities, and comply with standards set by the Department of Drug Administration (DDA). We also possess ISO 22000 certifications."
    },
    {
        question: "What are the physical characteristics of pure Shilajit?",
        answer: "Pure Shilajit is dark brown to black, sticky, and resinous. It has an earthy, pungent, burnt-like smell and a bitter, astringent taste with a metallic aftertaste. It remains soft and viscous at room temperature."
    }
];

export const PRODUCT_CHARACTERISTICS = {
    visual: "Dark brown to black, sticky, resinous",
    smell: "Earthy, pungent, burnt-like",
    taste: "Bitter, astringent, metallic aftertaste",
    texture: "Soft, sticky, viscous at room temperature"
};

export const THERAPEUTIC_GUIDE = [
    { with: "Water or milk", dose: "250-500 mg", indications: "Urinary disorders, back pain, abdominal bloating, constipation, piles, skin diseases, anemia" },
    { with: "Honey or milk", dose: "500 mg", indications: "Tuberculosis, general weakness, chronic fever, respiratory problems" },
    { with: "Goat's milk or lukewarm water", dose: "500 mg", indications: "Burning micturition, urinary tract disorders, urolithiasis (kidney stones), jaundice" }
];
