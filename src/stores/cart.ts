import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product, ColorDot } from '@/types'

export const useCartStore = defineStore('cart', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const items = ref<CartItem[]>(loadFromStorage())
  const isOpen = ref(false)

  // ─── Getters ────────────────────────────────────────────────────────────────
  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0),
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  )

  const shipping = computed(() => (subtotal.value > 500 ? 0 : 15))

  const total = computed(() => subtotal.value + shipping.value)

  // ─── Actions ────────────────────────────────────────────────────────────────
  function add(
    product: Product,
    quantity = 1,
    selectedSize: string,
    selectedColor: ColorDot,
  ) {
    const existing = items.value.find(
      (i) =>
        i.product.id === product.id &&
        i.selectedSize === selectedSize &&
        i.selectedColor.hex === selectedColor.hex,
    )

    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity, selectedSize, selectedColor })
    }
    persist()
  }

  function remove(index: number) {
    items.value.splice(index, 1)
    persist()
  }

  function updateQuantity(index: number, quantity: number) {
    if (quantity < 1) {
      remove(index)
      return
    }
    items.value[index].quantity = quantity
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  function toggleCart() {
    isOpen.value = !isOpen.value
  }

  function openCart() {
    isOpen.value = true
  }

  function closeCart() {
    isOpen.value = false
  }

  // ─── Persistence ────────────────────────────────────────────────────────────
  function persist() {
    localStorage.setItem('zay_cart', JSON.stringify(items.value))
  }

  function loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem('zay_cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  return {
    items,
    isOpen,
    totalItems,
    subtotal,
    shipping,
    total,
    add,
    remove,
    updateQuantity,
    clear,
    toggleCart,
    openCart,
    closeCart,
  }
})
