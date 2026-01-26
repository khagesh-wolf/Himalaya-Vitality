
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MAIN_PRODUCT = {
  id: 'himalaya-shilajit-resin',
  title: 'Pure Himalayan Shilajit Resin',
  description: 'Sourced from 18,000ft in the Himalayas, our Gold Grade Shilajit is purified using traditional Ayurvedic methods to ensure maximum potency and purity.',
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
  variants: [
    {
      id: 'var_single',
      type: 'SINGLE',
      name: 'Starter Pack (1 Jar)',
      price: 49.00,
      compareAtPrice: 65.00,
      label: '1 Month Supply',
      savings: 'Save $16',
      isPopular: false,
      stock: 50
    },
    {
      id: 'var_double',
      type: 'DOUBLE',
      name: 'Commitment Pack (2 Jars)',
      price: 88.00,
      compareAtPrice: 130.00,
      label: '2 Month Supply',
      savings: 'Save $42',
      isPopular: false,
      stock: 120
    },
    {
      id: 'var_triple',
      type: 'TRIPLE',
      name: 'Transformation Pack (3 Jars)',
      price: 117.00,
      compareAtPrice: 195.00,
      label: '3 Month Supply',
      savings: 'Save $78',
      isPopular: true,
      stock: 85
    }
  ]
};

const REVIEWS = [
  {
    author: 'Sarah Jenkins',
    rating: 5,
    date: '2 days ago',
    title: 'Life changing',
    content: 'I was skeptical at first, but after 2 weeks I feel like a different person.',
    verified: true,
    tags: ['General', 'Energy'],
    status: 'Approved'
  },
  {
    author: 'Michael Chen',
    rating: 5,
    date: '1 week ago',
    title: 'Pure Quality',
    content: 'Passed the solubility test. The taste is earthy as expected. Great packaging.',
    verified: true,
    tags: ['Quality'],
    status: 'Approved'
  },
  {
    author: 'David K., Crossfit Coach',
    rating: 5,
    date: '1 week ago',
    title: 'Recovery Beast',
    content: 'Recovery time is nonexistent now. Peak physical output achieved.',
    verified: true,
    tags: ['Athlete', 'Recovery'],
    status: 'Approved'
  }
];

async function main() {
  console.log('Start seeding ...');

  // 1. Upsert Product
  const product = await prisma.product.upsert({
    where: { id: MAIN_PRODUCT.id },
    update: {},
    create: {
      id: MAIN_PRODUCT.id,
      title: MAIN_PRODUCT.title,
      description: MAIN_PRODUCT.description,
      rating: MAIN_PRODUCT.rating,
      reviewCount: MAIN_PRODUCT.reviewCount,
      features: MAIN_PRODUCT.features,
      images: MAIN_PRODUCT.images,
      variants: {
        create: MAIN_PRODUCT.variants.map(v => ({
            id: v.id,
            type: v.type,
            name: v.name,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            label: v.label,
            savings: v.savings,
            isPopular: v.isPopular,
            stock: v.stock
        }))
      }
    },
  });
  console.log(`Created/Updated Product: ${product.title}`);

  // 2. Add Reviews (Only if not exist to prevent dupes on re-seed)
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
      for (const review of REVIEWS) {
        await prisma.review.create({
          data: {
            productId: MAIN_PRODUCT.id,
            ...review
          }
        });
      }
      console.log('Added initial reviews.');
  }

  // 3. Add Default Discount
  const welcomeCode = await prisma.discount.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
          code: 'WELCOME10',
          type: 'PERCENTAGE',
          value: 10,
          active: true
      }
  });
  console.log(`Ensured discount code: ${welcomeCode.code}`);
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
