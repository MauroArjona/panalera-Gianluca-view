<script setup lang="ts">
import { computed } from 'vue'
import { getProductImage } from '@/utils/productImage'
import type { Product } from '@/api/client'

const props = defineProps<{
  products: Product[]
  loading: boolean
  togglingIds: Set<number>
  categoriasUnicas: string[]
  search: string
  categoriaFilter: string
  stockFilter: 'all' | 'active' | 'inactive'
  featureFilter: 'all' | 'destacado' | 'carrusel'
  destacadosCount: number
  carruselCount: number
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
  'update:featureFilter': [v: 'all' | 'destacado' | 'carrusel']
  'update:currentPage': [v: number]
  'sort': [field: 'name' | 'price' | 'category']
  'edit': [product: Product]
  'toggleStock': [product: Product]
  'create': []
}>()

const filteredProducts = computed(() => {
  let list = [...props.products]

  if (props.search.trim()) {
    const q = props.search.trim().toLowerCase()
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      String(p.price).includes(q) ||
      p.price.toFixed(2).includes(q),
    )
  }

  if (props.categoriaFilter) {
    list = list.filter((p) => p.category.toLowerCase() === props.categoriaFilter.toLowerCase())
  }

  if (props.stockFilter === 'active') list = list.filter((p) => p.stock > 0)
  if (props.stockFilter === 'inactive') list = list.filter((p) => p.stock <= 0)
  if (props.featureFilter === 'destacado') list = list.filter((p) => p.destacado)
  if (props.featureFilter === 'carrusel') list = list.filter((p) => p.enCarrusel)

  list.sort((a, b) => {
    const av = props.sortField === 'price' ? a.price : String(a[props.sortField] ?? '')
    const bv = props.sortField === 'price' ? b.price : String(b[props.sortField] ?? '')
    if (typeof av === 'number' && typeof bv === 'number') {
      return props.sortDir === 'asc' ? av - bv : bv - av
    }
    return props.sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av))
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / props.perPage)))
const paginated = computed(() => {
  const start = (props.currentPage - 1) * props.perPage
  return filteredProducts.value.slice(start, start + props.perPage)
})

function resetPage() {
  emit('update:currentPage', 1)
}

