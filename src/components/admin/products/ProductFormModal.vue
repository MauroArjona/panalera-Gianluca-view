<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { normalizeProductImageUrl } from '@/utils/productImage'
import type { Categoria, Subcategoria, ProductSize } from '@/api/client'
import type { ExtraImage } from '@/composables/useProductForm'

const props = defineProps<{
  open: boolean
  isEditing: boolean
  saving: boolean
  isUploading: boolean
  imageSlots: ExtraImage[]
  maxImages: number
  fNombre: string
  fPrecio: number | undefined
  fPrecioAnterior: number | undefined
  fSubcategoriaId: number | null
  fTalles: ProductSize[]
  fIsPromo: boolean
  fDestacado: boolean
  fEnCarrusel: boolean
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  destacadosCount: number
  carruselCount: number
  formErrors: Record<string, string>
}>()

const emit = defineEmits<{
  'update:fNombre': [v: string]
  'update:fPrecio': [v: number | undefined]
  'update:fPrecioAnterior': [v: number | undefined]
  'update:fSubcategoriaId': [v: number | null]
  'update:fTalles': [v: ProductSize[]]
  'update:fIsPromo': [v: boolean]
  'update:fDestacado': [v: boolean]
  'update:fEnCarrusel': [v: boolean]
  'imageChange': [e: Event, idx: number]
  'imageClear': [idx: number]
  'variantImageChange': [e: Event, idx: number]
  'addTalle': []
  'removeTalle': [idx: number]
  'save': []
  'close': []
}>()

const selectedCategoriaId = ref<number | null>(null)
const draggedVariantIndex = ref<number | null>(null)

const filteredSubcategorias = computed(() =>
  props.subcategorias
    .filter((sub) => sub.categoria_id === selectedCategoriaId.value)
    .sort((a, b) => {
      if (a.nombre.toLowerCase() === 'general') return -1
      if (b.nombre.toLowerCase() === 'general') return 1
      return a.nombre.localeCompare(b.nombre)
    }),
)

watch(
  () => props.fSubcategoriaId,
  (subcategoriaId) => {
    const selected = props.subcategorias.find((sub) => sub.id === subcategoriaId)
    selectedCategoriaId.value = selected?.categoria_id ?? selectedCategoriaId.value
  },
  { immediate: true },
)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      selectedCategoriaId.value = null
      return
    }

    const selected = props.subcategorias.find((sub) => sub.id === props.fSubcategoriaId)
    selectedCategoriaId.value = selected?.categoria_id ?? null
  },
)

function selectCategoria(value: string) {
  selectedCategoriaId.value = value ? Number(value) : null
  emit('update:fSubcategoriaId', null)
}

const saveLabel = computed(() => {
  if (props.isUploading) return 'Subiendo imágenes...'
  if (props.saving) return 'Guardando...'
  return props.isEditing ? 'Guardar' : 'Crear'
})

const destacadoDisabled = computed(() => !props.fDestacado && props.destacadosCount >= 10)
const carruselDisabled = computed(() => !props.fEnCarrusel && props.carruselCount >= 10)

function updateTalle(idx: number, field: keyof ProductSize, value: string | number | null) {
  const next = props.fTalles.map((item, itemIdx) =>
    itemIdx === idx ? { ...item, [field]: value } : item,
  )
  return next
}

function reorderVariant(from: number, to: number) {
  if (from === to || from < 0 || to < 0) return
  const next = [...props.fTalles]
  const [moved] = next.splice(from, 1)
  if (!moved) return
  next.splice(to, 0, moved)
  emit('update:fTalles', next)
}

function onVariantDragStart(idx: number) {
  draggedVariantIndex.value = idx
}

