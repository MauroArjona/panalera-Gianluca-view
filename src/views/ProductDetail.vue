<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { productApi } from '@/api/client'
import StarRating from '@/components/StarRating.vue'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/api/client'

const route = useRoute()
const cart  = useCartStore()
const { show } = useToast()

const product      = ref<Product | null>(null)
const related      = ref<Product[]>([])
const loading      = ref(true)
const error        = ref(false)

const selectedImage = ref(0)
const selectedSize  = ref('')
const selectedColor = ref<{ name: string; hex: string } | null>(null)
const quantity      = ref(1)
const addedToCart   = ref(false)


function normalizeHexColor(value?: string | null) {
  const color = value?.trim() ?? ''

  if (/^#[0-9a-f]{6}$/i.test(color)) return color

  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return '#ffffff'
}

function colorDotSrc(value?: string | null) {
  const color = normalizeHexColor(value)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${color}"/></svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

async function loadProduct(slug: string) {
  loading.value = true
  error.value   = false
  product.value = null
  related.value = []

  try {
    // getBySlug extrae el código del slug y usa GET /products/codigo/:codigo
    product.value = await productApi.getBySlug(slug)

    // Pre-seleccionar primer talle y color disponibles
    selectedSize.value  = product.value.sizes[0]   ?? ''
    selectedColor.value = product.value.colors[0]  ?? null
    selectedImage.value = 0

    // Productos relacionados: misma categoría, excluyendo el actual
    const res = await productApi.list({
      categoria: product.value.category,
      perPage:   4,
    })
    related.value = res.data.filter((p) => p.id !== product.value!.id).slice(0, 3)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProduct(route.params.slug as string))

// Recargar si navegamos entre productos relacionados
watch(
  () => route.params.slug,
  (slug) => { if (slug) loadProduct(slug as string) },
)

function addToCart() {
  if (!product.value) return

  // El cart store espera un objeto compatible; lo mapeamos
  const productForCart = {
    ...product.value,
    // Alias para compatibilidad con el store existente
    id:    product.value.id as unknown as number,
    rating:      product.value.rating      ?? 0,
    reviewCount: product.value.reviewCount ?? 0,
    tags:        product.value.tags        ?? [],
    gender:      product.value.gender      ?? 'unisex',
    featured:    product.value.featured,
    inStock:     product.value.inStock,
  }

  cart.add(
    productForCart as Parameters<typeof cart.add>[0],
    quantity.value,
    selectedSize.value,
    selectedColor.value ?? { name: '', hex: '#000000' },
  )
  addedToCart.value = true
  show(`"${product.value.name}" agregado al carrito!`, 'success')
  setTimeout(() => (addedToCart.value = false), 2000)
}
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
        <div class="grid grid-cols-4 gap-2">
          <div v-for="n in 3" :key="n" class="bg-gray-200 rounded aspect-square" />
        </div>
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

      <!-- Galería -->
      <div>
        <div class="rounded-lg overflow-hidden bg-gray-100 mb-3">
          <img
            :src="product.images[selectedImage] || product.image"
            :alt="product.name"
            class="w-full aspect-square object-cover"
          />
        </div>
        <div v-if="product.images.length > 1" class="grid grid-cols-4 gap-2">
          <button
            v-for="(img, i) in product.images"
            :key="i"
            :class="['rounded overflow-hidden border-2 transition', i === selectedImage ? 'border-brand' : 'border-transparent']"
            @click="selectedImage = i"
          >
            <img :src="img" :alt="`vista ${i + 1}`" class="w-full aspect-square object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div>
        <!-- Código badge -->
        <span class="inline-block mb-2 font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
          {{ product.codigo }}
        </span>

        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{{ product.name }}</h1>

        <!-- Categoría / subcategoría -->
        <p class="text-sm text-gray-400 mb-4">
          {{ product.category }}
          <span v-if="product.subcategory"> / {{ product.subcategory }}</span>
        </p>

        <!-- Rating (si existe) -->
        <div v-if="product.rating" class="flex items-center gap-3 mb-4">
          <StarRating :rating="product.rating" size="md" />
          <span class="text-sm text-gray-500">{{ product.reviewCount }} reseñas</span>
        </div>

        <!-- Precio -->
        <div class="flex items-baseline gap-3 mb-5">
          <span class="text-3xl font-bold text-gray-900">${{ product.price.toFixed(2) }}</span>
          <span v-if="product.originalPrice" class="text-lg text-gray-400 line-through">
            ${{ product.originalPrice.toFixed(2) }}
          </span>
          <span
            v-if="product.originalPrice"
            class="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded"
          >
            Ahorrás {{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
          </span>
        </div>

        <!-- Descripción -->
        <p v-if="product.description" class="text-gray-600 leading-relaxed mb-6">
          {{ product.description }}
        </p>

        <!-- Estado de stock -->
        <div class="mb-5">
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
              product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
            ]"
          >
            <i :class="['fa text-xs', product.inStock ? 'fa-circle-check' : 'fa-circle-xmark']" />
            {{ product.inStock ? 'En stock' : 'Sin stock' }}
          </span>
        </div>

        <!-- Talles -->
        <div v-if="product.sizes.length > 0" class="mb-5">
          <p class="text-sm font-semibold text-gray-700 mb-2">
            Talle: <span class="text-brand">{{ selectedSize }}</span>
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in product.sizes"
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

<!-- Colores -->
<div v-if="product.colors.length > 0" class="mb-5">
  <p class="text-sm font-semibold text-gray-700 mb-2">
    Color: <span class="text-brand">{{ selectedColor?.name }}</span>
  </p>
  <div class="relative">
    <div class="m-2 grid-flow-row gap-2 overflow-x-auto pb-1
                scrollbar-none [&::-webkit-scrollbar]:hidden">
      <button
        v-for="color in product.colors"
        :key="color.name"
        :title="color.name"
        :class="[
          'shrink-0 w-8 h-8 rounded-full border-2 transition-transform m-1 overflow-hidden bg-transparent p-0',
          selectedColor?.name === color.name
            ? 'border-brand scale-110'
            : 'border-gray-300 hover:border-brand',
        ]"
        @click="selectedColor = color"
      >
        <img
          :src="colorDotSrc(color.hex)"
          alt=""
          aria-hidden="true"
          class="product-detail-color-dot h-full w-full rounded-full"
        />
      </button>
    </div>
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
              @click="quantity++"
            >
              <i class="fa fa-plus text-xs" />
            </button>
          </div>

          <button
            :class="[
              'btn-primary flex-1 py-3 text-base transition',
              addedToCart ? 'bg-green-600' : '',
              !product.inStock ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            :disabled="!product.inStock"
            @click="addToCart"
          >
            <i :class="['fa mr-2', addedToCart ? 'fa-check' : 'fa-cart-plus']" />
            {{ addedToCart ? '¡Agregado!' : product.inStock ? 'Agregar' : 'Sin stock' }}
          </button>

          <router-link to="/cart" class="btn-outline py-3 px-4">
            <i class="fa fa-shopping-cart" />
          </router-link>
        </div>

        <!-- Tags -->
        <div v-if="product.tags && product.tags.length > 0" class="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <span
            v-for="tag in product.tags"
            :key="tag"
            class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded"
          >
            #{{ tag }}
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

<style scoped>
.product-detail-color-dot {
  display: block;
  object-fit: cover;
  background: transparent !important;
  forced-color-adjust: none;
  filter: none !important;
}
</style>
