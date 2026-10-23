<script setup lang="ts">
import { computed } from 'vue'
import { getProductImage, normalizeProductImageUrl } from '@/utils/productImage'
import type { CartItem } from '@/types'

const props = defineProps<{
  item: CartItem
  index: number
}>()

const emit = defineEmits<{
  remove: [index: number]
  updateQty: [index: number, qty: number]
}>()

const productImage = computed(() =>
  props.item.selectedVariant?.image
    ? normalizeProductImageUrl(props.item.selectedVariant.image)
    : getProductImage(props.item.product),
)

const unitPrice = computed(() => props.item.unitPrice ?? props.item.product.price)
const isDiaperProduct = computed(() => {
  const label = `${props.item.product.category} ${props.item.product.subcategory}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return label.includes('panal')
})
const showSize = computed(() => isDiaperProduct.value && Boolean(props.item.selectedSize))
const showPresentation = computed(() => Boolean(props.item.selectedVariant?.units))
</script>

<template>
  <div class="flex gap-4 py-4 border-b border-gray-100 last:border-0">
    <!-- Product image -->
    <router-link :to="`/product/${item.product.id}`" class="shrink-0">
      <img
        :src="productImage"
        :alt="item.product.name"
        class="w-20 h-20 object-cover rounded"
        loading="lazy"
        decoding="async"
      />
    </router-link>

    <!-- Details -->
    <div class="flex-1 min-w-0">
      <router-link
        :to="`/product/${item.product.id}`"
        class="font-semibold text-gray-800 hover:text-brand transition text-sm line-clamp-2"
      >
        {{ item.product.name }}
      </router-link>

      <div v-if="showSize || showPresentation" class="flex items-center gap-2 mt-1 text-xs text-gray-500">
        <span v-if="showSize">Talle: {{ item.selectedSize }}</span>
        <span v-if="showSize && showPresentation">-</span>
        <span v-if="showPresentation">{{ isDiaperProduct ? item.selectedVariant?.units : `Presentación: ${item.selectedVariant?.units}` }}</span>
      </div>

      <!-- Qty controls + price -->
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center border border-gray-200 rounded overflow-hidden">
          <button
            class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition text-sm"
            @click="emit('updateQty', index, item.quantity - 1)"
          >
            <i class="fa fa-minus text-[10px]" />
          </button>
          <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
          <button
            class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition text-sm"
            @click="emit('updateQty', index, item.quantity + 1)"
          >
            <i class="fa fa-plus text-[10px]" />
          </button>
        </div>

        <div class="flex items-center gap-3">
          <span class="font-bold text-gray-900 text-sm">
            ${{ (unitPrice * item.quantity).toFixed(2) }}
          </span>
          <button
            class="text-red-400 hover:text-red-600 transition p-1"
            title="Remove"
            @click="emit('remove', index)"
          >
            <i class="fa fa-trash text-sm" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
