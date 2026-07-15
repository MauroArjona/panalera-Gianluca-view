<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { productApi } from '@/api/client'
import { getProductImage, normalizeProductImageUrl } from '@/utils/productImage'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/api/client'
import type { ColorDot } from '@/types'

const route = useRoute()
const cart  = useCartStore()
const { show } = useToast()

const product      = ref<Product | null>(null)
const related      = ref<Product[]>([])
const loading      = ref(true)
const error        = ref(false)

const selectedSize  = ref('')
const selectedColor = ref<ColorDot>({ name: '', hex: '#000000' })
const quantity      = ref(1)
const addedToCart   = ref(false)
const selectedImage = ref('')

// El backend devuelve 'talle' como string simple (ej. "39" o "39,40,41")
// Parseamos a array para la UI
const sizesArray = computed<string[]>(() => {
  if (!product.value?.talle) return []
  return product.value.talle
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== 'unidad')
})

async function loadProduct(id: string) {
  loading.value = true
  error.value   = false
  product.value = null
  related.value = []

  const numId = Number(id)
  if (isNaN(numId)) {
    error.value   = true
    loading.value = false
    return
  }

  try {
    product.value = await productApi.getById(numId)

    // Pre-seleccionar primer talle disponible
    selectedSize.value = sizesArray.value[0] ?? ''

    // El backend no tiene colores por producto — inicializar vacío
    selectedColor.value = { name: '', hex: '#000000' }

    // Productos relacionados: misma categoría, excluyendo el actual
    const res = await productApi.list({
      category: product.value.category,
      perPage:  4,
    })
    related.value = res.data.filter((p) => p.id !== product.value!.id).slice(0, 3)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProduct(route.params.id as string))

watch(
  () => route.params.id,
  (id) => { if (id) loadProduct(id as string) },
)

function addToCart() {
  if (!product.value) return
  cart.add(product.value, quantity.value, selectedSize.value, selectedColor.value)
  addedToCart.value = true
  show(`"${product.value.name}" agregado al carrito!`, 'success')
  setTimeout(() => (addedToCart.value = false), 2000)
}

// Stock: el backend devuelve `stock` numérico
const inStock = computed(() => (product.value?.stock ?? 0) > 0)
const productImages = computed(() => {
  if (!product.value) return []
  const images = [product.value.image, ...(product.value.images ?? [])]
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))
    .map(normalizeProductImageUrl)

  return Array.from(new Set(images))
})
const productImage = computed(() => selectedImage.value || getProductImage(product.value))

