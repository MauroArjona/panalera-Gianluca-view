<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { catalogApi, productApi } from '@/api/client'
import type { Categoria, Product, ProductFilters, Subcategoria } from '@/api/client'

const route = useRoute()
const router = useRouter()

const products = ref<Product[]>([])
const totalProducts = ref(0)
const totalPages = ref(1)
const loading = ref(true)
const catalogLoading = ref(false)
const categorias = ref<Categoria[]>([])
const subcategorias = ref<Subcategoria[]>([])
const sidebarOpen = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filters = ref<ProductFilters>({
  category: (route.query.category as string) || (route.query.categoria as string) || undefined,
  categoriaId: route.query.categoriaId ? Number(route.query.categoriaId) : undefined,
  subcategoriaId: route.query.subcategoriaId ? Number(route.query.subcategoriaId) : undefined,
  search: (route.query.search as string) || undefined,
  sortBy: (route.query.sortBy as ProductFilters['sortBy']) || 'newest',
  page: route.query.page ? Number(route.query.page) : 1,
  perPage: 9,
})

const sortOptions: Array<{ value: ProductFilters['sortBy']; label: string }> = [
  { value: 'newest', label: 'Mas recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
]

const selectedCategoriaId = computed(() => {
  if (filters.value.categoriaId) return filters.value.categoriaId
  if (filters.value.subcategoriaId) {
    return subcategorias.value.find((sub) => sub.id === filters.value.subcategoriaId)?.categoria_id
  }
  if (filters.value.category) {
    return categorias.value.find((cat) => cat.nombre.toLowerCase() === filters.value.category!.toLowerCase())?.id
  }
  return undefined
})

const selectedCategoria = computed(() =>
  categorias.value.find((cat) => cat.id === selectedCategoriaId.value),
)

const selectedSubcategoria = computed(() =>
  subcategorias.value.find((sub) => sub.id === filters.value.subcategoriaId),
)

function normalizeLabel(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

type FilterSectionKey = 'panales' | 'higiene' | 'accesorios'

const sectionStyles: Record<FilterSectionKey, { title: string; icon: string; accent: string }> = {
  panales: { title: 'Pañales', icon: 'fa-baby', accent: 'text-sky-600 bg-sky-50 border-sky-100' },
  higiene: { title: 'Higiene', icon: 'fa-hand-sparkles', accent: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  accesorios: { title: 'Accesorios', icon: 'fa-bottle-droplet', accent: 'text-amber-600 bg-amber-50 border-amber-100' },
}

const sectionKeywords: Record<FilterSectionKey, string[]> = {
  panales: ['panal', 'pañal'],
  higiene: ['toallita', 'higiene', 'crema', 'pomada', 'oleo', 'algodon', 'aposito', 'jabon', 'capilar', 'guante', 'hisopo'],
  accesorios: ['mamadera', 'chupete', 'vaso', 'mordillo', 'bolso', 'accesorio'],
}

function categoriaSection(nombre: string): FilterSectionKey {
  const label = normalizeLabel(nombre)
  const section = (Object.keys(sectionKeywords) as FilterSectionKey[])
    .find((key) => sectionKeywords[key].some((word) => label.includes(word)))

  return section ?? 'accesorios'
}

const categoriasVisibles = computed(() => {
  const hidden = new Set(['todos', 'accesorios para bebe', 'productos de higiene', 'sin categoria'])
  const priority = new Map([
    ['panales', 0],
    ['pañales', 0],
    ['toallitas humedas', 1],
    ['toallitas', 1],
  ])
  const hasToallitasHumedas = categorias.value.some((cat) =>
    normalizeLabel(cat.nombre) === 'toallitas humedas',
  )
  const hasCremasPomadas = categorias.value.some((cat) =>
    normalizeLabel(cat.nombre) === 'cremas y pomadas',
  )

  return categorias.value
    .filter((cat) => {
      const label = normalizeLabel(cat.nombre)
      if (hidden.has(label)) return false
      if (hasToallitasHumedas && label === 'toallitas') return false
      if (hasCremasPomadas && label === 'cremas') return false
      return true
    })
    .sort((a, b) => {
      const aKey = normalizeLabel(a.nombre)
      const bKey = normalizeLabel(b.nombre)
      const aPriority = priority.get(aKey) ?? 20
      const bPriority = priority.get(bKey) ?? 20
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.nombre.localeCompare(b.nombre)
    })
})

const filterSections = computed(() => {
  const sections: Record<FilterSectionKey, Categoria[]> = {
    panales: [],
    higiene: [],
    accesorios: [],
  }

  categoriasVisibles.value.forEach((cat) => {
    sections[categoriaSection(cat.nombre)].push(cat)
  })

  return (Object.keys(sectionStyles) as FilterSectionKey[])
    .map((key) => ({ key, ...sectionStyles[key], categorias: sections[key] }))
    .filter((section) => section.categorias.length > 0)
})

function displayCategoriaName(nombre: string) {
  return normalizeLabel(nombre) === 'toallitas' ? 'Toallitas humedas' : nombre
}

const visibleSubcategorias = computed(() =>
  selectedCategoriaId.value
    ? subcategorias.value.filter((sub) =>
      sub.categoria_id === selectedCategoriaId.value &&
      normalizeLabel(sub.nombre) !== 'general',
    )
    : [],
)

const activeFilterLabel = computed(() =>
  selectedSubcategoria.value?.nombre ||
  selectedCategoria.value?.nombre ||
  filters.value.category ||
  '',
)

const hasActiveFilters = computed(() =>
  !!(filters.value.category || filters.value.categoriaId || filters.value.subcategoriaId || filters.value.search),
)

async function fetchCatalog() {
  if (categorias.value.length || catalogLoading.value) return
  catalogLoading.value = true
  try {
    const [catRes, subRes] = await Promise.all([
      catalogApi.listCategorias(),
      catalogApi.listSubcategorias(),
    ])
    categorias.value = catRes
    subcategorias.value = subRes
  } catch (e) {
    console.error('Error al cargar categorias:', e)
  } finally {
    catalogLoading.value = false
  }
}

async function fetchProducts() {
  loading.value = true
  totalProducts.value = 0
  try {
    const res = await productApi.list(filters.value)
    products.value = res.data
    totalProducts.value = res.total
    totalPages.value = res.totalPages
  } catch (e) {
    console.error('Error al cargar productos:', e)
  } finally {
    loading.value = false
  }
}

function syncUrlAndFetch() {
  const query: Record<string, string> = {}
  if (filters.value.categoriaId) query.categoriaId = String(filters.value.categoriaId)
  else if (filters.value.category) query.category = filters.value.category
  if (filters.value.subcategoriaId) query.subcategoriaId = String(filters.value.subcategoriaId)
  if (filters.value.search) query.search = filters.value.search
  if (filters.value.sortBy) query.sortBy = filters.value.sortBy
  if ((filters.value.page ?? 1) > 1) query.page = String(filters.value.page)
  router.replace({ query })
  fetchProducts()
}

function searchAsYouType() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    const search = filters.value.search?.trim()
    filters.value.search = search || undefined
    filters.value.page = 1
    syncUrlAndFetch()
  }, 300)
}

