import { ref, computed } from 'vue'
import { productApi, catalogApi } from '@/api/client'
import type { Product, ProductPayload, Subcategoria, Color } from '@/api/client'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000')

// ─── Upload base ───────────────────────────────────────────────────────────────
export async function uploadImageFile(file: File, onProgress?: (p: number) => void): Promise<string> {
  const formData = new FormData()
  formData.append('imagen', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}/upload/imagen`)

    const token = localStorage.getItem('auth_token')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    })

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).url)
      } else {
        reject(new Error(JSON.parse(xhr.responseText).message ?? 'Error al subir imagen'))
      }
    }
    xhr.onerror = () => reject(new Error('Error de red'))
    xhr.send(formData)
  })
}

// ─── Extra images slot type ────────────────────────────────────────────────────
export interface ExtraImage {
  file: File | null
  preview: string
  url: string
  uploading: boolean
  progress: number
}

export function makeEmptySlot(): ExtraImage {
  return { file: null, preview: '', url: '', uploading: false, progress: 0 }
}

// ─── Composable ───────────────────────────────────────────────────────────────
export function useProductForm() {
  const MAX_EXTRA = 5

  // Catalog
  const subcategorias = ref<Subcategoria[]>([])
  const colores       = ref<Color[]>([])

  const categoriasUnicas = computed<string[]>(() => {
    const set = new Set<string>()
    subcategorias.value.forEach((s) => { if (s.categoria?.nombre) set.add(s.categoria.nombre) })
    return Array.from(set).sort()
  })

  async function loadCatalog() {
    const [subRes, colRes] = await Promise.all([
      catalogApi.listSubcategorias(),
      catalogApi.listColores(),
    ])
    subcategorias.value = subRes
    colores.value       = colRes
  }

  // Form fields
  const fNombre          = ref('')
  const fCodigo          = ref('')
  const fPrecio          = ref<number>(0)
  const fPrecioAnterior  = ref<number | undefined>(undefined)
  const fDescripcion     = ref('')
  const fSubcategoriaId  = ref('')
  const fActivo          = ref(true)
  const fDestacado       = ref(false)
  const fEnCarrusel      = ref(false)
  const fTalles          = ref('')
  const fColorIds        = ref<string[]>([])
  const fImagenPrincipal = ref('')

  // Main image upload state
  const uploading       = ref(false)
  const uploadProgress  = ref(0)
  const imageFile       = ref<File | null>(null)
  const imagePreview    = ref('')

  // Extra images
  const extraImages = ref<ExtraImage[]>([makeEmptySlot()])

  const isUploading = computed(() =>
    uploading.value || extraImages.value.some((s) => s.uploading)
  )

  // Validation
  const formErrors = ref<Record<string, string>>({})

  function validate(): boolean {
    formErrors.value = {}
    if (!fNombre.value.trim()) formErrors.value.nombre = 'El nombre es obligatorio.'
    if (!fCodigo.value.trim()) formErrors.value.codigo = 'El código es obligatorio.'
    if (fPrecio.value <= 0)    formErrors.value.precio = 'El precio debe ser mayor a 0.'
    return Object.keys(formErrors.value).length === 0
  }

  function buildPayload(): ProductPayload {
    const talles      = fTalles.value.split(',').map((s) => s.trim()).filter(Boolean)
    const adicionales = extraImages.value.map((s) => s.url).filter(Boolean)
    const todasImagenes = [...(fImagenPrincipal.value ? [fImagenPrincipal.value] : []), ...adicionales]
    const variantes   = fColorIds.value.map((color_id) => ({ color_id }))

    return {
      codigo:          fCodigo.value.trim().toUpperCase(),
      nombre:          fNombre.value.trim(),
      descripcion:     fDescripcion.value.trim() || undefined,
      precio:          fPrecio.value,
      precio_anterior: fPrecioAnterior.value ?? null,
      subcategoria_id: fSubcategoriaId.value || null,
      activo:          fActivo.value,
      destacado:       fDestacado.value,
      en_carrusel:     fEnCarrusel.value,
      imagenesUrls:    todasImagenes,
      talles:          talles.length ? talles : undefined,
      variantes:       variantes.length ? variantes : undefined,
    }
  }

  function resetForm() {
    fNombre.value = ''; fCodigo.value = ''; fPrecio.value = 0
    fPrecioAnterior.value = undefined; fDescripcion.value = ''
    fSubcategoriaId.value = ''; fActivo.value = true
    fDestacado.value = false; fEnCarrusel.value = false
    fTalles.value = ''; fColorIds.value = []
    fImagenPrincipal.value = ''
    imageFile.value = null; imagePreview.value = ''
    uploadProgress.value = 0
    extraImages.value = [makeEmptySlot()]
    formErrors.value = {}
  }

  function populateForm(product: Product) {
    fNombre.value          = product.name
    fCodigo.value          = product.codigo
    fPrecio.value          = product.price
    fPrecioAnterior.value  = product.originalPrice
    fDescripcion.value     = product.description
    fSubcategoriaId.value  = ''
    fActivo.value          = product.inStock
    fDestacado.value       = product.featured
    fEnCarrusel.value      = product.inCarrusel
    fImagenPrincipal.value = product.image
    imagePreview.value     = product.image
    imageFile.value        = null
    uploadProgress.value   = 0

    const urlsAdicionales = product.images.slice(1)
    extraImages.value = urlsAdicionales.length
      ? [
          ...urlsAdicionales.map((u) => ({ file: null, preview: u, url: u, uploading: false, progress: 0 })),
          ...(urlsAdicionales.length < MAX_EXTRA ? [makeEmptySlot()] : []),
        ]
      : [makeEmptySlot()]

    fTalles.value   = product.sizes.join(', ')
    fColorIds.value = product.colors
      .map((c) => colores.value.find((col) => col.nombre === c.name)?.id ?? '')
      .filter(Boolean)
    formErrors.value = {}
  }

  // Image handlers
  function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    imageFile.value    = file
    imagePreview.value = URL.createObjectURL(file)
  }

  async function uploadMainImage(file: File): Promise<string> {
    uploading.value      = true
    uploadProgress.value = 0
    try {
      return await uploadImageFile(file, (p) => { uploadProgress.value = p })
    } finally {
      uploading.value = false
    }
  }

  function clearImage() {
    imageFile.value        = null
    imagePreview.value     = ''
    fImagenPrincipal.value = ''
    uploadProgress.value   = 0
  }

  function onExtraFileChange(e: Event, idx: number) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    extraImages.value[idx].file    = file
    extraImages.value[idx].preview = URL.createObjectURL(file)
    extraImages.value[idx].url     = ''

    if (idx === extraImages.value.length - 1 && extraImages.value.length < MAX_EXTRA) {
      extraImages.value.push(makeEmptySlot())
    }
  }

  function clearExtraImage(idx: number) {
    extraImages.value.splice(idx, 1)
    if (extraImages.value.length === 0) extraImages.value.push(makeEmptySlot())
  }

  async function uploadExtraImages(): Promise<void> {
    for (const slot of extraImages.value) {
      if (!slot.file || !slot.preview) continue
      slot.uploading = true
      slot.progress  = 0
      try {
        slot.url       = await uploadImageFile(slot.file, (p) => { slot.progress = p })
        slot.uploading = false
      } catch (e) {
        slot.uploading = false
        throw e
      }
    }
  }

  function toggleColor(id: string) {
    const idx = fColorIds.value.indexOf(id)
    if (idx === -1) fColorIds.value.push(id)
    else fColorIds.value.splice(idx, 1)
  }

  return {
    // catalog
    subcategorias, colores, categoriasUnicas, loadCatalog,
    // fields
    fNombre, fCodigo, fPrecio, fPrecioAnterior, fDescripcion,
    fSubcategoriaId, fActivo, fDestacado, fEnCarrusel,
    fTalles, fColorIds, fImagenPrincipal,
    // main image
    uploading, uploadProgress, imageFile, imagePreview,
    onFileChange, uploadMainImage, clearImage,
    // extra images
    extraImages, MAX_EXTRA,
    onExtraFileChange, clearExtraImage, uploadExtraImages,
    // form
    formErrors, validate, buildPayload, resetForm, populateForm,
    isUploading, toggleColor,
  }
}
