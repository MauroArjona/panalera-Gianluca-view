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

// ─── ColorDot: usado por el carrito y ProductCard ─────────────────────────────
/**
 * El backend no tiene un campo "colors" en Product.
 * El carrito guarda el color seleccionado como { name, hex }
 * que el usuario elige desde la UI (colores del catálogo).
 */
export interface ColorDot {
  name: string
  hex: string
}

// ─── CartItem ─────────────────────────────────────────────────────────────────
import type { Product } from '@/api/client'

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: ColorDot
}
