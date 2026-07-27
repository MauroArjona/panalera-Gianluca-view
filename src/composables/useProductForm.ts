import { ref, computed } from 'vue'
import { uploadImage } from '@/api/client'
import { normalizeProductImageUrl } from '@/utils/productImage'
import type { Product, ProductPayload, ProductSize } from '@/api/client'

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

export function useProductForm() {
  const MAX_IMAGES = 6

  const fNombre = ref('')
  const fPrecio = ref<number>(0)
  const fPrecioAnterior = ref<number | undefined>(undefined)
  const fSubcategoriaId = ref<number | null>(null)
  const fTalles = ref<ProductSize[]>([{ talle: '', stock: 0, price: 0, units: '', image: '' }])
  const fIsPromo = ref(false)
  const fDestacado = ref(false)
  const fEnCarrusel = ref(false)
  const imageSlots = ref<ExtraImage[]>([makeEmptySlot()])
  const variantImageUploads = ref<Set<number>>(new Set())
  const formErrors = ref<Record<string, string>>({})

  const isUploading = computed(() =>
    imageSlots.value.some((slot) => slot.uploading) || variantImageUploads.value.size > 0,
  )

  function validate(): boolean {
    formErrors.value = {}
    if (!fNombre.value.trim()) formErrors.value.nombre = 'El nombre es obligatorio.'
    if (fPrecio.value <= 0) formErrors.value.precio = 'El precio debe ser mayor a 0.'
    if (!fSubcategoriaId.value) formErrors.value.subcategoria = 'La subcategoría es obligatoria.'
    if (!imageSlots.value.some((slot) => slot.url || slot.preview)) formErrors.value.imagen = 'Agrega al menos una imagen.'
    if (fTalles.value.some((item) => item.stock < 0)) formErrors.value.talles = 'El stock no puede ser negativo.'
    if (fTalles.value.some((item) => item.price < 0)) formErrors.value.talles = 'El precio de la variante no puede ser negativo.'
    return Object.keys(formErrors.value).length === 0
  }

  function buildPayload(): ProductPayload {
    return {
      name: fNombre.value.trim(),
      price: fPrecio.value,
      subcategoria_id: fSubcategoriaId.value,
      images: imageSlots.value.map((slot) => slot.url).filter(Boolean),
      talles: fTalles.value
        .map((item) => ({
          talle: item.talle.trim() || 'Unidad',
          stock: Number(item.stock ?? 0),
          price: Number(item.price || fPrecio.value),
          units: item.units?.trim() ?? '',
          image: item.image?.trim() ?? '',
        }))
        .filter((item) => item.talle || item.stock > 0),
      is_promo: fIsPromo.value,
      destacado: fDestacado.value,
      en_carrusel: fEnCarrusel.value,
      old_price: fPrecioAnterior.value ?? null,
    }
  }

  function resetForm() {
    fNombre.value = ''
    fPrecio.value = 0
    fPrecioAnterior.value = undefined
    fSubcategoriaId.value = null
    fTalles.value = [{ talle: '', stock: 0, price: 0, units: '', image: '' }]
    fIsPromo.value = false
    fDestacado.value = false
    fEnCarrusel.value = false
    imageSlots.value = [makeEmptySlot()]
    formErrors.value = {}
  }

  function populateForm(product: Product) {
    fNombre.value = product.name
    fPrecio.value = product.price
    fPrecioAnterior.value = product.oldPrice ?? undefined
    fSubcategoriaId.value = product.subcategoriaId
    fTalles.value = product.talles.length
      ? product.talles.map((item) => ({
        talle: item.talle,
        stock: item.stock,
        price: item.price ?? product.price,
        units: item.units ?? '',
        image: item.image ?? '',
      }))
      : [{ talle: '', stock: 0, price: product.price, units: '', image: '' }]
    fIsPromo.value = product.isPromo
    fDestacado.value = product.destacado
    fEnCarrusel.value = product.enCarrusel
    const productImages = product.images?.length ? product.images : product.image ? [product.image] : []
    imageSlots.value = productImages.length
      ? productImages.map((url) => ({ file: null, preview: normalizeProductImageUrl(url), url, uploading: false, progress: 0 }))
      : [makeEmptySlot()]
    if (imageSlots.value.length < MAX_IMAGES) imageSlots.value.push(makeEmptySlot())
    formErrors.value = {}
  }

  function onImageChange(e: Event, idx: number) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    imageSlots.value[idx].file = file
    imageSlots.value[idx].preview = URL.createObjectURL(file)
    imageSlots.value[idx].url = ''

    if (idx === imageSlots.value.length - 1 && imageSlots.value.length < MAX_IMAGES) {
      imageSlots.value.push(makeEmptySlot())
    }
  }

  function clearImage(idx: number) {
    imageSlots.value.splice(idx, 1)
    if (imageSlots.value.length === 0) imageSlots.value.push(makeEmptySlot())
  }

  async function uploadImages() {
    for (const slot of imageSlots.value) {
      if (!slot.file) continue
      slot.uploading = true
      slot.progress = 0
      try {
        slot.url = await uploadImage(slot.file, (progress) => { slot.progress = progress })
      } finally {
        slot.uploading = false
      }
    }
  }

  async function onVariantImageChange(e: Event, idx: number) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    variantImageUploads.value = new Set([...variantImageUploads.value, idx])
    try {
      const url = await uploadImage(file)
      fTalles.value = fTalles.value.map((item, itemIdx) =>
        itemIdx === idx ? { ...item, image: url } : item,
      )
    } finally {
      const next = new Set(variantImageUploads.value)
      next.delete(idx)
      variantImageUploads.value = next
      ;(e.target as HTMLInputElement).value = ''
    }
  }

  function addTalle() {
    fTalles.value.push({ talle: '', stock: 0, price: fPrecio.value, units: '', image: '' })
  }

  function removeTalle(idx: number) {
    fTalles.value.splice(idx, 1)
    if (fTalles.value.length === 0) fTalles.value.push({ talle: '', stock: 0, price: fPrecio.value, units: '', image: '' })
  }

  return {
    MAX_IMAGES,
    fNombre,
    fPrecio,
    fPrecioAnterior,
    fSubcategoriaId,
    fTalles,
    fIsPromo,
    fDestacado,
    fEnCarrusel,
    imageSlots,
    formErrors,
    isUploading,
    validate,
    buildPayload,
    resetForm,
    populateForm,
    onImageChange,
    clearImage,
    uploadImages,
    onVariantImageChange,
    addTalle,
    removeTalle,
  }
}
