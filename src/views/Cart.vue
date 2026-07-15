<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartItemComponent from '@/components/CartItem.vue'
import { getWhatsappOrderUrl } from '@/composables/useWhatsappOrder'

const cart = useCartStore()

const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE?.trim() ?? ''
const siteUrl = (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/$/, '')
const hasWhatsappPhone = computed(() => whatsappPhone.length > 0)

const whatsappUrl = computed(() =>
  getWhatsappOrderUrl({
    phone: whatsappPhone,
    items: cart.items,
    shipping: cart.shipping,
    total: cart.total,
    productUrl: (item) => `${siteUrl}/product/${item.product.id}`,
  })
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Mi carrito</h1>

    <!-- Carrito vacío -->
    <div v-if="cart.items.length === 0" class="text-center py-24">
      <i class="fa fa-cart-arrow-down text-6xl text-gray-300 mb-5" />
      <p class="text-xl font-semibold text-gray-500 mb-2">Tu carrito está vacío</p>
      <p class="text-gray-400 mb-6">Agregá productos para empezar.</p>
      <router-link to="/shop" class="btn-primary text-base px-8 py-3">
        <i class="fa fa-store mr-2" /> Ver productos
      </router-link>
    </div>

    <!-- Contenido del carrito -->
    <div v-else class="grid lg:grid-cols-3 gap-10">

      <!-- Lista de productos -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <CartItemComponent
            v-for="(item, i) in cart.items"
            :key="`${item.product.id}-${item.selectedSize}-${item.selectedColor?.hex ?? 'nc'}`"
            :item="item"
            :index="i"
            @remove="cart.remove"
            @update-qty="cart.updateQuantity"
          />
        </div>

        <div class="flex justify-between mt-4">
          <router-link to="/shop" class="btn-ghost text-sm">
            <i class="fa fa-arrow-left mr-1" /> Seguir comprando
          </router-link>
          <button class="text-sm text-red-500 hover:text-red-700 transition" @click="cart.clear">
            <i class="fa fa-trash mr-1" /> Vaciar carrito
          </button>
        </div>
      </div>

      <!-- Resumen del pedido -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
          <h2 class="text-lg font-bold text-gray-800 mb-5 pb-3 border-b">Resumen del pedido</h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal ({{ cart.totalItems }} artículo{{ cart.totalItems !== 1 ? 's' : '' }})</span>
              <span>${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Envío</span>
              <span :class="cart.shipping === 0 ? 'text-brand font-medium' : ''">
                {{ cart.shipping === 0 ? 'COORDINAR' : `$${cart.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div
              v-if="cart.subtotal < 500"
              class="text-xs text-brand bg-brand/10 rounded p-2"
            >
              <i class="fa fa-truck mr-1" />
              ¡Agregá ${{ (500 - cart.subtotal).toFixed(2) }} más y el envío es gratis!
            </div>
            <hr />
            <div class="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <a
            v-if="hasWhatsappPhone"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary w-full mt-6 py-3 text-base text-center block"
          >
            Enviar pedido por WhatsApp <i class="fab fa-whatsapp ml-2" />
          </a>
          <button
            v-else
            type="button"
            disabled
            class="w-full mt-6 py-3 text-base text-center block rounded bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Falta configurar WhatsApp <i class="fab fa-whatsapp ml-2" />
          </button>

          <!-- Medios de pago -->
          <div class="flex justify-center gap-3 mt-4 text-gray-300">
            <i class="fab fa-cc-visa text-2xl" />
            <i class="fab fa-cc-mastercard text-2xl" />
            <i class="fab fa-cc-paypal text-2xl" />
            <i class="fab fa-cc-amex text-2xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
