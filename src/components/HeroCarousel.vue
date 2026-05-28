<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { productApi } from '@/api/client'
import { MOCK_HERO_SLIDES } from '@/data/mock'

const slides = ref<any[]>([])
const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// Función para mapear producto a slide
function productToSlide(product: any) {
  return {
    id: product.id,
    title: product.name,
    subtitle: 'Producto destacado',
    description: product.description || 'Descubre este increíble producto.',
    image: product.image,
    ctaLabel: 'Ver producto',
    ctaLink: `/product/${product.slug}`,
  }
}

async function loadSlides() {
  try {
    const products = await productApi.getCarrusel()
    slides.value = products.map(productToSlide)
    if (slides.value.length === 0) {
      // Fallback a mock si no hay productos
      slides.value = MOCK_HERO_SLIDES
    }
  } catch (error) {
    console.error('Error cargando carrusel:', error)
    slides.value = MOCK_HERO_SLIDES
  }
}

function next() {
  current.value = (current.value + 1) % slides.value.length
}
function prev() {
  current.value = (current.value - 1 + slides.value.length) % slides.value.length
}
function goTo(i: number) {
  current.value = i
}

onMounted(async () => {
  await loadSlides()
  timer = setInterval(next, 5000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
<template>
  <div class="relative overflow-hidden bg-gray-50" style="height: calc(100vh - 4rem)">
    <transition-group name="fade" tag="div" class="h-full">
      <div
        v-for="(slide, i) in slides"
        v-show="i === current"
        :key="slide.id"
        class="absolute inset-0 w-full h-full"
      >
        <div class="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div class="flex flex-col-reverse md:flex-row items-center gap-10 w-full">
            <!-- Texto -->
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-4xl md:text-5xl font-bold text-brand mb-3">{{ slide.title }}</h1>
              <h2 class="text-xl md:text-2xl font-semibold text-gray-800 mb-5">{{ slide.subtitle }}</h2>
              <p class="text-gray-600 mb-8 max-w-md mx-auto md:mx-0 text-lg">{{ slide.description }}</p>
              <router-link :to="slide.ctaLink" class="btn-primary text-lg px-9 py-4">
                {{ slide.ctaLabel }}
              </router-link>
            </div>
            <!-- Imagen -->
            <div class="flex-1 flex justify-center">
              <img
                :src="slide.image"
                :alt="slide.title"
                class="w-full max-w-lg object-cover rounded-xl shadow-md"
                style="max-height: calc(100vh - 10rem)"
              />
            </div>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- Flechas -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-11 h-11 flex items-center justify-center transition z-10"
      @click="prev"
    >
      <i class="fas fa-chevron-left text-gray-700" />
    </button>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-11 h-11 flex items-center justify-center transition z-10"
      @click="next"
    >
      <i class="fas fa-chevron-right text-gray-700" />
    </button>

    <!-- Dots -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <button
        v-for="(_, i) in slides"
        :key="i"
        :class="['h-2.5 rounded-full transition-all', i === current ? 'bg-brand w-7' : 'bg-gray-400 w-2.5']"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>