watch(productImages, (images) => {
  selectedImage.value = images[0] ?? ''
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10 overflow-x-hidden">

    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-400 mb-6 flex items-center gap-2">
      <router-link to="/" class="hover:text-brand transition">Inicio</router-link>
      <i class="fa fa-chevron-right text-xs" />
      <router-link to="/shop" class="hover:text-brand transition">Tienda</router-link>
      <i class="fa fa-chevron-right text-xs" />
      <span class="text-gray-600">{{ product?.name ?? '…' }}</span>
    </nav>

    <!-- Skeleton -->
    <div v-if="loading" class="grid md:grid-cols-2 gap-12 animate-pulse">
      <div class="space-y-3">
        <div class="bg-gray-200 rounded-lg aspect-square" />
      </div>
      <div class="space-y-4">
        <div class="h-8 bg-gray-200 rounded w-3/4" />
        <div class="h-5 bg-gray-200 rounded w-1/4" />
        <div class="h-4 bg-gray-200 rounded" />
        <div class="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 text-gray-400">
      <i class="fa fa-triangle-exclamation text-5xl mb-4 text-red-300 block" />
      <p class="text-lg font-medium">Producto no encontrado</p>
      <router-link to="/shop" class="btn-primary mt-4 text-sm">Volver a la tienda</router-link>
    </div>

    <!-- Detalle del producto -->
    <div v-else-if="product" class="grid md:grid-cols-2 gap-12">

      <!-- Imagen principal -->
      <div class="space-y-3">
        <div class="rounded-lg overflow-hidden bg-gray-100">
          <img
            :src="productImage"
            :alt="product.name"
            class="w-full aspect-square object-cover"
          />
        </div>

        <div v-if="productImages.length > 1" class="grid grid-cols-5 sm:grid-cols-6 gap-2">
          <button
            v-for="image in productImages"
            :key="image"
            type="button"
            :class="[
              'aspect-square rounded-md overflow-hidden border-2 bg-gray-100 transition',
              image === productImage ? 'border-brand' : 'border-transparent hover:border-brand/50',
            ]"
            @click="selectedImage = image"
          >
            <img
              :src="image"
              :alt="product.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{{ product.name }}</h1>

        <!-- Categoría -->
        <p class="text-sm text-gray-400 mb-4">{{ product.category }}</p>

        <p v-if="product.subcategory" class="text-sm text-gray-500 mb-4">
          <span class="font-medium text-gray-700">Subcategoria:</span> {{ product.subcategory }}
        </p>

        <!-- Precio -->
        <div class="flex items-baseline gap-3 mb-5">
          <span class="text-3xl font-bold text-gray-900">${{ product.price.toFixed(2) }}</span>
          <span v-if="product.oldPrice" class="text-lg text-gray-400 line-through">
            ${{ product.oldPrice.toFixed(2) }}
          </span>
          <span
            v-if="product.oldPrice"
            class="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded"
          >
            Ahorrás {{ Math.round((1 - product.price / product.oldPrice) * 100) }}%
          </span>
        </div>

        <!-- Estado de stock -->
        <div class="mb-5">
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
            ]"
          >
            <i :class="['fa text-xs', inStock ? 'fa-circle-check' : 'fa-circle-xmark']" />
            {{ inStock ? `En stock (${product.stock})` : 'Sin stock' }}
          </span>
        </div>

        <!-- Talles (si existen) -->
        <div v-if="sizesArray.length > 0" class="mb-5">
          <p class="text-sm font-semibold text-gray-700 mb-2">
            Talle: <span class="text-brand">{{ selectedSize }}</span>
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in sizesArray"
              :key="size"
              :class="[
                'px-3 py-1.5 border rounded text-sm font-medium transition',
                selectedSize === size
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-300 text-gray-700 hover:border-brand',
              ]"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Cantidad + Agregar al carrito -->
        <div class="flex items-center gap-4">
          <div class="flex items-center border border-gray-300 rounded overflow-hidden">
            <button
              class="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              @click="quantity = Math.max(1, quantity - 1)"
            >
              <i class="fa fa-minus text-xs" />
            </button>
            <span class="w-12 text-center font-semibold text-gray-800">{{ quantity }}</span>
            <button
              class="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              @click="quantity = Math.min(product.stock, quantity + 1)"
            >
              <i class="fa fa-plus text-xs" />
            </button>
          </div>

          <button
            :class="[
              'btn-primary flex-1 py-3 text-base transition',
              addedToCart ? 'bg-brand-600' : '',
              !inStock ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            :disabled="!inStock"
            @click="addToCart"
          >
            <i :class="['fa mr-2', addedToCart ? 'fa-check' : 'fa-cart-plus']" />
            {{ addedToCart ? '¡Agregado!' : inStock ? 'Agregar al carrito' : 'Sin stock' }}
          </button>

          <router-link to="/cart" class="btn-outline py-3 px-4">
            <i class="fa fa-shopping-cart" />
          </router-link>
        </div>

        <!-- Promo badge -->
        <div v-if="product.isPromo" class="mt-4">
          <span class="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
            🔥 Promoción
          </span>
        </div>
      </div>
    </div>

    <!-- Productos relacionados -->
    <div v-if="related.length > 0" class="mt-16">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">También te puede interesar</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <ProductCard v-for="p in related" :key="p.id" :product="p" />
      </div>
    </div>
  </div>
</template>
