<script setup lang="ts">
import { computed } from 'vue'
import type { Subcategoria, Color } from '@/api/client'
import type { ExtraImage } from '@/composables/useProductForm'

const props = defineProps<{
  open: boolean
  isEditing: boolean
  saving: boolean
  isUploading: boolean

  // Main image
  imagePreview: string
  uploading: boolean
  uploadProgress: number

  // Extra images
  extraImages: ExtraImage[]
  maxExtra: number

  // Form fields
  fNombre: string
  fCodigo: string
  fPrecio: number
  fPrecioAnterior: number | undefined
  fDescripcion: string
  fSubcategoriaId: string
  fActivo: boolean
  fDestacado: boolean
  fEnCarrusel: boolean
  fTalles: string
  fColorIds: string[]

  // Catalog
  subcategorias: Subcategoria[]
  colores: Color[]
  categoriasUnicas: string[]

  // Errors
  formErrors: Record<string, string>
}>()

const emit = defineEmits<{
  'update:fNombre': [v: string]
  'update:fCodigo': [v: string]
  'update:fPrecio': [v: number]
  'update:fPrecioAnterior': [v: number | undefined]
  'update:fDescripcion': [v: string]
  'update:fSubcategoriaId': [v: string]
  'update:fActivo': [v: boolean]
  'update:fDestacado': [v: boolean]
  'update:fEnCarrusel': [v: boolean]
  'update:fTalles': [v: string]
  'imageChange': [e: Event]
  'imageClear': []
  'extraChange': [e: Event, idx: number]
  'extraClear': [idx: number]
  'toggleColor': [id: string]
  'save': []
  'close': []
}>()

const saveLabel = computed(() => {
  if (props.isUploading) return 'Subiendo imágenes…'
  if (props.saving) return 'Guardando…'
  return props.isEditing ? 'Guardar' : 'Crear'
})


