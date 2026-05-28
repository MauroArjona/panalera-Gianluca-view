<script setup lang="ts">
import type { Product } from '@/api/client'

const props = defineProps<{
  products: Product[]
  loading: boolean
  togglingIds: Set<string>
  categoriasUnicas: string[]

  search: string
  categoriaFilter: string
  stockFilter: 'all' | 'active' | 'inactive'
  sortField: 'name' | 'price' | 'category'
  sortDir: 'asc' | 'desc'
  currentPage: number
  perPage: number
  total: number
}>()

const emit = defineEmits<{
  'update:search': [v: string]
  'update:categoriaFilter': [v: string]
  'update:stockFilter': [v: 'all' | 'active' | 'inactive']
  'update:currentPage': [v: number]
  'sort': [field: 'name' | 'price' | 'category']
  'edit': [product: Product]
  'toggleStock': [product: Product]
  'create': []
}>()

import { computed } from 'vue'

const filteredProducts = computed(() => {
  let list = [...props.products]

  if (props.search.trim()) {
    const q = props.search.trim().toLowerCase()
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    )
  }

  if (props.categoriaFilter)
    list = list.filter((p) => p.category.toLowerCase() === props.categoriaFilter.toLowerCase())

  if (props.stockFilter === 'active')   list = list.filter((p) => p.inStock)
  if (props.stockFilter === 'inactive') list = list.filter((p) => !p.inStock)

  list.sort((a, b) => {
    const va = String(a[props.sortField as keyof Product] ?? '')
    const vb = String(b[props.sortField as keyof Product] ?? '')
    return props.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / props.perPage)))

const paginated = computed(() => {
  const start = (props.currentPage - 1) * props.perPage
  return filteredProducts.value.slice(start, start + props.perPage)
})

function resetPage() { emit('update:currentPage', 1) }

