import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/types'
import { MOCK_PRODUCTS } from '@/data/mock'

// ─── Runtime store de productos (permite ABM sin backend) ─────────────────────
export const useProductsStore = defineStore('products', () => {
  // Inicializamos con los productos mock; en producción vendrían de la API
  const products = ref<Product[]>([...MOCK_PRODUCTS])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function nextId(): number {
    return products.value.length
      ? Math.max(...products.value.map((p) => p.id)) + 1
      : 1
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  function getAll(): Product[] {
    return products.value
  }

  function getById(id: number): Product | undefined {
    return products.value.find((p) => p.id === id)
  }

  function create(data: Omit<Product, 'id' | 'slug'>): Product {
    const newProduct: Product = {
      ...data,
      id: nextId(),
      slug: toSlug(data.name),
    }
    products.value.unshift(newProduct)
    return newProduct
  }

  function update(id: number, data: Partial<Omit<Product, 'id'>>): Product {
    const idx = products.value.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Producto con id ${id} no encontrado`)
    const updated: Product = {
      ...products.value[idx],
      ...data,
      slug: data.name ? toSlug(data.name) : products.value[idx].slug,
    }
    products.value[idx] = updated
    return updated
  }

  function remove(id: number): void {
    const idx = products.value.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Producto con id ${id} no encontrado`)
    products.value.splice(idx, 1)
  }

  return { products, loading, error, getAll, getById, create, update, remove }
})
