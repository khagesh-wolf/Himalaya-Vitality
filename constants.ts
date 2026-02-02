
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

// --- SEO OPTIMIZED BLOG CONTENT ---
export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'benefits-of-shilajit-men-women',
    title: '7 Proven Benefits of Himalayan Shilajit for Energy & Hormonal Balance',
    excerpt: 'Discover why this ancient "Destroyer of Weakness" is becoming the go-to supplement for biohackers and high performers. From boosting ATP to regulating testosterone, the science is undeniable.',
    content: `
      <p>Shilajit, often referred to as the "Destroyer of Weakness," is a sticky, tar-like substance found primarily in the rocks of the Himalayas. It develops over centuries from the slow decomposition of plants. In Ayurvedic medicine, it has been a staple for millennia, but modern science is now catching up to its potent benefits.</p>
      
      <p>Whether you are a competitive athlete or a busy professional, integrating <a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">high-quality Shilajit resin</a> into your daily routine can be transformative. Here are the top 7 science-backed benefits.</p>

      <h3>1. Boosts Cellular Energy (ATP Production)</h3>
      <p>Fatigue is the plague of the modern world. Shilajit works at the cellular level to combat this. The fulvic acid in Shilajit helps deliver minerals and nutrients directly into the mitochondria—the powerhouses of your cells.</p>
      <blockquote>A study published in the <em>Journal of Ethnopharmacology</em> found that Shilajit prevents mitochondrial dysfunction, allowing your body to produce ATP (Adenosine Triphosphate) more efficiently. This translates to sustained, jitter-free energy throughout the day.</blockquote>

      <h3>2. Enhances Testosterone & Fertility in Men</h3>
      <p>One of the most popular uses of Shilajit is for hormonal support. Clinical trials have shown significant increases in total testosterone, free testosterone, and DHEAS in healthy men after 90 days of supplementation.</p>
      <p>For men looking to optimize their hormonal health naturally, our <a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">Gold Grade Shilajit</a> offers a potent dose of bioactive compounds necessary for synthesis.</p>

      <h3>3. Improves Cognitive Function</h3>
      <p>Brain fog affects us all. The dibenzo-alpha-pyrones in Shilajit prevent the breakdown of brain chemicals needed for memory. Research suggests it may even prevent the accumulation of tau protein, a marker associated with Alzheimer's disease.</p>

      <h3>4. Supports Heart Health</h3>
      <p>Rich in iron, Humic acid, and over 85 trace minerals, Shilajit supports healthy blood formation and circulation. (Note: If you have a heart condition, always consult your doctor first).</p>

      <h3>5. High-Altitude Adaptogen</h3>
      <p>Sourced from 18,000ft, Shilajit is the ultimate adaptogen. It helps the body manage stress (cortisol) and improves physical performance under duress. This is why it was traditionally used by Sherpas to maintain strength at high altitudes.</p>

      <h3>Conclusion</h3>
      <p>Not all Shilajit is created equal. To experience these benefits, you must ensure you are consuming purified, resin-form Shilajit, not dried powders which often contain fillers. <a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">Try Himalaya Vitality today</a> and feel the difference nature can make.</p>
    `,
    author: 'Dr. A. Sharma',
    date: 'Oct 24, 2023',
    image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=1200&auto=format&fit=crop',
    category: 'Science'
  },
  {
    id: '2',
    slug: 'shilajit-resin-vs-capsules-powder',
    title: 'Shilajit Resin vs. Capsules vs. Powder: Which is Best?',
    excerpt: 'Confused by the different forms of Shilajit on the market? We break down why authentic resin is superior to powders and capsules for potency and bioavailability.',
    content: `
      <p>As Shilajit gains popularity, the market has been flooded with various forms: powders, pills, drops, and resin. But if you want the true benefits of this Ayurvedic superfood, the form matters just as much as the source.</p>

      <h3>The Problem with Powders and Capsules</h3>
      <p>Most Shilajit powders are processed using high heat (spray drying). This extreme heat destroys the delicate bioactive enzymes and reduces the fulvic acid content significantly. Furthermore, powders are often cut with fillers like maltodextrin or fulvic acid substitutes to increase profit margins.</p>
      <ul>
        <li><strong>Low Potency:</strong> Heat damages the nutrients.</li>
        <li><strong>Additives:</strong> Often contain up to 40% fillers.</li>
        <li><strong>Oxidation:</strong> Increased surface area leads to faster degradation.</li>
      </ul>

      <h3>Why Resin is the Gold Standard</h3>
      <p>Authentic Shilajit, like <a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">Himalaya Vitality</a>, is extracted using the traditional <em>Surya Tapi</em> method. This involves purifying the rock exudate using only spring water and the sun.</p>
      <p>This slow, low-temperature process takes 60-90 days but preserves 100% of the minerals and fulvic acid. The result is a thick, tar-like resin that is biologically active and highly bioavailable.</p>

      <h3>The Solubility Test</h3>
      <p>You can test this yourself. Pure resin dissolves completely in warm water within minutes, leaving no residue. Powders often leave a sandy sediment or don't dissolve fully due to binders.</p>

      <h3>Verdict</h3>
      <p>If you are serious about your health, avoid the cheap powders found on generic marketplaces. Stick to the living, breathing resin form. It tastes earthy, it smells pungent, and it <strong>works</strong>.</p>
      <p><a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">Shop Authentic Resin Here</a></p>
    `,
    author: 'Himalaya Team',
    date: 'Nov 05, 2023',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop', 
    category: 'Guide'
  },
  {
    id: '3',
    slug: 'how-to-test-shilajit-purity-home',
    title: 'The Ultimate Guide to Testing Shilajit Purity at Home',
    excerpt: 'Don\'t get scammed by fake tar. Learn the simple "Burn Test" and "Solubility Test" to ensure your Shilajit is 100% authentic and safe.',
    content: `
      <p>With the rising demand for Shilajit, counterfeit products are unfortunately common. Some unscrupulous sellers sell thickened sugar syrup, ozokerite, or low-grade mumie as premium Shilajit. Here is how you can verify the purity of your <a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">Himalaya Vitality resin</a> at home.</p>

      <h3>1. The Temperature Test</h3>
      <p>Pure Shilajit resin reacts to temperature. It should be hard and brittle when cold (like glass) and soft and sticky when warm.</p>
      <p><strong>Try this:</strong> Put your jar in the fridge for an hour. It should become very hard. Then, hold a small piece in your hand. Your body heat alone should be enough to make it soft and pliable. Fake products often stay soft even when freezing or don't melt with body heat.</p>

      <h3>2. The Solubility Test</h3>
      <p>Take a pea-sized portion and place it in a glass of warm water. Authentic resin will dissolve completely, creating a golden-brown or reddish-black liquid. It should leave <strong>zero residue</strong> or sand at the bottom of the glass.</p>

      <h3>3. The Burn Test (Definitive)</h3>
      <p>Shilajit does not burn; it bubbles. Place a small amount on a metal spoon and heat it with a lighter.</p>
      <ul>
        <li><strong>Authentic:</strong> It will bubble and expand, turning into ash. It will not catch fire.</li>
        <li><strong>Fake:</strong> If it catches fire like a candle, it likely contains wax or petroleum. If it caramelizes and smells like burnt sugar, it is likely sugar syrup.</li>
      </ul>

      <h3>4. Lab Testing (The Gold Standard)</h3>
      <p>While home tests are great, nothing beats 3rd party lab analysis. At Himalaya Vitality, every batch is tested for heavy metals (Lead, Arsenic, Mercury, Cadmium) to ensure they are well below safety limits.</p>
      <p>We believe in transparency. That is why we source ethically from 18,000ft in Nepal and purify strictly via sun-drying.</p>
      <p>Ready to experience the real deal? <a href="/#/product/himalaya-shilajit-resin" class="text-brand-red font-bold hover:underline">Order your jar today.</a></p>
    `,
    author: 'Quality Control Team',
    date: 'Nov 12, 2023',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1200&auto=format&fit=crop',
    category: 'Education'
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