function normalizeHexColor(value?: string | null) {
  const color = value?.trim() ?? ''

  if (/^#[0-9a-f]{6}$/i.test(color)) return color

  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [, r, g, b] = color
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return '#ffffff'
}

function colorDotSrc(value?: string | null) {
  const color = normalizeHexColor(value)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="${color}"/></svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
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
        <div
          class="product-form-modal bg-white rounded-2xl shadow-xl w-full max-w-2xl"
          data-darkreader-ignore
          style="background: #ffffff; color: #111827;"
        >

          <!-- Header -->
          <div class="modal-light-surface flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-900">
              <i :class="['fa mr-2 text-brand', isEditing ? 'fa-pen-to-square' : 'fa-plus-circle']"></i>
              {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
            </h2>
            <button
              class="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              @click="$emit('close')"
            >
              <i class="fa fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-light-surface px-6 py-5 space-y-5">

            <!-- ── Imágenes (principal + adicionales juntas) ─────────── -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del producto
                <span class="text-gray-400 font-normal">(hasta {{ maxExtra }} adicionales)</span>
              </label>

              <div class="space-y-4">

              <!-- Imagen principal -->
              <div class="w-full">
                <label
                  class="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition overflow-hidden"
                  :class="
                    imagePreview
                      ? 'border-brand/40 bg-brand/5'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  "
                >
                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    alt="preview principal"
                    class="absolute inset-0 w-full h-full object-contain p-3"
                  />

                  <div
                    v-if="imagePreview"
                    class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex flex-col items-center justify-center gap-2"
                  >
                    <i class="fa fa-camera text-white text-2xl"></i>
                    <span class="text-white text-sm font-medium">Cambiar imagen</span>
                  </div>

                  <div
                    v-if="!imagePreview"
                    class="flex flex-col items-center gap-3 text-gray-400 pointer-events-none"
                  >
                    <i class="fa fa-cloud-arrow-up text-5xl"></i>
                    <span class="text-sm text-center">
                      Imagen principal<br />
                      JPG · PNG · WEBP
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="$emit('imageChange', $event)"
                  />
                </label>

                <!-- Progress principal -->
                <div v-if="uploading" class="mt-2">
                  <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Subiendo…</span>
                    <span>{{ uploadProgress }}%</span>
                  </div>

                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-brand h-2 rounded-full transition-all"
                      :style="{ width: uploadProgress + '%' }"
                    ></div>
                  </div>
                </div>

                <button
                  v-if="imagePreview && !uploading"
                  type="button"
                  class="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  @click="$emit('imageClear')"
                >
                  <i class="fa fa-xmark"></i>
                  Quitar imagen
                </button>
              </div>

              <!-- Extras -->
              <div class="relative">

                <!-- Fade izquierda -->
                <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>

                <!-- Fade derecha -->
                <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                <!-- Scroll -->
                <div
                  class="flex gap-3 overflow-x-auto pb-3 px-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                >
                  <div
                    v-for="(slot, idx) in extraImages"
                    :key="idx"
                    class="relative flex-shrink-0 snap-start"
                  >
                    <label
                      class="relative flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-xl cursor-pointer transition overflow-hidden"
                      :class="
                        slot.preview
                          ? 'border-brand/40 bg-brand/5'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      "
                    >
                      <img
                        v-if="slot.preview"
                        :src="slot.preview"
                        alt="imagen adicional"
                        class="absolute inset-0 w-full h-full object-cover"
                      />

                      <div
                        v-if="slot.preview"
                        class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center"
                      >
                        <i class="fa fa-camera text-white"></i>
                      </div>

                      <div
                        v-if="!slot.preview"
                        class="flex flex-col items-center gap-1 text-gray-400 pointer-events-none"
                      >
                        <i class="fa fa-plus text-xl"></i>
                        <span class="text-[11px]">Agregar</span>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="$emit('extraChange', $event, idx)"
                      />
                    </label>

                    <!-- Progress -->
                    <div v-if="slot.uploading" class="mt-1">
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          class="bg-brand h-1.5 rounded-full transition-all"
                          :style="{ width: slot.progress + '%' }"
                        ></div>
                      </div>
                    </div>

                    <!-- Delete -->
                    <button
                      v-if="slot.preview && !slot.uploading"
                      type="button"
                      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-md z-20"
                      @click.prevent="$emit('extraClear', idx)"
                    >
                      <i class="fa fa-xmark text-xs"></i>
                    </button>
                  </div>
                </div>

                <!-- Hint -->
                <p class="text-xs text-gray-400 mt-1 px-1">
                  Deslizá horizontalmente para ver más imágenes
                </p>

              </div>

            </div>
            </div>

            <!-- ── Nombre ──────────────────────────────────────────────── -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                :value="fNombre"
                type="text"
                class="input"
                placeholder="Ej: Zapatilla Running Pro"
                @input="$emit('update:fNombre', ($event.target as HTMLInputElement).value)"
              />
              <p v-if="formErrors.nombre" class="text-red-500 text-xs mt-1">{{ formErrors.nombre }}</p>
            </div>

            <!-- ── Código / Precio / Precio anterior ──────────────────── -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Código <span class="text-red-500">*</span>
                </label>
                <input
                  :value="fCodigo"
                  type="text"
                  class="input uppercase"
                  placeholder="ZAP001"
                  :disabled="isEditing"
                  @input="$emit('update:fCodigo', ($event.target as HTMLInputElement).value)"
                />
                <p v-if="formErrors.codigo" class="text-red-500 text-xs mt-1">{{ formErrors.codigo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Precio <span class="text-red-500">*</span>
                </label>
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
                  placeholder="Opcional"
                  @input="$emit('update:fPrecioAnterior', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined)"
                />
              </div>
            </div>

            <!-- ── Subcategoría ────────────────────────────────────────── -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
              <select
                :value="fSubcategoriaId"
                class="input"
                @change="$emit('update:fSubcategoriaId', ($event.target as HTMLSelectElement).value)"
              >
                <option value="">— Sin subcategoría —</option>
                <optgroup v-for="cat in categoriasUnicas" :key="cat" :label="cat">
                  <option
                    v-for="sub in subcategorias.filter((s) => s.categoria?.nombre === cat)"
                    :key="sub.id"
                    :value="sub.id"
                  >
                    {{ sub.nombre }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- ── Descripción ─────────────────────────────────────────── -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                :value="fDescripcion"
                class="input resize-none"
                rows="3"
                placeholder="Descripción del producto..."
                @input="$emit('update:fDescripcion', ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </div>

            <!-- ── Talles ──────────────────────────────────────────────── -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Talles <span class="text-gray-400 font-normal">(separados por coma)</span>
              </label>
              <input
                :value="fTalles"
                type="text"
                class="input"
                placeholder="Ej: 38, 39, 40, 41"
                @input="$emit('update:fTalles', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- ── Colores ─────────────────────────────────────────────── -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Colores <span class="text-gray-400 font-normal">(seleccioná uno o más)</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in colores"
                  :key="color.id"
                  type="button"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition',
                    fColorIds.includes(color.id)
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-gray-200 text-gray-600 hover:border-brand',
                  ]"
                  @click="$emit('toggleColor', color.id)"
                >
                  <img
                    v-if="color.codigo_hex"
                    :src="colorDotSrc(color.codigo_hex)"
                    alt=""
                    aria-hidden="true"
                    class="color-dot shrink-0"
                  />
                  {{ color.nombre }}
                  <i v-if="fColorIds.includes(color.id)" class="fa fa-check text-[10px]"></i>
                </button>
                <span v-if="colores.length === 0" class="text-xs text-gray-400 italic">
                  No hay colores registrados.
                </span>
              </div>
            </div>

            <!-- ── Toggles ─────────────────────────────────────────────── -->
            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  :checked="fDestacado"
                  type="checkbox"
                  class="w-4 h-4 rounded accent-brand"
                  @change="$emit('update:fDestacado', ($event.target as HTMLInputElement).checked)"
                />
                <span class="text-sm font-medium text-gray-700">Destacado</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  :checked="fEnCarrusel"
                  type="checkbox"
                  class="w-4 h-4 rounded accent-brand"
                  @change="$emit('update:fEnCarrusel', ($event.target as HTMLInputElement).checked)"
                />
                <span class="text-sm font-medium text-gray-700">Mostrar en carrusel</span>
              </label>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-light-surface flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                :checked="fActivo"
                type="checkbox"
                class="w-4 h-4 rounded accent-brand"
                @change="$emit('update:fActivo', ($event.target as HTMLInputElement).checked)"
              />
              <span class="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <i :class="['fa text-base', fActivo ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-400']"></i>
                {{ fActivo ? 'En stock' : 'Sin stock' }}
              </span>
            </label>

            <div class="flex items-center gap-3">
              <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
              <button
                class="btn-primary"
                :disabled="saving || isUploading"
                @click="$emit('save')"
              >
                {{ saveLabel }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.product-form-modal {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: linear-gradient(#ffffff, #ffffff) !important;
  color: #111827 !important;
  color-scheme: light;
  forced-color-adjust: none;
  box-shadow:
    inset 0 0 0 9999px #ffffff,
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
}

.product-form-modal,
.product-form-modal :deep(*) {
  color-scheme: light;
  forced-color-adjust: none;
}

.modal-light-surface {
  background: #ffffff !important;
  background-color: #ffffff !important;
  background-image: linear-gradient(#ffffff, #ffffff) !important;
  color: #111827 !important;
  box-shadow: inset 0 0 0 9999px #ffffff;
}

.product-form-modal :deep(input),
.product-form-modal :deep(textarea),
.product-form-modal :deep(select) {
  background-color: #ffffff !important;
  background-image: linear-gradient(#ffffff, #ffffff) !important;
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  border-color: #d1d5db !important;
  color-scheme: light;
  forced-color-adjust: none;
  box-shadow: inset 0 0 0 9999px #ffffff !important;
}

.product-form-modal :deep(option),
.product-form-modal :deep(optgroup) {
  background-color: #ffffff !important;
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
}

.product-form-modal :deep(button) {
  forced-color-adjust: none;
}

.product-form-modal :deep(label),
.product-form-modal :deep(span),
.product-form-modal :deep(p),
.product-form-modal :deep(h2) {
  color: inherit;
  -webkit-text-fill-color: currentColor;
  forced-color-adjust: none;
}

.product-form-modal :deep(button:not(.btn-primary):not(.bg-red-500)) {
  background-image: linear-gradient(#ffffff, #ffffff) !important;
  box-shadow: inset 0 0 0 9999px #ffffff !important;
}

.product-form-modal :deep(.bg-gray-50),
.product-form-modal :deep(.hover\:bg-gray-100),
.product-form-modal :deep(.bg-brand\/5) {
  background-color: #f9fafb !important;
  background-image: linear-gradient(#f9fafb, #f9fafb) !important;
  box-shadow: inset 0 0 0 9999px #f9fafb !important;
}

.product-form-modal :deep(.color-dot) {
  width: 0.75rem;      /* 12px — equivalente a w-3 */
  height: 0.75rem;     /* 12px — equivalente a h-3 */
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  display: inline-block;
  flex-shrink: 0;
  background: transparent !important;
  forced-color-adjust: none;
  filter: none !important;
  object-fit: cover;
}
</style>