function applyCategoria(categoria: Categoria) {
  const isActive = selectedCategoriaId.value === categoria.id && !filters.value.subcategoriaId
  filters.value.category = undefined
  filters.value.categoriaId = isActive ? undefined : categoria.id
  filters.value.subcategoriaId = undefined
  filters.value.search = undefined
  filters.value.page = 1
  syncUrlAndFetch()
}

function applySubcategoria(subcategoria: Subcategoria) {
  const isActive = filters.value.subcategoriaId === subcategoria.id
  filters.value.category = undefined
  filters.value.categoriaId = subcategoria.categoria_id
  filters.value.subcategoriaId = isActive ? undefined : subcategoria.id
  filters.value.search = undefined
  filters.value.page = 1
  syncUrlAndFetch()
}

function clearFilters() {
  filters.value = { sortBy: 'newest', page: 1, perPage: 9 }
  router.replace({ query: {} })
  fetchProducts()
}

function showAllProducts() {
  clearFilters()
}

watch(
  () => route.query,
  async (query) => {
    await fetchCatalog()
    filters.value.category = (query.category as string) || (query.categoria as string) || undefined
    filters.value.categoriaId = query.categoriaId ? Number(query.categoriaId) : undefined
    filters.value.subcategoriaId = query.subcategoriaId ? Number(query.subcategoriaId) : undefined
    filters.value.search = (query.search as string) || undefined
    filters.value.sortBy = (query.sortBy as ProductFilters['sortBy']) || 'newest'
    filters.value.page = query.page ? Number(query.page) : 1
    filters.value.perPage = 9
    await fetchProducts()
  },
  { immediate: true },
)
</script>

