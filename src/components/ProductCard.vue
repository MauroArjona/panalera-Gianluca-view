<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import type { Product } from '@/types'
import StarRating from './StarRating.vue'

const props = defineProps<{ product: Product }>()
const router = useRouter()
const cart = useCartStore()
const { show } = useToast()

function quickAddToCart() {
  cart.add(
    props.product,
    1,
    props.product.sizes[0],
    props.product.colors[0],
  )
  show(`"${props.product.name}" agregado al carrito`, 'success')
}


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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="${color}"/></svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
</script>

<template>
  <div v-if="product.inStock" class="group relative rounded overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">

    <!-- Imagen + overlay -->
    <div class="relative overflow-hidden">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Overlay hover con botones -->
      <div class="product-overlay rounded">
        <div class="flex flex-col gap-2">
          <button
            class="bg-white/20 hover:bg-brand text-white border border-white/50 rounded px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition"
            @click.prevent="quickAddToCart"
          >
            <i class="fas fa-cart-plus mr-1" /> Agregar al carrito
          </button>

          <router-link
            :to="`/product/${product.slug}`"
            class="bg-white/20 hover:bg-white hover:text-gray-800 text-white border border-white/50 rounded px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition text-center"
          >
            <i class="far fa-eye mr-1" /> Ver producto
          </router-link>
        </div>
      </div>

      <!-- Badge descuento -->
      <div
        v-if="product.originalPrice"
        class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded"
      >
        -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
      </div>
    </div>

    <!-- Card body -->
    <div class="p-4">
      <router-link
        :to="`/product/${product.slug}`"
        class="block font-semibold text-gray-800 hover:text-brand transition mb-1 truncate"
      >
        {{ product.name }}
      </router-link>

      <!-- Talles -->
      <p class="text-xs text-gray-400 mb-2">
        {{ product.sizes.join(' / ') }}
      </p>

      <!-- Colores + estrellas -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex gap-1">
          <img
            v-for="c in product.colors.slice(0, 5)"
            :key="c.hex"
            :title="c.name"
            :src="colorDotSrc(c.hex)"
            alt=""
            aria-hidden="true"
            class="product-color-dot w-3.5 h-3.5 rounded-full border border-gray-200 cursor-default"
          />
        </div>

        <!-- <StarRating :rating="product.rating" size="sm" /> -->
      </div>

      <!-- Precio -->
      <div class="flex items-center justify-between mt-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-900">
            ${{ product.price.toFixed(2) }}
          </span>

          <span
            v-if="product.originalPrice"
            class="text-xs text-gray-400 line-through"
          >
            ${{ product.originalPrice.toFixed(2) }}
          </span>
        </div>

        <!-- <span class="text-xs text-gray-400">
          {{ product.reviewCount }} reseñas
        </span> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-color-dot {
  display: inline-block;
  flex-shrink: 0;
  object-fit: cover;
  background: transparent !important;
  forced-color-adjust: none;
  filter: none !important;
}
</style>
