/**
 * types/index.ts
 *
 * Tipos del frontend alineados con el backend real.
 * Product refleja ProductoApi del backend (lo que devuelve toApi()).
 * CartItem y ColorDot se mantienen igual — son tipos del frontend puro.
 */

// ─── Re-export desde client para no importar de dos lugares ──────────────────
export type {
  Product,
  ProductFilters,
  ProductPayload,
  ProductSize,
  Categoria,
  Subcategoria,
  User,
  Venta,
  VentaItem,
  CreateVentaPayload,
} from '@/api/client'

// ─── CartItem ─────────────────────────────────────────────────────────────────
import type { Product, ProductSize } from '@/api/client'

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedVariant?: ProductSize | null
  unitPrice?: number
}
