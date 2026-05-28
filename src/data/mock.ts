import type { Product, Order, User } from '@/types'

// ─── Products ─────────────────────────────────────────────────────────────────
// Images sourced from Unsplash (free to use)
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Classic Sports Watch',
    slug: 'classic-sports-watch',
    price: 240,
    originalPrice: 320,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584735175097-9b4b4e1a2e8e?w=600&h=600&fit=crop',
    ],
    rating: 3,
    reviewCount: 24,
    category: 'watches',
    gender: 'unisex',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Gold', hex: '#ffd700' },
    ],
    description:
      'Precision-crafted sports watch with a durable case and comfortable strap. Water-resistant up to 50m, perfect for everyday wear or athletic activities.',
    featured: true,
    inStock: true,
    tags: ['watches', 'sport', 'unisex'],
  },
  {
    id: 2,
    name: 'Cloud Runner Shoes',
    slug: 'cloud-runner-shoes',
    price: 480,
    originalPrice: 580,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop',
    ],
    rating: 3,
    reviewCount: 48,
    category: 'shoes',
    gender: 'men',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Red', hex: '#ef4444' },
    ],
    description:
      'Lightweight cloud-cushioned running shoes designed for maximum comfort and performance. Breathable mesh upper keeps your feet cool during intense workouts.',
    featured: true,
    inStock: true,
    tags: ['shoes', 'sport', 'running'],
  },
  {
    id: 3,
    name: 'Summer Adidas Shoes',
    slug: 'summer-adidas-shoes',
    price: 360,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    ],
    rating: 5,
    reviewCount: 74,
    category: 'shoes',
    gender: 'women',
    sizes: ['5', '6', '7', '8', '9'],
    colors: [
      { name: 'Pink', hex: '#ec4899' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Blue', hex: '#3b82f6' },
    ],
    description:
      'Iconic summer-ready sneakers with a sleek design. Perfect blend of style and comfort for casual outings or light sport activities.',
    featured: true,
    inStock: true,
    tags: ['shoes', 'summer', 'women'],
  },
  {
    id: 4,
    name: 'Urban Leather Backpack',
    slug: 'urban-leather-backpack',
    price: 195,
    originalPrice: 250,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    ],
    rating: 4,
    reviewCount: 32,
    category: 'accessories',
    gender: 'unisex',
    sizes: ['One Size'],
    colors: [
      { name: 'Brown', hex: '#92400e' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    description:
      'Premium leather backpack with multiple compartments. Ideal for work, travel, or daily commute. Features a padded laptop sleeve and ergonomic shoulder straps.',
    featured: false,
    inStock: true,
    tags: ['accessories', 'bag', 'leather'],
  },
  {
    id: 5,
    name: 'Polarized Sunglasses',
    slug: 'polarized-sunglasses',
    price: 120,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    ],
    rating: 4,
    reviewCount: 56,
    category: 'accessories',
    gender: 'unisex',
    sizes: ['One Size'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Tortoise', hex: '#8b5e3c' },
      { name: 'Gold', hex: '#ffd700' },
    ],
    description:
      'UV400 polarized lenses reduce glare and protect your eyes. Lightweight frame with spring hinges for an all-day comfortable fit.',
    featured: false,
    inStock: true,
    tags: ['accessories', 'sunglasses', 'summer'],
  },
  {
    id: 6,
    name: 'Merino Wool Sweater',
    slug: 'merino-wool-sweater',
    price: 175,
    originalPrice: 220,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop',
    ],
    rating: 5,
    reviewCount: 18,
    category: 'clothing',
    gender: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Grey', hex: '#6b7280' },
      { name: 'Cream', hex: '#fdf6e3' },
    ],
    description:
      'Luxuriously soft 100% Merino wool sweater. Naturally temperature-regulating, moisture-wicking, and odor-resistant. A wardrobe essential for any season.',
    featured: false,
    inStock: true,
    tags: ['clothing', 'sweater', 'men', 'luxury'],
  },
  {
    id: 7,
    name: 'Gym Weight Set',
    slug: 'gym-weight-set',
    price: 340,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop',
    ],
    rating: 4,
    reviewCount: 41,
    category: 'accessories',
    gender: 'unisex',
    sizes: ['5kg', '10kg', '15kg', '20kg'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Chrome', hex: '#c0c0c0' },
    ],
    description:
      'Professional-grade gym weight set for home or gym use. Cast iron construction with rubber coating to protect floors. Hexagonal design prevents rolling.',
    featured: false,
    inStock: true,
    tags: ['accessories', 'gym', 'sport'],
  },
  {
    id: 8,
    name: 'Floral Summer Dress',
    slug: 'floral-summer-dress',
    price: 89,
    originalPrice: 130,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop',
    ],
    rating: 4,
    reviewCount: 63,
    category: 'clothing',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Blue', hex: '#3b82f6' },
      { name: 'Pink', hex: '#ec4899' },
      { name: 'Green', hex: '#22c55e' },
    ],
    description:
      'Lightweight floral-print dress perfect for warm weather. Flowing silhouette with adjustable straps. Made from breathable 100% cotton.',
    featured: false,
    inStock: true,
    tags: ['clothing', 'dress', 'summer', 'women'],
  },
  {
    id: 9,
    name: 'Trail Running Shoes',
    slug: 'trail-running-shoes',
    price: 295,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    ],
    rating: 5,
    reviewCount: 87,
    category: 'shoes',
    gender: 'men',
    sizes: ['8', '9', '10', '11', '12'],
    colors: [
      { name: 'Grey', hex: '#6b7280' },
      { name: 'Orange', hex: '#f97316' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    description:
      'High-performance trail running shoes with aggressive outsole traction. Protective toe cap and rock plate for technical terrain. Gore-Tex waterproof lining.',
    featured: false,
    inStock: true,
    tags: ['shoes', 'running', 'trail', 'men'],
  },
  {
    id: 10,
    name: 'Luxury Diving Watch',
    slug: 'luxury-diving-watch',
    price: 850,
    originalPrice: 1100,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop',
    ],
    rating: 5,
    reviewCount: 29,
    category: 'watches',
    gender: 'men',
    sizes: ['One Size'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Blue', hex: '#1e3a5f' },
    ],
    description:
      'Professional diving watch with 300m water resistance, sapphire crystal glass, and automatic movement. Swiss-made precision meets bold design.',
    featured: false,
    inStock: true,
    tags: ['watches', 'luxury', 'men'],
  },
  {
    id: 11,
    name: "Women's Canvas Tote",
    slug: 'womens-canvas-tote',
    price: 65,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
    ],
    rating: 4,
    reviewCount: 102,
    category: 'accessories',
    gender: 'women',
    sizes: ['One Size'],
    colors: [
      { name: 'Natural', hex: '#fdf6e3' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1e3a5f' },
    ],
    description:
      'Spacious organic cotton canvas tote. Reinforced handles, interior pocket, and zip closure. Perfect for shopping, beach, or everyday carry.',
    featured: false,
    inStock: true,
    tags: ['accessories', 'bag', 'women'],
  },
  {
    id: 12,
    name: 'Sport Compression Leggings',
    slug: 'sport-compression-leggings',
    price: 79,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop',
    ],
    rating: 4,
    reviewCount: 145,
    category: 'clothing',
    gender: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Grey', hex: '#6b7280' },
      { name: 'Navy', hex: '#1e3a5f' },
    ],
    description:
      'High-waisted compression leggings with four-way stretch fabric. Moisture-wicking technology keeps you dry during any workout. Squat-proof design.',
    featured: false,
    inStock: true,
    tags: ['clothing', 'sport', 'women', 'gym'],
  },
]

