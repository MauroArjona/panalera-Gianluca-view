<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { orderApi } from '@/api/client'
import type { Order } from '@/types'

const orders = ref<Order[]>([])
const loading = ref(true)

const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
  pending:    { label: 'Pendiente',   class: 'bg-yellow-100 text-yellow-700', icon: 'fa-clock' },
  processing: { label: 'En proceso',  class: 'bg-blue-100 text-blue-700',    icon: 'fa-gear fa-spin' },
  shipped:    { label: 'Enviado',     class: 'bg-indigo-100 text-indigo-700', icon: 'fa-truck' },
  delivered:  { label: 'Entregado',   class: 'bg-green-100 text-green-700',   icon: 'fa-circle-check' },
  cancelled:  { label: 'Cancelado',   class: 'bg-red-100 text-red-700',       icon: 'fa-circle-xmark' },
}

onMounted(async () => {
  orders.value = await orderApi.list()
  loading.value = false
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Mis Pedidos</h1>

    <!-- Cargando -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 2" :key="n" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div class="flex justify-between mb-3">
          <div class="h-5 bg-gray-200 rounded w-32" />
          <div class="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="m in 3" :key="m" class="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <!-- Sin pedidos -->
    <div v-else-if="orders.length === 0" class="text-center py-20">
      <i class="fa fa-box-open text-6xl text-gray-300 mb-5" />
      <p class="text-xl font-semibold text-gray-500 mb-2">Todavía no tenés pedidos</p>
      <p class="text-gray-400 mb-6">Empezá a comprar para ver tus pedidos acá.</p>
      <router-link to="/shop" class="btn-primary">Ver productos</router-link>
    </div>

    <!-- Lista de pedidos -->
    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Cabecera del pedido -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b">
          <div>
            <span class="font-mono font-bold text-gray-800">{{ order.id }}</span>
            <span class="ml-3 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="['flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', statusConfig[order.status].class]"
            >
              <i :class="['fa text-xs', statusConfig[order.status].icon]" />
              {{ statusConfig[order.status].label }}
            </span>
            <span class="font-bold text-gray-900">${{ order.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Productos -->
        <div class="px-6 py-4">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="item in order.items"
              :key="`${item.product.id}-${item.selectedSize}`"
              class="flex gap-3"
            >
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="w-14 h-14 rounded object-cover shrink-0"
              />
              <div class="min-w-0">
                <p class="text-xs font-medium text-gray-800 truncate">{{ item.product.name }}</p>
                <p class="text-xs text-gray-400">{{ item.selectedSize }} · ×{{ item.quantity }}</p>
                <p class="text-xs font-semibold text-gray-700">
                  ${{ (item.product.price * item.quantity).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Dirección de envío -->
          <div class="mt-4 pt-3 border-t text-xs text-gray-500 flex items-start gap-1">
            <i class="fa fa-map-marker-alt mt-0.5 text-gray-400" />
            {{ order.shippingAddress.address }},
            {{ order.shippingAddress.city }},
            {{ order.shippingAddress.country }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>