function onVariantDrop(idx: number) {
  if (draggedVariantIndex.value === null) return
  reorderVariant(draggedVariantIndex.value, idx)
  draggedVariantIndex.value = null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4"
        @mousedown.self="$emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-900">
              {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
            </h2>
            <button class="p-2 rounded-full hover:bg-gray-100 text-gray-500" @click="$emit('close')">
              <i class="fa fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="px-6 py-5 space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Imágenes <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="(slot, idx) in imageSlots" :key="idx" class="relative">
                  <label
                    class="relative flex items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden bg-gray-50"
                  >
                    <img v-if="slot.preview" :src="slot.preview" alt="" class="absolute inset-0 w-full h-full object-cover" />
                    <span v-else class="text-xs text-gray-400">Agregar imagen</span>
                    <input type="file" accept="image/*" class="hidden" @change="$emit('imageChange', $event, idx)" />
                  </label>
                  <button
                    v-if="slot.preview"
                    type="button"
                    class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white"
                    @click="$emit('imageClear', idx)"
                  >
                    <i class="fa fa-xmark text-xs"></i>
                  </button>
                  <div v-if="slot.uploading" class="mt-1 h-1.5 bg-gray-200 rounded">
                    <div class="h-1.5 bg-brand rounded" :style="{ width: slot.progress + '%' }"></div>
                  </div>
                </div>
              </div>
              <p v-if="formErrors.imagen" class="text-red-500 text-xs mt-1">{{ formErrors.imagen }}</p>
            </div>

            <div class="grid sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  :value="fNombre"
                  class="input"
                  @input="$emit('update:fNombre', ($event.target as HTMLInputElement).value)"
                />
                <p v-if="formErrors.nombre" class="text-red-500 text-xs mt-1">{{ formErrors.nombre }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select
                  :value="selectedCategoriaId ?? ''"
                  class="input"
                  @change="selectCategoria(($event.target as HTMLSelectElement).value)"
                >
                  <option value="">Seleccionar</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                    {{ cat.nombre }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subcategoría / marca *</label>
                <select
                  :value="fSubcategoriaId ?? ''"
                  class="input"
                  :disabled="!selectedCategoriaId"
                  @change="$emit('update:fSubcategoriaId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
                >
                  <option value="">{{ selectedCategoriaId ? 'Seleccionar marca o General' : 'Elegí una categoría' }}</option>
                  <option v-for="sub in filteredSubcategorias" :key="sub.id" :value="sub.id">
                    {{ sub.nombre === 'General' ? 'General (sin marca específica)' : sub.nombre }}
                  </option>
                </select>
                <p v-if="formErrors.subcategoria" class="text-red-500 text-xs mt-1">{{ formErrors.subcategoria }}</p>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio general opcional</label>
                <input
                  :value="fPrecio"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input"
                  placeholder="Vacío si cada variante tiene su precio"
                  @input="$emit('update:fPrecio', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined)"
                />
                <p v-if="formErrors.precio" class="text-red-500 text-xs mt-1">{{ formErrors.precio }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio anterior</label>
                <input
                  :value="fPrecioAnterior"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input"
                  @input="$emit('update:fPrecioAnterior', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined)"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Variantes por talle: unidades, precio, stock e imagen</label>
                <button type="button" class="btn-ghost text-sm" @click="$emit('addTalle')">Agregar</button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(item, idx) in fTalles"
                  :key="idx"
                  draggable="true"
                  :class="[
                    'grid grid-cols-1 gap-2 rounded-lg border bg-gray-50 p-3 transition sm:grid-cols-[80px_1fr_1fr_120px_100px_40px]',
                    draggedVariantIndex === idx ? 'border-brand opacity-70' : 'border-gray-100',
                  ]"
                  @dragstart="onVariantDragStart(idx)"
                  @dragover.prevent
                  @drop="onVariantDrop(idx)"
                  @dragend="draggedVariantIndex = null"
                >
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="h-10 flex-1 cursor-grab rounded border border-gray-200 bg-white text-gray-400 active:cursor-grabbing"
                      title="Arrastrar variante"
                    >
                      <i class="fa fa-grip-vertical" />
                    </button>
                    <div class="flex flex-col gap-1">
                      <button
                        type="button"
                        class="h-[18px] w-7 rounded border border-gray-200 bg-white text-[10px] text-gray-400 disabled:opacity-30"
                        :disabled="idx === 0"
                        title="Subir variante"
                        @click="reorderVariant(idx, idx - 1)"
                      >
                        <i class="fa fa-chevron-up" />
                      </button>
                      <button
                        type="button"
                        class="h-[18px] w-7 rounded border border-gray-200 bg-white text-[10px] text-gray-400 disabled:opacity-30"
                        :disabled="idx === fTalles.length - 1"
                        title="Bajar variante"
                        @click="reorderVariant(idx, idx + 1)"
                      >
                        <i class="fa fa-chevron-down" />
                      </button>
                    </div>
                  </div>
                  <input
                    :value="item.talle"
                    class="input"
                    placeholder="Talle. Ej: RN, M, XG"
                    @input="$emit('update:fTalles', updateTalle(idx, 'talle', ($event.target as HTMLInputElement).value))"
                  />
                  <input
                    :value="item.units"
                    class="input"
                    placeholder="Unidades. Ej: 48u"
                    @input="$emit('update:fTalles', updateTalle(idx, 'units', ($event.target as HTMLInputElement).value))"
                  />
                  <input
                    :value="item.price ?? ''"
                    type="number"
                    min="0"
                    step="0.01"
                    class="input"
                    placeholder="Precio"
                    @input="$emit('update:fTalles', updateTalle(idx, 'price', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null))"
                  />
                  <input
                    :value="item.stock"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="Stock"
                    @input="$emit('update:fTalles', updateTalle(idx, 'stock', Number(($event.target as HTMLInputElement).value)))"
                  />
                  <button type="button" class="btn-ghost" @click="$emit('removeTalle', idx)">
                    <i class="fa fa-trash"></i>
                  </button>
                  <div class="sm:col-span-6 flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-2">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div v-if="item.image" class="h-14 w-14 overflow-hidden rounded border border-gray-200 bg-gray-50 shrink-0">
                        <img :src="normalizeProductImageUrl(item.image)" alt="" class="h-full w-full object-cover" />
                      </div>
                      <input
                        :value="item.image"
                        class="input flex-1"
                        placeholder="Imagen de esta variante (URL opcional)"
                        @input="$emit('update:fTalles', updateTalle(idx, 'image', ($event.target as HTMLInputElement).value))"
                      />
                      <label class="btn-ghost text-sm text-center cursor-pointer whitespace-nowrap">
                        Subir imagen
                        <input type="file" accept="image/*" class="hidden" @change="$emit('variantImageChange', $event, idx)" />
                      </label>
                    </div>
                    <p class="text-[11px] text-gray-400">
                      Ejemplo: podés cargar XXG 48u con una imagen y otra fila XXG 50u con otra imagen.
                    </p>
                  </div>
                </div>
              </div>
              <p v-if="formErrors.talles" class="text-red-500 text-xs mt-1">{{ formErrors.talles }}</p>
            </div>

            <div class="grid sm:grid-cols-3 gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="fIsPromo" type="checkbox" class="accent-brand" @change="$emit('update:fIsPromo', ($event.target as HTMLInputElement).checked)" />
                <span class="text-sm font-medium text-gray-700">Promoción</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="fDestacado" :disabled="destacadoDisabled" type="checkbox" class="accent-brand" @change="$emit('update:fDestacado', ($event.target as HTMLInputElement).checked)" />
                <span class="text-sm font-medium text-gray-700">Destacado {{ destacadosCount }}/10</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="fEnCarrusel" :disabled="carruselDisabled" type="checkbox" class="accent-brand" @change="$emit('update:fEnCarrusel', ($event.target as HTMLInputElement).checked)" />
                <span class="text-sm font-medium text-gray-700">Carrusel {{ carruselCount }}/10</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
            <button class="btn-primary" :disabled="saving || isUploading" @click="$emit('save')">
              {{ saveLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
