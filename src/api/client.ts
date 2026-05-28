/// <reference types="vite/client" />
/**
 * API Client — integrado con el backend real
 *
 * BASE_URL apunta a tu Express API (variable de entorno VITE_API_URL).
 * Todos los endpoints reflejan exactamente las rutas del backend:
 *   POST   /v1/auth/register
 *   POST   /v1/auth/login
 *   GET    /v1/auth/me
 *   POST   /v1/auth/logout
 *
 *   GET    /v1/products              ?categoria, subcategoria, search, sortBy,
 *                                     minPrice, maxPrice, destacados, page, perPage
 *   GET    /v1/products/destacados
 *   GET    /v1/products/:id
 *   GET    /v1/products/codigo/:codigo
 *   POST   /v1/products              [admin]
 *   PATCH  /v1/products/:id          [admin]
 *   DELETE /v1/products/:id          [admin] soft-delete
 *   DELETE /v1/products/:id/hard     [admin] borrado físico
 *
 *   GET    /v1/catalog/categorias
 *   GET    /v1/catalog/categorias/:id
 *   POST   /v1/catalog/categorias    [admin]
 *   PATCH  /v1/catalog/categorias/:id [admin]
 *   DELETE /v1/catalog/categorias/:id [admin]
 *
 *   GET    /v1/catalog/subcategorias  ?categoria_id=uuid
 *   GET    /v1/catalog/subcategorias/:id
 *   POST   /v1/catalog/subcategorias  [admin]
 *   PATCH  /v1/catalog/subcategorias/:id [admin]
 *   DELETE /v1/catalog/subcategorias/:id [admin]
 *
 *   GET    /v1/catalog/colores
 *   POST   /v1/catalog/colores        [admin]
 *   PATCH  /v1/catalog/colores/:id    [admin]
 *   DELETE /v1/catalog/colores/:id    [admin]
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000')

// ─── Tipos locales ────────────────────────────────────────────────────────────
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

/** Shape que devuelve el backend (ProductoApi del backend) */
export interface Product {
  id: string
  codigo: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  subcategory: string
  sizes: string[]
  colors: Array<{ name: string; hex: string }>
  description: string
  featured: boolean
  inStock: boolean
  destacado: boolean
  inCarrusel: boolean
  slug: string
  /** rating y reviewCount no existen en el backend; se dejan opcionales para compatibilidad */
  rating?: number
  reviewCount?: number
  tags?: string[]
  gender?: string
}

export interface ProductFilters {
  categoria?: string      // nombre de categoría
  subcategoria?: string   // nombre de subcategoría
  search?: string
  sortBy?: 'precio_asc' | 'precio_desc' | 'nombre_asc' | 'destacado' | 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'rating'
  minPrice?: number
  maxPrice?: number
  activos?: boolean
  page?: number
  perPage?: number
}

/** Payload para crear / actualizar un producto */
export interface ProductPayload {
  codigo: string
  nombre: string
  descripcion?: string
  precio: number
  precio_anterior?: number | null
  subcategoria_id?: string | null
  activo?: boolean
  destacado?: boolean
  en_carrusel?: boolean
  imagenesUrls?: string[]
  talles?: string[]
  variantes?: Array<{ talle?: string; color_id?: string }>
}

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export interface Categoria {
  id: string
  nombre: string
  created_at?: string
  subcategorias?: Subcategoria[]
}

export interface Subcategoria {
  id: string
  nombre: string
  categoria_id: string
  categoria?: Categoria
  created_at?: string
}