function sortIcon(field: string) {
  if (props.sortField !== field) return 'fa-sort text-gray-300'
  return props.sortDir === 'asc' ? 'fa-arrow-up text-brand' : 'fa-arrow-down text-brand'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          <i class="fa fa-box-open text-brand mr-2"></i>Gestión de Productos
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ total }} producto{{ total !== 1 ? 's' : '' }} en total
        </p>
      </div>
      <button class="btn-primary gap-2" @click="$emit('create')">
        <i class="fa fa-plus"></i>Nuevo Producto
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-5">

      <!-- Buscador -->
      <div class="relative flex-1 min-w-[200px]">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          :value="search"
          type="text"
          placeholder="Buscar por nombre, código o categoría…"
          class="input pl-9"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value); resetPage()"
        />
      </div>

      <!-- Filtro categoría -->
      <select
        :value="categoriaFilter"
        class="input w-48"
        @change="$emit('update:categoriaFilter', ($event.target as HTMLSelectElement).value); resetPage()"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in categoriasUnicas" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <!-- Filtro stock -->
      <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        <button
          :class="['px-3 py-2 transition font-medium', stockFilter === 'all' ? 'bg-brand text-white' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:stockFilter', 'all'); resetPage()"
        >Todos</button>
        <button
          :class="['px-3 py-2 transition font-medium border-l border-gray-200 flex items-center gap-1.5', stockFilter === 'active' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:stockFilter', 'active'); resetPage()"
        >
          <i class="fa fa-circle-check text-xs"></i>Activos
        </button>
        <button
          :class="['px-3 py-2 transition font-medium border-l border-gray-200 flex items-center gap-1.5', stockFilter === 'inactive' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:stockFilter', 'inactive'); resetPage()"
        >
          <i class="fa fa-circle-xmark text-xs"></i>Inactivos
        </button>
      </div>

      <!-- Ordenar -->
      <select
        class="input w-52"
        :value="`${sortField}:${sortDir}`"
        @change="(e) => {
          const [f, d] = (e.target as HTMLSelectElement).value.split(':')
          $emit('sort', f as any)
          resetPage()
        }"
      >
        <option value="name:asc">Nombre A → Z</option>
        <option value="name:desc">Nombre Z → A</option>
        <option value="price:asc">Precio ↑ menor a mayor</option>
        <option value="price:desc">Precio ↓ mayor a menor</option>
        <option value="category:asc">Categoría A → Z</option>
        <option value="category:desc">Categoría Z → A</option>
      </select>

    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <i class="fa fa-spinner fa-spin text-3xl"></i>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
            <tr>
              <th class="px-4 py-3 text-left w-16">Img</th>
              <th
                class="px-4 py-3 text-left cursor-pointer hover:text-brand transition select-none"
                @click="$emit('sort', 'name')"
              >
                Nombre <i :class="['fa ml-1', sortIcon('name')]"></i>
              </th>
              <th class="px-4 py-3 text-left">Código</th>
              <th
                class="px-4 py-3 text-left cursor-pointer hover:text-brand transition select-none"
                @click="$emit('sort', 'category')"
              >
                Categoría <i :class="['fa ml-1', sortIcon('category')]"></i>
              </th>
              <th
                class="px-4 py-3 text-right cursor-pointer hover:text-brand transition select-none"
                @click="$emit('sort', 'price')"
              >
                Precio <i :class="['fa ml-1', sortIcon('price')]"></i>
              </th>
              <th class="px-4 py-3 text-center">Stock</th>
              <th class="px-4 py-3 text-center">Destacado</th>
              <th class="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginated.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">
                <i class="fa fa-inbox text-3xl block mb-2"></i>No se encontraron productos.
              </td>
            </tr>
            <tr
              v-for="product in paginated"
              :key="product.id"
              class="hover:bg-gray-50 transition"
              :class="{ 'opacity-50': togglingIds.has(product.id) }"
            >
              <td class="px-4 py-3">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  loading="lazy"
                />
                <div v-else class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i class="fa fa-image text-gray-300"></i>
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900 truncate max-w-[180px]">{{ product.name }}</p>
                <p class="text-xs text-gray-400">{{ product.subcategory }}</p>
              </td>
              <td class="px-4 py-3">
                <span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{{ product.codigo }}</span>
              </td>
              <td class="px-4 py-3 capitalize">{{ product.category }}</td>
              <td class="px-4 py-3 text-right">
                <span class="font-semibold text-gray-900">${{ product.price.toFixed(2) }}</span>
                <span v-if="product.originalPrice" class="ml-1 text-xs text-gray-400 line-through">
                  ${{ product.originalPrice.toFixed(2) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
                  <i :class="['fa text-[9px]', product.inStock ? 'fa-circle-check' : 'fa-circle-xmark']"></i>
                  {{ product.inStock ? 'Disponible' : 'Sin stock' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <i :class="['fa fa-star', product.featured ? 'text-yellow-400' : 'text-gray-200']"></i>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    class="p-1.5 rounded hover:bg-brand/10 text-gray-500 hover:text-brand transition"
                    title="Editar producto"
                    @click="$emit('edit', product)"
                  >
                    <i class="fa fa-pen-to-square"></i>
                  </button>
                  <button
                    :class="[
                      'p-1.5 rounded transition text-lg leading-none',
                      togglingIds.has(product.id)
                        ? 'text-gray-300 cursor-not-allowed'
                        : product.inStock
                          ? 'hover:bg-red-50 text-green-500 hover:text-red-500'
                          : 'hover:bg-green-50 text-gray-300 hover:text-green-600',
                    ]"
                    :title="product.inStock ? 'Desactivar' : 'Activar'"
                    :disabled="togglingIds.has(product.id)"
                    @click="$emit('toggleStock', product)"
                  >
                    <i :class="['fa', togglingIds.has(product.id) ? 'fa-spinner fa-spin text-sm' : product.inStock ? 'fa-toggle-on' : 'fa-toggle-off']"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500"
      >
        <span>Página {{ currentPage }} de {{ totalPages }} ({{ filteredProducts.length }} resultados)</span>
        <div class="flex gap-1">
          <button
            class="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            :disabled="currentPage === 1"
            @click="$emit('update:currentPage', currentPage - 1)"
          >
            <i class="fa fa-chevron-left"></i>
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            :class="['px-3 py-1 rounded border transition', p === currentPage ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50']"
            @click="$emit('update:currentPage', p)"
          >{{ p }}</button>
          <button
            class="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            :disabled="currentPage === totalPages"
            @click="$emit('update:currentPage', currentPage + 1)"
          >
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