<template>
  <div class="bg-gradient-to-b from-sky-50/60 to-white min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Tienda
        <span v-if="filters.search" class="text-base font-normal text-gray-500">
          - resultados para "{{ filters.search }}"
        </span>
        <span v-else-if="activeFilterLabel" class="text-base font-normal text-gray-500">
          - {{ activeFilterLabel }}
        </span>
      </h1>
      <button class="lg:hidden btn-ghost border border-gray-200 text-sm" @click="sidebarOpen = !sidebarOpen">
        <i class="fa fa-sliders mr-1" /> Filtros
      </button>
    </div>

    <div class="flex gap-8">
      <aside
        :class="[
          'w-64 shrink-0 rounded-lg lg:rounded-none',
          'lg:block',
          sidebarOpen ? 'block' : 'hidden',
          'lg:static fixed inset-y-0 left-0 z-40 bg-white lg:bg-transparent shadow-xl lg:shadow-none p-6 lg:p-0 overflow-y-auto',
        ]"
      >
        <button class="lg:hidden mb-4 text-gray-400 hover:text-gray-700" @click="sidebarOpen = false">
          <i class="fa fa-xmark" /> Cerrar
        </button>

        <div class="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-1">Filtros</h2>
        <p class="text-xs text-gray-500 mb-4">Elegí una categoría y después una marca.</p>

        <div class="space-y-1">
          <div v-if="catalogLoading" class="text-sm text-gray-400 px-2 py-1.5">
            Cargando categorias...
          </div>
          <button
            :class="[
              'w-full text-left px-3 py-2 rounded font-semibold text-sm transition flex items-center gap-2',
              !hasActiveFilters ? 'bg-brand text-white shadow-sm' : 'text-gray-700 hover:bg-sky-50',
            ]"
            @click="showAllProducts"
          >
            <i class="fa fa-border-all text-xs opacity-80" />
            Todo
          </button>
          <div v-for="section in filterSections" :key="section.key" class="pt-3 first:pt-2">
            <div :class="['flex items-center gap-2 px-3 py-2 rounded border text-sm font-bold', section.accent]">
              <i :class="['fa', section.icon, 'text-xs']" />
              {{ section.title }}
            </div>

            <div class="mt-2 space-y-1">
              <div v-for="cat in section.categorias" :key="cat.id">
                <button
                  :class="[
                    'w-full text-left px-3 py-2 rounded font-semibold text-sm transition flex items-center justify-between gap-2',
                    selectedCategoriaId === cat.id ? 'bg-brand text-white shadow-sm' : 'text-gray-700 hover:bg-sky-50',
                  ]"
                  @click="applyCategoria(cat)"
                >
                  <span class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {{ displayCategoriaName(cat.nombre) }}
                  </span>
                  <i
                    v-if="subcategorias.some((sub) => sub.categoria_id === cat.id && normalizeLabel(sub.nombre) !== 'general')"
                    :class="[
                      'fa text-[10px]',
                      selectedCategoriaId === cat.id ? 'fa-chevron-up' : 'fa-chevron-down',
                    ]"
                  />
                </button>

                <div v-if="selectedCategoriaId === cat.id && visibleSubcategorias.length" class="mt-2 mb-3 ml-3 space-y-1 border-l border-sky-100 pl-3">
                  <p class="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Marcas
                  </p>
                  <button
                    v-for="sub in visibleSubcategorias"
                    :key="sub.id"
                    :class="[
                      'w-full text-left px-2 py-1.5 rounded text-sm transition flex items-center gap-2',
                      filters.subcategoriaId === sub.id ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-gray-500 hover:bg-sky-50 hover:text-gray-700',
                    ]"
                    @click="applySubcategoria(sub)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    <span>{{ sub.nombre }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button v-if="hasActiveFilters" class="text-xs text-red-500 hover:text-red-700 mt-4" @click="clearFilters">
          <i class="fa fa-xmark mr-1" /> Limpiar filtros
        </button>
        </div>
      </aside>

      <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 bg-black/40 z-30" @click="sidebarOpen = false" />

      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6 rounded-lg border border-sky-100 bg-white p-3 shadow-sm">
          <div class="relative flex-1 min-w-[220px] max-w-md">
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              v-model="filters.search"
              type="text"
              class="input pl-9"
              placeholder="Buscar productos..."
              @input="searchAsYouType"
            />
          </div>
          <p class="text-sm text-gray-500">
            {{ totalProducts }} producto{{ totalProducts !== 1 ? 's' : '' }}
          </p>
          <select v-model="filters.sortBy" class="input w-52 text-sm" @change="filters.page = 1; syncUrlAndFetch()">
            <option v-for="o in sortOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>

        <p v-if="!loading && totalProducts > 0" class="text-xs text-gray-400 mb-4">
          {{ totalProducts }} producto{{ totalProducts !== 1 ? 's' : '' }} encontrado{{ totalProducts !== 1 ? 's' : '' }}
        </p>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="n in 9" :key="n" class="bg-white rounded shadow-sm animate-pulse">
            <div class="h-52 bg-gray-200 rounded-t" />
            <div class="p-4 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4" />
              <div class="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>

        <div v-else-if="products.length === 0" class="text-center py-20 text-gray-400">
          <i class="fa fa-box-open text-5xl mb-4 block" />
          <p class="text-lg font-medium">No se encontraron productos</p>
          <button class="btn-outline mt-4 text-sm" @click="clearFilters">Limpiar filtros</button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>

        <div v-if="totalPages > 1" class="flex justify-end gap-2 mt-10">
          <button
            v-for="n in totalPages"
            :key="n"
            :class="[
              'w-9 h-9 rounded flex items-center justify-center text-sm font-medium transition',
              filters.page === n ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
            ]"
            @click="filters.page = n; syncUrlAndFetch()"
          >
            {{ n }}
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
