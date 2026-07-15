/// <reference types="vite/client" />

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/v1'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ProductSize {
  id?: number
  talle: string
  stock: number
}

export interface Product {
  id: number
  name: string
  price: number
  image: string
  images: string[]
  category: string
  categoriaId: number | null
  subcategory: string
  subcategoriaId: number | null
  stock: number
  talle: string | null
  talles: ProductSize[]
  isPromo: boolean
  oldPrice: number | null
  marca: string | null
  enCarrusel: boolean
  destacado: boolean
  createdAt: string
}

export interface ProductFilters {
  category?: string
  categoriaId?: number
  subcategoriaId?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest'
  minPrice?: number
  maxPrice?: number
  soloPromo?: boolean
  page?: number
  perPage?: number
}

export interface ProductPayload {
  name: string
  price: number
  subcategoria_id?: number | null
  images: string[]
  talles: ProductSize[]
  is_promo?: boolean
  destacado?: boolean
  en_carrusel?: boolean
  old_price?: number | null
}

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export interface Categoria {
  id: number
  nombre: string
  created_at?: string
  subcategorias?: Subcategoria[]
}

export interface Subcategoria {
  id: number
  nombre: string
  categoria_id: number
  categoria?: Categoria
  created_at?: string
}

export interface VentaItem {
  productId: number
  quantity: number
  price: number
  size?: string
}

export interface Venta {
  id: number
  created_at: string
  items: VentaItem[]
  total: number
  estado: string
}

export interface CreateVentaPayload {
  items: VentaItem[]
  total: number
  estado?: string
}

async function http<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const productApi = {
  async list(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.categoriaId) params.set('categoriaId', String(filters.categoriaId))
    if (filters.subcategoriaId) params.set('subcategoriaId', String(filters.subcategoriaId))
    if (filters.search) params.set('search', filters.search)
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
    if (filters.soloPromo) params.set('promo', 'true')
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('perPage', String(filters.perPage))

    const res = await http<ApiResponse<never> & PaginatedResponse<Product>>(`/products?${params}`)
    return {
      data: res.data,
      total: res.total,
      page: res.page,
      perPage: res.perPage,
      totalPages: res.totalPages,
    }
  },

  async getCarrusel(): Promise<Product[]> {
    const res = await http<ApiResponse<Product[]>>('/products/carrusel')
    return res.data
  },

  async getFeatured(): Promise<Product[]> {
    const res = await http<ApiResponse<Product[]>>('/products/destacados')
    return res.data
  },

  async getPromos(): Promise<Product[]> {
    const res = await http<ApiResponse<Product[]>>('/products/promos')
    return res.data
  },

  async getById(id: number): Promise<Product> {
    const res = await http<ApiResponse<Product>>(`/products/${id}`)
    return res.data
  },

  async create(payload: ProductPayload): Promise<Product> {
    const res = await http<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  async update(id: number, payload: Partial<ProductPayload>): Promise<Product> {
    const res = await http<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  async remove(id: number): Promise<void> {
    await http<ApiResponse<null>>(`/products/${id}`, { method: 'DELETE' })
  },
}

export const catalogApi = {
  async listCategorias(): Promise<Categoria[]> {
    const res = await http<ApiResponse<Categoria[]>>('/catalog/categorias')
    return res.data
  },

  async createCategoria(nombre: string): Promise<Categoria> {
    const res = await http<ApiResponse<Categoria>>('/catalog/categorias', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    })
    return res.data
  },

  async updateCategoria(id: number, nombre: string): Promise<Categoria> {
    const res = await http<ApiResponse<Categoria>>(`/catalog/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nombre }),
    })
    return res.data
  },

  async deleteCategoria(id: number): Promise<void> {
    await http<ApiResponse<null>>(`/catalog/categorias/${id}`, { method: 'DELETE' })
  },

  async listSubcategorias(categoriaId?: number): Promise<Subcategoria[]> {
    const params = categoriaId ? `?categoria_id=${categoriaId}` : ''
    const res = await http<ApiResponse<Subcategoria[]>>(`/catalog/subcategorias${params}`)
    return res.data
  },

  async createSubcategoria(nombre: string, categoriaId: number): Promise<Subcategoria> {
    const res = await http<ApiResponse<Subcategoria>>('/catalog/subcategorias', {
      method: 'POST',
      body: JSON.stringify({ nombre, categoria_id: categoriaId }),
    })
    return res.data
  },

  async updateSubcategoria(id: number, payload: { nombre?: string; categoria_id?: number }): Promise<Subcategoria> {
    const res = await http<ApiResponse<Subcategoria>>(`/catalog/subcategorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  async deleteSubcategoria(id: number): Promise<void> {
    await http<ApiResponse<null>>(`/catalog/subcategorias/${id}`, { method: 'DELETE' })
  },
}

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await http<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return res.data
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await http<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    return res.data
  },

  async me(): Promise<User> {
    const res = await http<ApiResponse<User>>('/auth/me')
    return res.data
  },

  async logout(): Promise<void> {
    await http<ApiResponse<null>>('/auth/logout', { method: 'POST' })
  },
}

export const orderApi = {
  async listAll(): Promise<Venta[]> {
    const res = await http<ApiResponse<Venta[]>>('/orders')
    return res.data
  },

  async getById(id: number): Promise<Venta> {
    const res = await http<ApiResponse<Venta>>(`/orders/${id}`)
    return res.data
  },

  async create(payload: CreateVentaPayload): Promise<Venta> {
    const res = await http<ApiResponse<Venta>>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  async updateStatus(id: number, estado: string): Promise<Venta> {
    const res = await http<ApiResponse<Venta>>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    })
    return res.data
  },

  async listByEstado(estado: string): Promise<Venta[]> {
    const res = await http<ApiResponse<Venta[]>>(`/orders/estado/${estado}`)
    return res.data
  },
}

export async function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const formData = new FormData()
  formData.append('imagen', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}/upload/imagen`)

    const token = localStorage.getItem('auth_token')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    })

    
    xhr.onload = () => {
      const body = JSON.parse(xhr.responseText || '{}')
      if (xhr.status >= 200 && xhr.status < 300) resolve(body.url)
      else reject(new Error(body.message ?? 'Error al subir imagen'))
    }
    xhr.onerror = () => reject(new Error('Error de red al subir imagen'))
    xhr.send(formData)
  })
}
