<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { catalogApi, productApi } from '@/api/client'
import type { Categoria, Product, Subcategoria } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useProductForm } from '@/composables/useProductForm'
import ProductsTable from '@/components/admin/products/ProductsTable.vue'
import ProductFormModal from '@/components/admin/products/ProductFormModal.vue'

const toast = useToast()
const toastSuccess = (msg: string) => toast.show(msg, 'success')
const toastError = (msg: string) => toast.show(msg, 'error')
const form = useProductForm()

const products = ref<Product[]>([])
const categorias = ref<Categoria[]>([])
const subcategorias = ref<Subcategoria[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const perPage = 8
const search = ref('')
const categoriaFilter = ref('')
const stockFilter = ref<'all' | 'active' | 'inactive'>('all')
const featureFilter = ref<'all' | 'destacado' | 'carrusel'>('all')
const sortField = ref<'name' | 'price' | 'category'>('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const modalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const togglingIds = ref<Set<number>>(new Set())

const categoriasUnicas = computed(() =>
  Array.from(new Set(products.value.map((p) => p.category).filter(Boolean))).sort(),
)
const destacadosCount = computed(() => products.value.filter((p) => p.destacado).length)
const carruselCount = computed(() => products.value.filter((p) => p.enCarrusel).length)
const editingProduct = computed(() =>
  editingId.value === null ? null : products.value.find((p) => p.id === editingId.value) ?? null,
)

async function loadAll() {
  loading.value = true
  try {
    const [prodRes, catRes, subRes] = await Promise.all([
      productApi.list({ perPage: 1000, page: 1 }),
      catalogApi.listCategorias(),
      catalogApi.listSubcategorias(),
    ])
    products.value = prodRes.data
    total.value = prodRes.total
    categorias.value = catRes
    subcategorias.value = subRes
  } catch (e) {
    toastError(e instanceof Error ? e.message : 'Error al cargar.')
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

async function loadCatalog() {
  const [catRes, subRes] = await Promise.all([
    catalogApi.listCategorias(),
    catalogApi.listSubcategorias(),
  ])
  categorias.value = catRes
  subcategorias.value = subRes
}

function handleSort(field: typeof sortField.value) {
  if (sortField.value === field) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

async function openCreate() {
  isEditing.value = false
  editingId.value = null
  try {
    await loadCatalog()
  } catch (e) {
    toastError(e instanceof Error ? e.message : 'Error al actualizar categorías.')
  }
  form.resetForm()
  modalOpen.value = true
}

async function openEdit(product: Product) {
  isEditing.value = true
  editingId.value = product.id
  try {
    await loadCatalog()
  } catch (e) {
    toastError(e instanceof Error ? e.message : 'Error al actualizar categorías.')
  }
  form.populateForm(product)
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function saveProduct() {
  if (!form.validate()) return
  saving.value = true
  try {
    await form.uploadImages()
    const payload = form.buildPayload()
    const wasDestacado = editingProduct.value?.destacado ?? false
    const wasCarrusel = editingProduct.value?.enCarrusel ?? false

    if (payload.destacado && !wasDestacado && destacadosCount.value >= 10) {
      toastError('Ya tenes 10 productos destacados. Quita uno antes de agregar otro.')
      return
    }
    if (payload.en_carrusel && !wasCarrusel && carruselCount.value >= 10) {
      toastError('Ya tenes 10 productos en carrusel. Quita uno antes de agregar otro.')
      return
    }

    if (isEditing.value && editingId.value !== null) {
      await productApi.update(editingId.value, payload)
      toastSuccess('Producto actualizado correctamente.')
    } else {
      await productApi.create(payload)
      toastSuccess('Producto creado correctamente.')
      currentPage.value = 1
    }
    closeModal()
    await loadAll()
  } catch (e) {
    toastError(e instanceof Error ? e.message : 'Error al guardar.')
  } finally {
    saving.value = false
  }
}

async function toggleStock(product: Product) {
  if (togglingIds.value.has(product.id)) return
  togglingIds.value = new Set([...togglingIds.value, product.id])
  try {
    const nextStock = product.stock > 0 ? 0 : 1
    const talles = product.talles.length
      ? product.talles.map((item) => ({ talle: item.talle, stock: nextStock }))
      : [{ talle: 'Unidad', stock: nextStock }]
    await productApi.update(product.id, { talles })
    await loadAll()
  } catch (e) {
    toastError(e instanceof Error ? e.message : 'Error al cambiar stock.')
  } finally {
    const next = new Set(togglingIds.value)
    next.delete(product.id)
    togglingIds.value = next
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <ProductsTable
      :products="products"
      :loading="loading"
      :toggling-ids="togglingIds"
      :categorias-unicas="categoriasUnicas"
      :search="search"
      :categoria-filter="categoriaFilter"
      :stock-filter="stockFilter"
      :feature-filter="featureFilter"
      :destacados-count="destacadosCount"
      :carrusel-count="carruselCount"
      :sort-field="sortField"
      :sort-dir="sortDir"
      :current-page="currentPage"
      :per-page="perPage"
      :total="total"
      @update:search="search = $event"
      @update:categoria-filter="categoriaFilter = $event"
      @update:stock-filter="stockFilter = $event"
      @update:feature-filter="featureFilter = $event"
      @update:current-page="currentPage = $event"
      @sort="handleSort"
      @edit="openEdit"
      @toggle-stock="toggleStock"
      @create="openCreate"
    />

    <ProductFormModal
      :open="modalOpen"
      :is-editing="isEditing"
      :saving="saving"
      :is-uploading="form.isUploading.value"
      :image-slots="form.imageSlots.value"
      :max-images="form.MAX_IMAGES"
      :f-nombre="form.fNombre.value"
      :f-precio="form.fPrecio.value"
      :f-precio-anterior="form.fPrecioAnterior.value"
      :f-subcategoria-id="form.fSubcategoriaId.value"
      :f-talles="form.fTalles.value"
      :f-is-promo="form.fIsPromo.value"
      :f-destacado="form.fDestacado.value"
      :f-en-carrusel="form.fEnCarrusel.value"
      :categorias="categorias"
      :subcategorias="subcategorias"
      :destacados-count="destacadosCount"
      :carrusel-count="carruselCount"
      :form-errors="form.formErrors.value"
      @update:f-nombre="form.fNombre.value = $event"
      @update:f-precio="form.fPrecio.value = $event"
      @update:f-precio-anterior="form.fPrecioAnterior.value = $event"
      @update:f-subcategoria-id="form.fSubcategoriaId.value = $event"
      @update:f-talles="form.fTalles.value = $event"
      @update:f-is-promo="form.fIsPromo.value = $event"
      @update:f-destacado="form.fDestacado.value = $event"
      @update:f-en-carrusel="form.fEnCarrusel.value = $event"
      @image-change="(event, idx) => form.onImageChange(event, idx)"
      @image-clear="form.clearImage($event)"
      @add-talle="form.addTalle()"
      @remove-talle="form.removeTalle($event)"
      @save="saveProduct"
      @close="closeModal"
    />
  </div>
</template>