export interface Color {
  id: string
  nombre: string
  codigo_hex?: string | null
  created_at?: string
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function http<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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

// ─── Normalizar sortBy frontend → backend ─────────────────────────────────────
function normalizeSortBy(
  sortBy?: ProductFilters['sortBy'],
): 'precio_asc' | 'precio_desc' | 'nombre_asc' | 'destacado' | undefined {
  switch (sortBy) {
    case 'price_asc':
    case 'precio_asc':
      return 'precio_asc'
    case 'price_desc':
    case 'precio_desc':
      return 'precio_desc'
    case 'name_asc':
    case 'nombre_asc':
      return 'nombre_asc'
    case 'featured':
    case 'destacado':
    case 'rating': // no existe en el backend; cae a destacado
      return 'destacado'
    default:
      return undefined
  }
}

// ─── Products API ─────────────────────────────────────────────────────────────
export const productApi = {

  /** GET /v1/products */
  async list(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams()

    if (filters.categoria)    params.set('categoria',    filters.categoria)
    if (filters.subcategoria) params.set('subcategoria', filters.subcategoria)
    if (filters.search)       params.set('search',       filters.search)
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
    if (filters.page)         params.set('page',    String(filters.page))
    if (filters.perPage)      params.set('perPage', String(filters.perPage))
    if (filters.activos !== undefined) params.set('activos', String(filters.activos))
      
    const sortBy = normalizeSortBy(filters.sortBy)
    if (sortBy) params.set('sortBy', sortBy)

    const res = await http<ApiResponse<never> & PaginatedResponse<Product>>(
      `/products?${params}`,
    )
    // El backend devuelve { success, data, total, page, perPage, totalPages }
    return {
      data:       res.data,
      total:      res.total,
      page:       res.page,
      perPage:    res.perPage,
      totalPages: res.totalPages,
    }
  },

  /** GET /v1/products/carrusel */
  async getCarrusel(): Promise<Product[]> {
    const res = await http<ApiResponse<Product[]>>('/products/carrusel')
    return res.data
  },

  /** GET /v1/products/destacados */
  async getFeatured(): Promise<Product[]> {
    const res = await http<ApiResponse<Product[]>>('/products/destacados')
    return res.data
  },

  /** GET /v1/products/:id */
  async getById(id: string): Promise<Product> {
    const res = await http<ApiResponse<Product>>(`/products/${id}`)
    return res.data
  },

  /** GET /v1/products/codigo/:codigo */
  async getByCodigo(codigo: string): Promise<Product> {
    const res = await http<ApiResponse<Product>>(`/products/codigo/${codigo}`)
    return res.data
  },

  /**
   * getBySlug — el backend no tiene slug real; el slug se genera como
   * `{nombre}-{codigo}` en el mapper del backend. Lo resolvemos listando
   * y buscando localmente, o bien usando el código que viaja en el slug.
   *
   * Estrategia: el slug tiene formato "<nombre-slugificado>-<codigo>".
   * Extraemos el código (último segmento separado por guión) y usamos
   * GET /products/codigo/:codigo.
   */
  async getBySlug(slug: string): Promise<Product> {
    // Intentar extraer el código del slug (último token)
    const parts = slug.split('-')
    const posibleCodigo = parts[parts.length - 1]
    try {
      return await productApi.getByCodigo(posibleCodigo.toUpperCase())
    } catch {
      // Fallback: buscar en el listado completo comparando slug generado
      const res = await productApi.list({ perPage: 50 })
      const found = res.data.find((p) => p.slug === slug)
      if (!found) throw new Error('Producto no encontrado')
      return found
    }
  },

  /** POST /v1/products  [admin] */
  async create(payload: ProductPayload): Promise<Product> {
    const res = await http<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  /** PATCH /v1/products/:id  [admin] */
  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const res = await http<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  /** DELETE /v1/products/:id  [admin] — soft delete (activo = false) */
  async remove(id: string): Promise<void> {
    await http<ApiResponse<null>>(`/products/${id}`, { method: 'DELETE' })
  },

  /** DELETE /v1/products/:id/hard  [admin] — borrado físico */
  async hardDelete(id: string): Promise<void> {
    await http<ApiResponse<null>>(`/products/${id}/hard`, { method: 'DELETE' })
  },
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {

  /** POST /v1/auth/login */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await http<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return res.data
  },

  /** POST /v1/auth/register */
  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await http<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    return res.data
  },

  /** GET /v1/auth/me */
  async me(): Promise<User> {
    const res = await http<ApiResponse<User>>('/auth/me')
    return res.data
  },

  /** POST /v1/auth/logout */
  async logout(): Promise<void> {
    await http<ApiResponse<null>>('/auth/logout', { method: 'POST' })
  },
}

// ─── Catalog API ──────────────────────────────────────────────────────────────
export const catalogApi = {

  // ── Categorías ──────────────────────────────────────────────────────────────

  /** GET /v1/catalog/categorias */
  async listCategorias(): Promise<Categoria[]> {
    const res = await http<ApiResponse<Categoria[]>>('/catalog/categorias')
    return res.data
  },

  /** GET /v1/catalog/categorias/:id */
  async getCategoriaById(id: string): Promise<Categoria> {
    const res = await http<ApiResponse<Categoria>>(`/catalog/categorias/${id}`)
    return res.data
  },

  /** POST /v1/catalog/categorias  [admin] */
  async createCategoria(nombre: string): Promise<Categoria> {
    const res = await http<ApiResponse<Categoria>>('/catalog/categorias', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    })
    return res.data
  },

