<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { productApi } from '@/api/client'
import { MOCK_HERO_SLIDES } from '@/data/mock'

const slides = ref<any[]>([])
const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

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
    if (slides.value.length === 0) slides.value = MOCK_HERO_SLIDES
  } catch {
    slides.value = MOCK_HERO_SLIDES
  }
}

function next() { current.value = (current.value + 1) % slides.value.length }
function prev() { current.value = (current.value - 1 + slides.value.length) % slides.value.length }
function goTo(i: number) { current.value = i }

onMounted(async () => {
  await loadSlides()
  timer = setInterval(next, 5000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <!--
    Mobile:  apila imagen arriba + texto abajo, altura automática
    Desktop: lado a lado, ocupa casi todo el viewport
  -->
  <div class="relative overflow-hidden bg-gray-50 min-h-[520px] md:min-h-0 md:h-[calc(100vh-4rem)]">
    <transition-group name="fade" tag="div" class="h-full">
      <div
        v-for="(slide, i) in slides"
        v-show="i === current"
        :key="slide.id"
        class="absolute inset-0 w-full h-full"
      >
        <div class="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div class="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full py-10 md:py-0">

            <!-- Imagen — arriba en mobile, derecha en desktop -->
            <div class="w-full md:flex-1 flex justify-center">
              <img
                :src="slide.image"
                :alt="slide.title"
                class="w-full max-w-xs sm:max-w-sm md:max-w-lg object-contain rounded-xl shadow-md"
                style="max-height: 280px; md:max-height: calc(100vh - 10rem)"
              />
            </div>

            <!-- Texto — debajo en mobile, izquierda en desktop -->
            <div class="flex-1 text-center md:text-left order-2 md:order-first">
              <h1 class="text-2xl sm:text-4xl md:text-5xl font-bold text-brand mb-2 md:mb-3 leading-tight">
                {{ slide.title }}
              </h1>
              <!-- <h2 class="text-base sm:text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-5">
                {{ slide.subtitle }}
              </h2> -->
              <p class="text-gray-600 mb-5 md:mb-8 max-w-md mx-auto md:mx-0 text-sm sm:text-base md:text-lg line-clamp-3">
                {{ slide.description }}
              </p>
              <router-link :to="slide.ctaLink" class="btn-primary text-sm sm:text-base md:text-lg px-7 py-3 md:px-9 md:py-4">
                {{ slide.ctaLabel }}
              </router-link>
            </div>

          </div>
        </div>
      </div>
    </transition-group>

    <!-- Flechas: ocultas en mobile para no tapar contenido -->
    <button
      class="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-11 h-11 items-center justify-center transition z-10"
      @click="prev"
    >
      <i class="fas fa-chevron-left text-gray-700" />
    </button>
    <button
      class="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-11 h-11 items-center justify-center transition z-10"
      @click="next"
    >
      <i class="fas fa-chevron-right text-gray-700" />
    </button>

    <!-- Dots -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>