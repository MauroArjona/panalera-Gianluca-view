<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productApi } from '@/api/client'
import type { Product } from '@/api/client'
import { useToast } from '@/composables/useToast'
import { useProductForm } from '@/composables/useProductForm'

import ProductsTable    from '@/components/admin/products/ProductsTable.vue'
import ProductFormModal from '@/components/admin/products/ProductFormModal.vue'

// ─── Toast ────────────────────────────────────────────────────────────────────
const toast = useToast()
const toastSuccess = (msg: string) => (toast as any).success?.(msg) ?? (toast as any).show?.(msg, 'success')
const toastError   = (msg: string) => (toast as any).error?.(msg)   ?? (toast as any).show?.(msg, 'error')

// ─── Form composable ──────────────────────────────────────────────────────────
const form = useProductForm()

// ─── Table state ──────────────────────────────────────────────────────────────
const products    = ref<Product[]>([])
const loading     = ref(true)
const total       = ref(0)
const currentPage = ref(1)
const perPage     = 8

const search          = ref('')
const categoriaFilter = ref('')
const stockFilter     = ref<'all' | 'active' | 'inactive'>('all')
const sortField       = ref<'name' | 'price' | 'category'>('name')
const sortDir         = ref<'asc' | 'desc'>('asc')

// ─── Modal state ──────────────────────────────────────────────────────────────
const modalOpen  = ref(false)
const isEditing  = ref(false)
const editingId  = ref<string | null>(null)
const saving     = ref(false)

// ─── Toggling stock ───────────────────────────────────────────────────────────
const togglingIds = ref<Set<string>>(new Set())

// ─── Load ─────────────────────────────────────────────────────────────────────
async function loadAll() {
  loading.value = true
  try {
    const [prodRes] = await Promise.all([
      productApi.list({ perPage: 200, page: 1 }),
      form.loadCatalog(),
    ])
    products.value = prodRes.data
    total.value    = prodRes.total
  } catch (e) {
    toastError(e instanceof Error ? e.message : 'Error al cargar.')
  } finally {
    loading.value = false
  }
}
onMounted(loadAll)

// ─── Sort handler ─────────────────────────────────────────────────────────────
function handleSort(field: typeof sortField.value) {
  if (sortField.value === field) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortField.value = field; sortDir.value = 'asc' }
}

// ─── Modal open/close ─────────────────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.resetForm()
  modalOpen.value = true
}

function openEdit(product: Product) {
  isEditing.value = true
  editingId.value = product.id
  form.populateForm(product)
  modalOpen.value = true
}

function closeModal() { modalOpen.value = false }

// ─── Save ─────────────────────────────────────────────────────────────────────
async function saveProduct() {
  if (!form.validate()) return
  saving.value = true
  try {
    if (form.imageFile.value) {
      form.fImagenPrincipal.value =
      await form.uploadMainImage(form.imageFile.value)
    }
    // SI BORRÓ LA IMAGEN PRINCIPAL
    if (!form.imagePreview.value) {
      form.fImagenPrincipal.value = ''
    }
    await form.uploadExtraImages()
    const payload = form.buildPayload()

    if (isEditing.value && editingId.value) {
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

// ─── Toggle stock (optimistic) ────────────────────────────────────────────────
async function toggleStock(product: Product) {
  if (togglingIds.value.has(product.id)) return

  const idx = products.value.findIndex((p) => p.id === product.id)
  if (idx !== -1) products.value[idx] = { ...products.value[idx], inStock: !product.inStock }

  togglingIds.value = new Set([...togglingIds.value, product.id])

  try {
    await productApi.update(product.id, {
      codigo:          product.codigo,
      nombre:          product.name,
      descripcion:     product.description || undefined,
      precio:          product.price,
      precio_anterior: product.originalPrice ?? null,
      subcategoria_id: null,
      activo:          !product.inStock,
      destacado:       product.featured,
      en_carrusel:     product.inCarrusel,
    })
    toastSuccess(product.inStock ? `"${product.name}" desactivado.` : `"${product.name}" activado.`)
  } catch (e) {
    if (idx !== -1) products.value[idx] = { ...products.value[idx], inStock: product.inStock }
    toastError(e instanceof Error ? e.message : 'Error al cambiar estado.')
  } finally {
    const next = new Set(togglingIds.value)
    next.delete(product.id)
    togglingIds.value = next
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">

    <!-- Tabla principal -->
    <ProductsTable
      :products="products"
      :loading="loading"
      :toggling-ids="togglingIds"
      :categorias-unicas="form.categoriasUnicas.value"
      :search="search"
      :categoria-filter="categoriaFilter"
      :stock-filter="stockFilter"
      :sort-field="sortField"
      :sort-dir="sortDir"
      :current-page="currentPage"
      :per-page="perPage"
      :total="total"
      @update:search="search = $event"
      @update:categoria-filter="categoriaFilter = $event"
      @update:stock-filter="stockFilter = $event"
      @update:current-page="currentPage = $event"
      @sort="handleSort"
      @edit="openEdit"
      @toggle-stock="toggleStock"
      @create="openCreate"
    />

    <!-- Modal crear / editar -->
    <ProductFormModal
      :open="modalOpen"
      :is-editing="isEditing"
      :saving="saving"
      :is-uploading="form.isUploading.value"

      :image-preview="form.imagePreview.value"
      :uploading="form.uploading.value"
      :upload-progress="form.uploadProgress.value"

      :extra-images="form.extraImages.value"
      :max-extra="form.MAX_EXTRA"

      :f-nombre="form.fNombre.value"
      :f-codigo="form.fCodigo.value"
      :f-precio="form.fPrecio.value"
      :f-precio-anterior="form.fPrecioAnterior.value"
      :f-descripcion="form.fDescripcion.value"
      :f-subcategoria-id="form.fSubcategoriaId.value"
      :f-activo="form.fActivo.value"
      :f-destacado="form.fDestacado.value"
      :f-en-carrusel="form.fEnCarrusel.value"
      :f-talles="form.fTalles.value"
      :f-color-ids="form.fColorIds.value"

      :subcategorias="form.subcategorias.value"
      :colores="form.colores.value"
      :categorias-unicas="form.categoriasUnicas.value"
      :form-errors="form.formErrors.value"

      @update:f-nombre="form.fNombre.value = $event"
      @update:f-codigo="form.fCodigo.value = $event"
      @update:f-precio="form.fPrecio.value = $event"
      @update:f-precio-anterior="form.fPrecioAnterior.value = $event"
      @update:f-descripcion="form.fDescripcion.value = $event"
      @update:f-subcategoria-id="form.fSubcategoriaId.value = $event"
      @update:f-activo="form.fActivo.value = $event"
      @update:f-destacado="form.fDestacado.value = $event"
      @update:f-en-carrusel="form.fEnCarrusel.value = $event"
      @update:f-talles="form.fTalles.value = $event"

      @image-change="form.onFileChange($event)"
      @image-clear="form.clearImage()"
      @extra-change="(event, idx) => form.onExtraFileChange(event, idx)"
      @extra-clear="form.clearExtraImage($event)"
      @toggle-color="form.toggleColor($event)"
      @save="saveProduct"
      @close="closeModal"
    />

  </div>
</template>