  /** PATCH /v1/catalog/categorias/:id  [admin] */
  async updateCategoria(id: string, nombre: string): Promise<Categoria> {
    const res = await http<ApiResponse<Categoria>>(`/catalog/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nombre }),
    })
    return res.data
  },

  /** DELETE /v1/catalog/categorias/:id  [admin] */
  async deleteCategoria(id: string): Promise<void> {
    await http<ApiResponse<null>>(`/catalog/categorias/${id}`, { method: 'DELETE' })
  },

  // ── Subcategorías ────────────────────────────────────────────────────────────

  /** GET /v1/catalog/subcategorias?categoria_id=uuid */
  async listSubcategorias(categoriaId?: string): Promise<Subcategoria[]> {
    const params = categoriaId ? `?categoria_id=${categoriaId}` : ''
    const res = await http<ApiResponse<Subcategoria[]>>(`/catalog/subcategorias${params}`)
    return res.data
  },

  /** GET /v1/catalog/subcategorias/:id */
  async getSubcategoriaById(id: string): Promise<Subcategoria> {
    const res = await http<ApiResponse<Subcategoria>>(`/catalog/subcategorias/${id}`)
    return res.data
  },

  /** POST /v1/catalog/subcategorias  [admin] */
  async createSubcategoria(nombre: string, categoriaId: string): Promise<Subcategoria> {
    const res = await http<ApiResponse<Subcategoria>>('/catalog/subcategorias', {
      method: 'POST',
      body: JSON.stringify({ nombre, categoria_id: categoriaId }),
    })
    return res.data
  },

  /** PATCH /v1/catalog/subcategorias/:id  [admin] */
  async updateSubcategoria(
    id: string,
    payload: { nombre?: string; categoria_id?: string },
  ): Promise<Subcategoria> {
    const res = await http<ApiResponse<Subcategoria>>(`/catalog/subcategorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  /** DELETE /v1/catalog/subcategorias/:id  [admin] */
  async deleteSubcategoria(id: string): Promise<void> {
    await http<ApiResponse<null>>(`/catalog/subcategorias/${id}`, { method: 'DELETE' })
  },

  // ── Colores ──────────────────────────────────────────────────────────────────

  /** GET /v1/catalog/colores */
  async listColores(): Promise<Color[]> {
    const res = await http<ApiResponse<Color[]>>('/catalog/colores')
    return res.data
  },

  /** POST /v1/catalog/colores  [admin] */
  async createColor(nombre: string, codigo_hex?: string): Promise<Color> {
    const res = await http<ApiResponse<Color>>('/catalog/colores', {
      method: 'POST',
      body: JSON.stringify({ nombre, codigo_hex }),
    })
    return res.data
  },

  /** PATCH /v1/catalog/colores/:id  [admin] */
  async updateColor(id: string, payload: { nombre?: string; codigo_hex?: string }): Promise<Color> {
    const res = await http<ApiResponse<Color>>(`/catalog/colores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  /** DELETE /v1/catalog/colores/:id  [admin] */
  async deleteColor(id: string): Promise<void> {
    await http<ApiResponse<null>>(`/catalog/colores/${id}`, { method: 'DELETE' })
  },
}
