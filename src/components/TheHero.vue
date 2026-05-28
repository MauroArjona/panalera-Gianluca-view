<!-- components/TheHero.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HeroCarousel from './HeroCarousel.vue'        // desktop (el viejo)
import HeroCarouselMobile from './HeroCarouselMobile.vue'  // mobile (el nuevo)

const isMobile = ref(false)

function check() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  check()
  window.addEventListener('resize', check)
})
onUnmounted(() => window.removeEventListener('resize', check))
</script>

<template>
  <HeroCarouselMobile v-if="isMobile" />
  <HeroCarousel v-else />
</template>