function sortIcon(field: string) {
  if (props.sortField !== field) return 'fa-sort text-gray-300'
  return props.sortDir === 'asc' ? 'fa-arrow-up text-brand' : 'fa-arrow-down text-brand'
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          <i class="fa fa-box-open text-brand mr-2"></i>Gestion de Productos
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {{ total }} producto{{ total !== 1 ? 's' : '' }} en total
        </p>
      </div>
      <button class="btn-primary gap-2" @click="$emit('create')">
        <i class="fa fa-plus"></i>Nuevo Producto
      </button>
    </div>

    <div class="flex flex-wrap gap-3 mb-5">
      <div class="relative flex-1 min-w-[220px]">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          :value="search"
          type="text"
          placeholder="Buscar por nombre, categoria, subcategoria o precio..."
          class="input pl-9"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value); resetPage()"
        />
      </div>

      <select
        :value="categoriaFilter"
        class="input w-48"
        @change="$emit('update:categoriaFilter', ($event.target as HTMLSelectElement).value); resetPage()"
      >
        <option value="">Todas las categorias</option>
        <option v-for="cat in categoriasUnicas" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        <button
          :class="['px-3 py-2 transition font-medium', stockFilter === 'all' ? 'bg-brand text-white' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:stockFilter', 'all'); resetPage()"
        >Todos</button>
        <button
          :class="['px-3 py-2 transition font-medium border-l border-gray-200', stockFilter === 'active' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:stockFilter', 'active'); resetPage()"
        >Con stock</button>
        <button
          :class="['px-3 py-2 transition font-medium border-l border-gray-200', stockFilter === 'inactive' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:stockFilter', 'inactive'); resetPage()"
        >Sin stock</button>
      </div>

      <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
        <button
          :class="['px-3 py-2 transition font-medium', featureFilter === 'all' ? 'bg-brand text-white' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:featureFilter', 'all'); resetPage()"
        >Todos</button>
        <button
          :class="['px-3 py-2 transition font-medium border-l border-gray-200', featureFilter === 'destacado' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:featureFilter', 'destacado'); resetPage()"
        >
          Destacados {{ destacadosCount }}/10
        </button>
        <button
          :class="['px-3 py-2 transition font-medium border-l border-gray-200', featureFilter === 'carrusel' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-500 hover:bg-gray-50']"
          @click="$emit('update:featureFilter', 'carrusel'); resetPage()"
        >
          Carrusel {{ carruselCount }}/10
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <i class="fa fa-spinner fa-spin text-3xl"></i>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
            <tr>
              <th class="px-4 py-3 text-left w-16">Img</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-brand" @click="$emit('sort', 'name')">
                Nombre <i :class="['fa ml-1', sortIcon('name')]"></i>
              </th>
              <th class="px-4 py-3 text-left">Subcategoria / talle</th>
              <th class="px-4 py-3 text-left cursor-pointer hover:text-brand" @click="$emit('sort', 'category')">
                Categoria <i :class="['fa ml-1', sortIcon('category')]"></i>
              </th>
              <th class="px-4 py-3 text-right cursor-pointer hover:text-brand" @click="$emit('sort', 'price')">
                Precio <i :class="['fa ml-1', sortIcon('price')]"></i>
              </th>
              <th class="px-4 py-3 text-center">Stock</th>
              <th class="px-4 py-3 text-center">Promo</th>
              <th class="px-4 py-3 text-center">Destacado</th>
              <th class="px-4 py-3 text-center">Carrusel</th>
              <th class="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginated.length === 0">
              <td colspan="10" class="px-4 py-12 text-center text-gray-400">
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
                  :src="getProductImage(product)"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  loading="lazy"
                />
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-900 truncate max-w-[220px]">{{ product.name }}</p>
                <p class="text-xs text-gray-400">ID {{ product.id }}</p>
              </td>
              <td class="px-4 py-3">
                <p class="text-xs text-gray-700">{{ product.subcategory || 'Sin subcategoria' }}</p>
                <p class="text-xs text-gray-400">{{ product.talle || 'Sin talle' }}</p>
              </td>
              <td class="px-4 py-3">{{ product.category }}</td>
              <td class="px-4 py-3 text-right">
                <span class="font-semibold text-gray-900">${{ product.price.toFixed(2) }}</span>
                <span v-if="product.oldPrice" class="ml-1 text-xs text-gray-400 line-through">
                  ${{ product.oldPrice.toFixed(2) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600']">
                  <i :class="['fa text-[9px]', product.stock > 0 ? 'fa-circle-check' : 'fa-circle-xmark']"></i>
                  {{ product.stock > 0 ? `${product.stock} u.` : 'Sin stock' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <i :class="['fa fa-tag', product.isPromo ? 'text-brand' : 'text-gray-200']"></i>
              </td>
              <td class="px-4 py-3 text-center">
                <i :class="['fa fa-star', product.destacado ? 'text-yellow-400' : 'text-gray-200']"></i>
              </td>
              <td class="px-4 py-3 text-center">
                <i :class="['fa fa-images', product.enCarrusel ? 'text-sky-500' : 'text-gray-200']"></i>
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
                        : product.stock > 0
                          ? 'hover:bg-red-50 text-green-500 hover:text-red-500'
                          : 'hover:bg-green-50 text-gray-300 hover:text-green-600',
                    ]"
                    :title="product.stock > 0 ? 'Marcar sin stock' : 'Marcar con stock'"
                    :disabled="togglingIds.has(product.id)"
                    @click="$emit('toggleStock', product)"
                  >
                    <i :class="['fa', togglingIds.has(product.id) ? 'fa-spinner fa-spin text-sm' : product.stock > 0 ? 'fa-toggle-on' : 'fa-toggle-off']"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500"
      >
        <span>Pagina {{ currentPage }} de {{ totalPages }} ({{ filteredProducts.length }} resultados)</span>
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
