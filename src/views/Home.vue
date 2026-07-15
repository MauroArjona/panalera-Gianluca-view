<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHero from '@/components/TheHero.vue'
import ProductCard from '@/components/ProductCard.vue'
import { productApi } from '@/api/client'
import type { Product } from '@/api/client'

interface StaticCategoria {
  nombre: string
  label: string
  icon: string
  tone: string
  text: string
}

const STATIC_CATEGORIAS: StaticCategoria[] = [
  {
    nombre: 'Panales',
    label: 'Panales',
    icon: 'fa-baby',
    tone: 'bg-sky-50 text-sky-600 border-sky-100',
    text: 'Marcas y talles para cada etapa.',
  },
  {
    nombre: 'Higiene',
    label: 'Higiene',
    icon: 'fa-hand-sparkles',
    tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    text: 'Toallitas, oleos y cuidado diario.',
  },
  {
    nombre: 'Accesorios',
    label: 'Accesorios',
    icon: 'fa-bottle-droplet',
    tone: 'bg-amber-50 text-amber-600 border-amber-100',
    text: 'Mamaderas, chupetes y esenciales.',
  },
]

const featured = ref<Product[]>([])
const categorias = ref<StaticCategoria[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    featured.value = await productApi.getFeatured()
    categorias.value = STATIC_CATEGORIAS
  } catch (e) {
    console.error('Error cargando home:', e)
    categorias.value = STATIC_CATEGORIAS
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <TheHero />

  <section class="bg-gradient-to-b from-sky-50/70 to-white py-10">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="info-glow-card info-glow-sky flex items-center gap-3 rounded-lg border border-sky-100 bg-white px-4 py-3 shadow-sm">
        <span class="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
          <i class="fa fa-truck-fast" />
        </span>
        <div>
          <p class="font-semibold text-gray-800 text-sm">Envios</p>
          <p class="text-xs text-gray-500">Tomamos pedidos hasta las 18 hs</p>
        </div>
      </div>
      <div class="info-glow-card info-glow-emerald flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 shadow-sm">
        <span class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <i class="fa fa-house-chimney" />
        </span>
        <div>
          <p class="font-semibold text-gray-800 text-sm">Retiros</p>
          <p class="text-xs text-gray-500">En domicilio de 8 a 22 hs</p>
        </div>
      </div>
      <div class="info-glow-card info-glow-amber flex items-center gap-3 rounded-lg border border-amber-100 bg-white px-4 py-3 shadow-sm">
        <span class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <i class="fa fa-tags" />
        </span>
        <div>
          <p class="font-semibold text-gray-800 text-sm">Promos para el mes</p>
          <p class="text-xs text-gray-500">Combos y destacados</p>
        </div>
      </div>
      <div class="info-glow-card info-glow-rose flex items-center gap-3 rounded-lg border border-rose-100 bg-white px-4 py-3 shadow-sm">
        <span class="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
          <i class="fa fa-heart" />
        </span>
        <div>
          <p class="font-semibold text-gray-800 text-sm">Cuidado diario</p>
          <p class="text-xs text-gray-500">Todo para bebes y familias</p>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 py-14">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
      <div>
        <p class="text-sm font-semibold text-brand mb-1">Comprar por categoria</p>
        <h2 class="text-3xl font-bold text-gray-900">Lo esencial para el bebe</h2>
      </div>
      <p class="text-gray-500 max-w-xl">
        Encontra rapido pañales, higiene y accesorios por marca, talle o necesidad.
      </p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="n in 3" :key="n" class="rounded-lg border border-gray-100 bg-white p-5 animate-pulse">
        <div class="w-12 h-12 rounded-full bg-gray-200 mb-4" />
        <div class="h-4 bg-gray-200 rounded w-24" />
        <div class="h-3 bg-gray-200 rounded w-4/5 mt-3" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <router-link
        v-for="cat in categorias"
        :key="cat.nombre"
        :to="{ path: '/shop', query: { category: cat.nombre } }"
        class="group rounded-lg border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <span :class="['w-12 h-12 rounded-full border flex items-center justify-center mb-4', cat.tone]">
              <i :class="['fa', cat.icon]" />
            </span>
            <h3 class="font-bold text-lg text-gray-900">{{ cat.label }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ cat.text }}</p>
          </div>
          <i class="fa fa-arrow-right text-gray-300 group-hover:text-brand transition mt-2" />
        </div>
      </router-link>
    </div>
  </section>

  <section class="bg-sky-50/60 py-14">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <p class="text-sm font-semibold text-brand mb-1">Recomendados</p>
          <h2 class="text-3xl font-bold text-gray-900">Productos destacados</h2>
        </div>
        <p class="text-gray-500 max-w-xl">
          Seleccionados para resolver la compra diaria sin dar tantas vueltas.
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-white rounded shadow-sm animate-pulse">
          <div class="h-52 bg-gray-200 rounded-t" />
          <div class="p-4 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4" />
            <div class="h-3 bg-gray-200 rounded w-1/2" />
            <div class="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>

      <div v-else-if="featured.length === 0" class="text-center py-16 text-gray-400">
        <i class="fa fa-box-open text-5xl mb-4 block" />
        <p>No hay productos destacados por el momento.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" />
      </div>

      <div class="text-center mt-10">
        <router-link to="/shop" class="btn-outline text-base px-8 py-3">
          Ver todos los productos <i class="fa fa-arrow-right ml-2" />
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.info-glow-card {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  animation: float-soft 4.5s ease-in-out infinite;
}

.info-glow-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  opacity: 0.75;
  filter: blur(12px);
  animation: glow-breathe 2.8s ease-in-out infinite;
}

.info-glow-card::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -45%;
  width: 38%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  transform: skewX(-18deg);
  animation: shine-pass 4.2s ease-in-out infinite;
}

.info-glow-sky::before {
  background: #7dd3fc;
}

.info-glow-emerald::before {
  background: #86efac;
}

.info-glow-amber::before {
  background: #fde68a;
}

.info-glow-rose::before {
  background: #fecdd3;
}

@keyframes glow-breathe {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
}

@keyframes shine-pass {
  0%, 55% { left: -45%; opacity: 0; }
  65% { opacity: 1; }
  100% { left: 115%; opacity: 0; }
}

@keyframes float-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
</style>
