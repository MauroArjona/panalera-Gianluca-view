import type { Product } from '@/api/client'

export const PRODUCT_IMAGE_PLACEHOLDER = '/placeholder-product.svg'
const API_BASE_URL = `${(import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/v1`

type ProductImageSource = Pick<Product, 'image' | 'images'> | null | undefined

export function getProductImage(product: ProductImageSource) {
  const mainImage = product?.image?.trim()
  if (mainImage) return normalizeProductImageUrl(mainImage)

  const firstImage = product?.images?.find((url) => url.trim().length > 0)?.trim()
  return firstImage ? normalizeProductImageUrl(firstImage) : PRODUCT_IMAGE_PLACEHOLDER
}

export function normalizeProductImageUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.endsWith('.supabase.co') && parsed.pathname.includes('/storage/v1/object/')) {
      return `${API_BASE_URL}/upload/imagen?url=${encodeURIComponent(url)}`
    }
  } catch {
    return url
  }

  return url
}