// ─── Categories ───────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES = [
  {
    id: 'watches',
    name: 'Watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
  },
  {
    id: 'shoes',
    name: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
  },
]

// ─── Hero Slides ──────────────────────────────────────────────────────────────
export const MOCK_HERO_SLIDES = [
  {
    id: 1,
    title: 'Zay eCommerce',
    subtitle: 'Discover Premium Fashion & Accessories',
    description:
      'Explore our curated collection of watches, shoes, and accessories. Quality products for every style and occasion.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=500&fit=crop',
    ctaLabel: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Fresh Styles Every Season',
    description:
      'Stay ahead of the trends with our latest collection. New pieces added weekly — find your next favorite look.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=500&fit=crop',
    ctaLabel: 'View Collection',
    ctaLink: '/shop',
  },
  {
    id: 3,
    title: 'Summer Sale',
    subtitle: 'Up to 40% Off Selected Items',
    description:
      'Limited time offers on hundreds of products. Upgrade your wardrobe without breaking the bank.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=500&fit=crop',
    ctaLabel: 'See Deals',
    ctaLink: '/shop',
  },
]

// ─── Mock User ────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=28a745&color=fff',
}

// ─── Mock Orders ──────────────────────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    items: [
      {
        product: MOCK_PRODUCTS[0],
        quantity: 1,
        selectedSize: 'M',
        selectedColor: { name: 'Black', hex: '#1a1a1a' },
      },
      {
        product: MOCK_PRODUCTS[1],
        quantity: 2,
        selectedSize: '10',
        selectedColor: { name: 'White', hex: '#ffffff' },
      },
    ],
    total: 1200,
    status: 'delivered',
    createdAt: '2024-03-15T10:30:00Z',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0100',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
  },
  {
    id: 'ORD-002',
    items: [
      {
        product: MOCK_PRODUCTS[4],
        quantity: 1,
        selectedSize: 'One Size',
        selectedColor: { name: 'Black', hex: '#1a1a1a' },
      },
    ],
    total: 120,
    status: 'shipped',
    createdAt: '2024-04-02T14:20:00Z',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0100',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
  },
]
