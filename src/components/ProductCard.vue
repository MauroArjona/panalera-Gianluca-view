<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { getProductImage } from '@/utils/productImage'
import type { Product } from '@/api/client'
import type { ColorDot } from '@/types'

const props = defineProps<{ product: Product }>()
const cart   = useCartStore()
const { show } = useToast()

// Stock: el backend devuelve `stock` numérico
const inStock = computed(() => props.product.stock > 0)
const productImage = computed(() => getProductImage(props.product))

// El backend devuelve 'talle' como string simple o null
// Parseamos a array para mostrar en la card
const sizesArray = computed<string[]>(() => {
  if (!props.product.talle) return []
  return props.product.talle
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== 'unidad')
})

function quickAddToCart() {
  if (!inStock.value) return
  const color: ColorDot = { name: '', hex: '#000000' }
  cart.add(props.product, 1, sizesArray.value[0] ?? '', color)
  show(`"${props.product.name}" agregado al carrito`, 'success')
}
</script>

<template>
  <div
    :class="[
      'group relative rounded-lg overflow-hidden bg-white border border-sky-100 shadow-sm transition-all duration-300',
      inStock ? 'hover:shadow-md hover:-translate-y-0.5' : 'opacity-75',
    ]"
  >

    <!-- Imagen + overlay -->
    <div class="relative overflow-hidden bg-sky-50">
      <img
        :src="productImage"
        :alt="product.name"
        class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      <!-- Overlay hover -->
      <div class="product-overlay rounded">
        <div class="flex flex-col gap-2">
          <button
            :disabled="!inStock"
            :class="[
              'bg-white/20 text-white border border-white/50 rounded px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition',
              inStock ? 'hover:bg-brand' : 'cursor-not-allowed opacity-70',
            ]"
            @click.prevent="quickAddToCart"
          >
            <i :class="['fas mr-1', inStock ? 'fa-cart-plus' : 'fa-circle-xmark']" />
            {{ inStock ? 'Agregar al carrito' : 'Sin stock' }}
          </button>

          <!-- Navegar al detalle usando el ID numérico -->
          <router-link
            :to="`/product/${product.id}`"
            class="bg-white/20 hover:bg-white hover:text-gray-800 text-white border border-white/50 rounded px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition text-center"
          >
            <i class="far fa-eye mr-1" /> Ver producto
          </router-link>
        </div>
      </div>

      <!-- Badge descuento -->
      <div
        v-if="product.oldPrice"
        class="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded"
      >
        -{{ Math.round((1 - product.price / product.oldPrice) * 100) }}%
      </div>

      <!-- Badge promo -->
      <div
        v-else-if="product.isPromo"
        class="absolute top-2 left-2 bg-amber-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded"
      >
        Promo
      </div>

      <div
        v-if="product.destacado"
        class="absolute top-2 right-2 bg-white/90 text-amber-500 text-xs font-bold px-2 py-0.5 rounded shadow-sm"
      >
        <i class="fa fa-star mr-1" /> Destacado
      </div>

      <div
        v-if="!inStock"
        class="absolute inset-x-3 bottom-3 bg-white/95 text-red-600 text-xs font-bold px-3 py-2 rounded shadow-sm text-center"
      >
        Sin stock por el momento
      </div>
    </div>

    <!-- Card body -->
    <div class="p-4">
      <p v-if="product.subcategory" class="text-xs font-semibold uppercase tracking-wide text-brand mb-1">
        {{ product.subcategory }}
      </p>

      <router-link
        :to="`/product/${product.id}`"
        class="block font-semibold text-gray-900 hover:text-brand transition mb-1 line-clamp-2 min-h-[2.5rem]"
      >
        {{ product.name }}
      </router-link>

      <!-- Talles -->
      <p v-if="sizesArray.length > 0" class="text-xs text-gray-500 mb-3">
        <i class="fa fa-layer-group text-sky-300 mr-1" /> {{ sizesArray.join(' / ') }}
      </p>

      <!-- Precio -->
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg text-gray-900">
            ${{ product.price.toFixed(2) }}
          </span>
          <span
            v-if="product.oldPrice"
            class="text-xs text-gray-400 line-through"
          >
            ${{ product.oldPrice.toFixed(2) }}
          </span>
        </div>
        <button
          :disabled="!inStock"
          :class="[
            'w-9 h-9 rounded-full transition',
            inStock ? 'bg-sky-50 text-brand hover:bg-brand hover:text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          ]"
          :title="inStock ? 'Agregar al carrito' : 'Sin stock'"
          @click.prevent="quickAddToCart"
        >
          <i class="fa fa-cart-plus text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>
