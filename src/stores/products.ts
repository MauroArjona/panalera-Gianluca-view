import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productApi } from '@/api/client'
import type { Product, ProductPayload } from '@/types'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await productApi.list({ perPage: 200, page: 1 })
      products.value = res.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar productos.'
    } finally {
      loading.value = false
    }
  }

  function getAll(): Product[] {
    return products.value
  }

  function getById(id: number): Product | undefined {
    return products.value.find((p) => p.id === id)
  }

  async function create(data: ProductPayload): Promise<Product> {
    const product = await productApi.create(data)
    products.value.unshift(product)
    return product
  }

  async function update(id: number, data: Partial<ProductPayload>): Promise<Product> {
    const product = await productApi.update(id, data)
    const idx = products.value.findIndex((p) => p.id === id)
    if (idx !== -1) products.value[idx] = product
    return product
  }

  async function remove(id: number): Promise<void> {
    await productApi.remove(id)
    products.value = products.value.filter((p) => p.id !== id)
  }

  return { products, loading, error, fetchAll, getAll, getById, create, update, remove }
})
