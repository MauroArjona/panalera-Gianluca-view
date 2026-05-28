// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  rating: number
  reviewCount: number
  category: string
  gender: 'men' | 'women' | 'unisex'
  sizes: string[]
  colors: ColorDot[]
  description: string
  featured: boolean
  inStock: boolean
  tags: string[]
}

export interface ColorDot {
  name: string
  hex: string
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: ColorDot
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: OrderStatus
  createdAt: string
  shippingAddress: ShippingAddress
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ProductFilters {
  category?: string
  gender?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'rating'
  page?: number
  perPage?: number
}
