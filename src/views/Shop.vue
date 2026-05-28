<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { productApi, catalogApi } from '@/api/client'
import type { Product, ProductFilters, Categoria } from '@/api/client'

const route  = useRoute()
const router = useRouter()

// ─── State ────────────────────────────────────────────────────────────────────
const products      = ref<Product[]>([])
const totalProducts = ref(0)
const totalPages    = ref(1)
const loading       = ref(true)
const categorias    = ref<Categoria[]>([])

// El backend filtra por nombre de categoría/subcategoría (string), no por UUID
const filters = ref<ProductFilters>({
  categoria:    (route.query.categoria  as string) || undefined,
  subcategoria: (route.query.subcategoria as string) || undefined,
  search:       (route.query.search     as string) || undefined,
  sortBy:       (route.query.sortBy     as ProductFilters['sortBy']) || 'nombre_asc',
  activos:      true,   // ✅ FIX: siempre pedir solo productos activos con stock
  page:         1,
  perPage:      9,
})

const sidebarOpen = ref(false)

// ─── Opciones de ordenamiento ─────────────────────────────────────────────────
const sortOptions: Array<{ value: ProductFilters['sortBy']; label: string }> = [
  { value: 'destacado',   label: 'Destacados' },
  { value: 'precio_asc',  label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre_asc',  label: 'Nombre: A–Z' },
]

// ─── Sidebar: categorías y subcategorías dinámicas ────────────────────────────
const sidebarGroups = computed(() =>
  categorias.value.map((cat) => ({
    label: cat.nombre,
    key:   'categoria' as const,
    value: cat.nombre,
    subs:  (cat.subcategorias ?? []).map((s) => ({
      label: s.nombre,
      key:   'subcategoria' as const,
      value: s.nombre,
    })),
  })),
)

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchProducts() {
  loading.value = true
  totalProducts.value = 0   // ✅ FIX: resetear contador para no mostrar valor anterior mientras carga
  try {
    const res = await productApi.list(filters.value)
    products.value      = res.data
    totalProducts.value = res.total
    totalPages.value    = res.totalPages
  } catch (e) {
    console.error('Error al cargar productos:', e)
  } finally {
    loading.value = false
  }
}

async function fetchCatalog() {
  try {
    categorias.value = await catalogApi.listCategorias()
  } catch (e) {
    console.error('Error al cargar catálogo:', e)
  }
}

function applyCategoria(catNombre: string) {
  if (filters.value.categoria === catNombre) {
    filters.value.categoria    = undefined
    filters.value.subcategoria = undefined
  } else {
    filters.value.categoria    = catNombre
    filters.value.subcategoria = undefined
  }
  // ✅ FIX: limpiar search al navegar por categorías — no pueden coexistir
  filters.value.search = undefined
  filters.value.page   = 1
  syncUrlAndFetch()
}

function applySubcategoria(subNombre: string) {
  if (filters.value.subcategoria === subNombre) {
    filters.value.subcategoria = undefined
  } else {
    filters.value.subcategoria = subNombre
  }
  // ✅ FIX: limpiar search al navegar por subcategorías
  filters.value.search = undefined
  filters.value.page   = 1
  syncUrlAndFetch()
}

function syncUrlAndFetch() {
  const query: Record<string, string> = {}
  if (filters.value.categoria)    query.categoria    = filters.value.categoria
  if (filters.value.subcategoria) query.subcategoria = filters.value.subcategoria
  if (filters.value.search)       query.search       = filters.value.search
  if (filters.value.sortBy)       query.sortBy       = filters.value.sortBy
  if (filters.value.page && filters.value.page > 1) query.page = String(filters.value.page)
  skipNextQueryWatch = true
  router.replace({ query })
  // ✅ FIX: llamar fetchProducts directo; no depender del watcher
  fetchProducts()
}

function clearFilters() {
  filters.value = { sortBy: 'destacado', page: 1, perPage: 9, activos: true }
  router.replace({ query: {} })
}

const hasActiveFilters = computed(() =>
  !!(filters.value.categoria || filters.value.subcategoria || filters.value.search),
)

// Flag para evitar double-fetch cuando syncUrlAndFetch actualiza la URL
let skipNextQueryWatch = false

watch(
  () => route.query,
  async (query) => {
    if (skipNextQueryWatch) {
      skipNextQueryWatch = false
      return
    }

    const incomingSearch = (query.search as string) || undefined

    // ✅ FIX: si llega búsqueda externa (Navbar), limpiar categoria/subcategoria
    // para que total y sidebar sean coherentes con los resultados
    if (incomingSearch) {
      filters.value.categoria    = undefined
      filters.value.subcategoria = undefined
    } else {
      filters.value.categoria    = (query.categoria    as string) || undefined
      filters.value.subcategoria = (query.subcategoria as string) || undefined
    }

    filters.value.search  = incomingSearch
    filters.value.sortBy  = (query.sortBy as ProductFilters['sortBy']) || 'nombre_asc'
    filters.value.page    = query.page ? Number(query.page) : 1
    filters.value.perPage = 9
    filters.value.activos = true

    await fetchProducts()
  },
  { immediate: true },
)

// ✅ FIX: un solo onMounted, fetchProducts ya se ejecuta via watch immediate
onMounted(() => {
  fetchCatalog()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">

    <!-- Header row -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        Tienda
        <span v-if="filters.search" class="text-base font-normal text-gray-500">
          — resultados para "{{ filters.search }}"
        </span>
        <span v-else-if="filters.categoria" class="text-base font-normal text-gray-500">
          — {{ filters.categoria }}
          <span v-if="filters.subcategoria"> / {{ filters.subcategoria }}</span>
        </span>
      </h1>
      <button
        class="lg:hidden btn-ghost border border-gray-200 text-sm"
        @click="sidebarOpen = !sidebarOpen"
      >
        <i class="fa fa-sliders mr-1" /> Filtros
      </button>
    </div>

    <div class="flex gap-8">
      <!-- ── Sidebar ──────────────────────────────────────────────────────── -->
      <aside
        :class="[
          'w-64 shrink-0',
          'lg:block',
          sidebarOpen ? 'block' : 'hidden',
          'lg:static fixed inset-y-0 left-0 z-40 bg-white lg:bg-transparent shadow-xl lg:shadow-none p-6 lg:p-0 overflow-y-auto',
        ]"
      >
        <button class="lg:hidden mb-4 text-gray-400 hover:text-gray-700" @click="sidebarOpen = false">
          <i class="fa fa-xmark" /> Cerrar
        </button>

        <h2 class="text-lg font-bold text-gray-800 mb-4">Filtros</h2>

        <!-- Categorías dinámicas -->
        <div v-for="group in sidebarGroups" :key="group.value" class="mb-5">
          <!-- Categoría principal -->
          <button
            :class="[
              'w-full text-left px-2 py-1.5 rounded font-semibold text-sm transition mb-1',
              filters.categoria === group.value
                ? 'bg-brand text-white'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
            @click="applyCategoria(group.value)"
          >
            {{ group.label }}
          </button>

          <!-- Subcategorías -->
          <ul
            v-if="filters.categoria === group.value && group.subs.length > 0"
            class="ml-3 space-y-0.5"
          >
            <li v-for="sub in group.subs" :key="sub.value">
              <button
                :class="[
                  'w-full text-left px-2 py-1 rounded text-sm transition',
                  filters.subcategoria === sub.value
                    ? 'bg-brand/20 text-brand font-medium'
                    : 'text-gray-600 hover:bg-gray-50',
                ]"
                @click="applySubcategoria(sub.value)"
              >
                {{ sub.label }}
              </button>
            </li>
          </ul>
        </div>

        <button
          v-if="hasActiveFilters"
          class="text-xs text-red-500 hover:text-red-700 mt-2"
          @click="clearFilters"
        >
          <i class="fa fa-xmark mr-1" /> Limpiar filtros
        </button>
      </aside>

      <!-- Mobile sidebar backdrop -->
      <div
        v-if="sidebarOpen"
        class="lg:hidden fixed inset-0 bg-black/40 z-30"
        @click="sidebarOpen = false"
      />

      <!-- ── Product grid ─────────────────────────────────────────────────── -->
      <div class="flex-1 min-w-0">

        <!-- Sort -->
        <div class="flex flex-wrap items-center justify-end gap-3 mb-6">
          <select v-model="filters.sortBy" class="input w-52 text-sm" @change="filters.page = 1; syncUrlAndFetch()">
            <option v-for="o in sortOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>

        <!-- Results count -->
        <p v-if="!loading" class="text-xs text-gray-400 mb-4">
          <!-- {{ totalProducts }} producto{{ totalProducts !== 1 ? 's' : '' }} encontrado{{ totalProducts !== 1 ? 's' : '' }} -->
        </p>

        <!-- Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="n in 9" :key="n" class="bg-white rounded shadow-sm animate-pulse">
            <div class="h-52 bg-gray-200 rounded-t" />
            <div class="p-4 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4" />
              <div class="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="products.length === 0" class="text-center py-20 text-gray-400">
          <i class="fa fa-box-open text-5xl mb-4 block" />
          <p class="text-lg font-medium">No se encontraron productos</p>
          <button class="btn-outline mt-4 text-sm" @click="clearFilters">Limpiar filtros</button>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-end gap-2 mt-10">
          <button
            v-for="n in totalPages"
            :key="n"
            :class="[
              'w-9 h-9 rounded flex items-center justify-center text-sm font-medium transition',
              filters.page === n
                ? 'bg-brand text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
            @click="filters.page = n; syncUrlAndFetch()"
          >
            {{ n }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>