<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHero from '@/components/TheHero.vue'
import ProductCard from '@/components/ProductCard.vue'
import { productApi, catalogApi } from '@/api/client'
import type { Product, Categoria } from '@/api/client'

// ─── Categorías estáticas ────────────────────────────────────────────────────
interface StaticCategoria {
  nombre: string   // valor que se pasa como query param al shop
  label: string    // texto visible en la tarjeta
  imagen: string   // URL pública o ruta de /assets
}

const STATIC_CATEGORIAS: StaticCategoria[] = [
{
  nombre: 'Tecnologia',
  label: 'Tecnología',
  imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
},
{
  nombre: 'Calzados',
  label: 'Calzados',
  imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
},
{
  nombre: 'Indumentaria',
  label: 'Indumentaria',
  imagen: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
},
]

// ────────────────────────────────────────────────────────────────────────────

const featured   = ref<Product[]>([])
const categorias = ref<StaticCategoria[]>([])
const loading    = ref(true)

onMounted(async () => {
  try {
    const [feat, cats] = await Promise.all([
      productApi.getFeatured(),
      catalogApi.listCategorias(),
    ])
    featured.value = feat

    // Tomamos solo las categorías estáticas cuyos nombres existen en el backend.
    
    categorias.value = STATIC_CATEGORIAS

  } catch (e) {
    console.error('Error cargando home:', e)
    // Igual mostramos las categorías estáticas aunque falle la API
    categorias.value = STATIC_CATEGORIAS
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <!-- Hero Carousel -->
  <TheHero />

  <!-- Categorías del Mes -->
  <section class="max-w-7xl mx-auto px-4 py-14">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-gray-800">Categorías del Mes</h2>
      <p class="text-gray-500 mt-2 max-w-lg mx-auto">
        Explorá nuestras categorías más populares. Algo para cada estilo y ocasión.
      </p>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div v-for="n in 3" :key="n" class="flex flex-col items-center gap-3 animate-pulse">
        <div class="w-40 h-40 rounded-full bg-gray-200" />
        <div class="h-4 bg-gray-200 rounded w-24" />
        <div class="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div
        v-for="cat in categorias"
        :key="cat.nombre"
        class="flex flex-col items-center text-center group"
      >
        <router-link :to="{ path: '/shop', query: { categoria: cat.nombre } }" class="block">
          <div class="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 group-hover:border-brand transition-all duration-300 shadow">
            <img
              :src="cat.imagen"
              :alt="cat.label"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </router-link>

        <h3 class="mt-4 font-semibold text-lg text-gray-800">{{ cat.label }}</h3>

        <router-link
          :to="{ path: '/shop', query: { categoria: cat.nombre } }"
          class="btn-primary mt-3 text-sm px-6 py-2"
        >
          Ver categoría
        </router-link>
      </div>
    </div>
  </section>

  <!-- Productos Destacados -->
  <section class="bg-gray-50 py-14">
    <div class="max-w-7xl mx-auto px-4">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-800">Productos Destacados</h2>
        <p class="text-gray-500 mt-2 max-w-lg mx-auto">
          Lo mejor de nuestra última colección, seleccionado especialmente para vos.
        </p>
      </div>

      <!-- Skeleton -->
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

  <!-- Por qué elegirnos -->
  <section class="max-w-7xl mx-auto px-4 py-14">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center max-w-3xl mx-auto place-items-center">
      <div
        v-for="item in [
          { icon: 'fa-truck',   title: 'Envío gratis ',  sub: 'En compras mayores a $5000' },
          { icon: 'fa-headset', title: 'Soporte 24/7',  sub: 'Siempre disponibles para ayudarte' },
        ]"
        :key="item.title"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center">
            <i :class="['fa', item.icon, 'text-brand text-xl']" />
          </div>
          <h4 class="font-semibold text-gray-800">{{ item.title }}</h4>
          <p class="text-xs text-gray-500">{{ item.sub }}</p>
        </div>
      </div>
    </div>
  </section>
</template>