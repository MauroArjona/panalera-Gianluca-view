<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
  fPrecio: number
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
  'update:fPrecio': [v: number]
  'update:fPrecioAnterior': [v: number | undefined]
  'update:fSubcategoriaId': [v: number | null]
  'update:fTalles': [v: ProductSize[]]
  'update:fIsPromo': [v: boolean]
  'update:fDestacado': [v: boolean]
  'update:fEnCarrusel': [v: boolean]
  'imageChange': [e: Event, idx: number]
  'imageClear': [idx: number]
  'addTalle': []
  'removeTalle': [idx: number]
  'save': []
  'close': []
}>()

const selectedCategoriaId = ref<number | null>(null)

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
  if (props.isUploading) return 'Subiendo imagenes...'
  if (props.saving) return 'Guardando...'
  return props.isEditing ? 'Guardar' : 'Crear'
})

const destacadoDisabled = computed(() => !props.fDestacado && props.destacadosCount >= 10)
const carruselDisabled = computed(() => !props.fEnCarrusel && props.carruselCount >= 10)

function updateTalle(idx: number, field: keyof ProductSize, value: string | number) {
  const next = props.fTalles.map((item, itemIdx) =>
    itemIdx === idx ? { ...item, [field]: value } : item,
  )
  return next
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
                Imagenes <span class="text-red-500">*</span>
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Subcategoria / marca *</label>
                <select
                  :value="fSubcategoriaId ?? ''"
                  class="input"
                  :disabled="!selectedCategoriaId"
                  @change="$emit('update:fSubcategoriaId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
                >
                  <option value="">{{ selectedCategoriaId ? 'Seleccionar marca o General' : 'Elegi una categoria' }}</option>
                  <option v-for="sub in filteredSubcategorias" :key="sub.id" :value="sub.id">
                    {{ sub.nombre === 'General' ? 'General (sin marca especifica)' : sub.nombre }}
                  </option>
                </select>
                <p v-if="formErrors.subcategoria" class="text-red-500 text-xs mt-1">{{ formErrors.subcategoria }}</p>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                <input
                  :value="fPrecio"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input"
                  @input="$emit('update:fPrecio', Number(($event.target as HTMLInputElement).value))"
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
                <label class="block text-sm font-medium text-gray-700">Talles / presentaciones y stock</label>
                <button type="button" class="btn-ghost text-sm" @click="$emit('addTalle')">Agregar</button>
              </div>
              <div class="space-y-2">
                <div v-for="(item, idx) in fTalles" :key="idx" class="grid grid-cols-[1fr_120px_40px] gap-2">
                  <input
                    :value="item.talle"
                    class="input"
                    placeholder="Opcional. Ej: RN, M, 40u"
                    @input="$emit('update:fTalles', updateTalle(idx, 'talle', ($event.target as HTMLInputElement).value))"
                  />
                  <input
                    :value="item.stock"
                    type="number"
                    min="0"
                    class="input"
                    @input="$emit('update:fTalles', updateTalle(idx, 'stock', Number(($event.target as HTMLInputElement).value)))"
                  />
                  <button type="button" class="btn-ghost" @click="$emit('removeTalle', idx)">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
              <p v-if="formErrors.talles" class="text-red-500 text-xs mt-1">{{ formErrors.talles }}</p>
            </div>

            <div class="grid sm:grid-cols-3 gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input :checked="fIsPromo" type="checkbox" class="accent-brand" @change="$emit('update:fIsPromo', ($event.target as HTMLInputElement).checked)" />
                <span class="text-sm font-medium text-gray-700">Promocion</span>
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
