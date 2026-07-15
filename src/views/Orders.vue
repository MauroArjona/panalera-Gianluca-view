<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi } from '@/api/client'
import type { Venta } from '@/api/client'

const orders = ref<Venta[]>([])
const loading = ref(true)

const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
  pendiente: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-700', icon: 'fa-clock' },
  procesando: { label: 'En proceso', class: 'bg-blue-100 text-blue-700', icon: 'fa-gear fa-spin' },
  enviado: { label: 'Enviado', class: 'bg-indigo-100 text-indigo-700', icon: 'fa-truck' },
  entregado: { label: 'Entregado', class: 'bg-green-100 text-green-700', icon: 'fa-circle-check' },
  cancelado: { label: 'Cancelado', class: 'bg-red-100 text-red-700', icon: 'fa-circle-xmark' },
}

onMounted(async () => {
  try {
    orders.value = await orderApi.listAll()
  } finally {
    loading.value = false
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusFor(status: string) {
  return statusConfig[status] ?? statusConfig.pendiente
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Pedidos</h1>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 2" :key="n" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div class="flex justify-between mb-3">
          <div class="h-5 bg-gray-200 rounded w-32" />
          <div class="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div class="h-20 bg-gray-200 rounded" />
      </div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-20">
      <i class="fa fa-box-open text-6xl text-gray-300 mb-5" />
      <p class="text-xl font-semibold text-gray-500 mb-2">Todavia no hay pedidos</p>
      <router-link to="/shop" class="btn-primary">Ver productos</router-link>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b">
          <div>
            <span class="font-mono font-bold text-gray-800">Venta #{{ order.id }}</span>
            <span class="ml-3 text-sm text-gray-500">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="['flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', statusFor(order.estado).class]"
            >
              <i :class="['fa text-xs', statusFor(order.estado).icon]" />
              {{ statusFor(order.estado).label }}
            </span>
            <span class="font-bold text-gray-900">${{ order.total.toFixed(2) }}</span>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="divide-y">
            <div v-for="(item, idx) in order.items" :key="idx" class="flex justify-between gap-4 py-3">
              <div>
                <p class="text-sm font-medium text-gray-800">Producto #{{ item.productId }}</p>
                <p class="text-xs text-gray-400">
                  <span v-if="item.size">{{ item.size }} · </span>
                  Cantidad {{ item.quantity }}
                </p>
              </div>
              <p class="font-semibold text-gray-800 text-sm">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
