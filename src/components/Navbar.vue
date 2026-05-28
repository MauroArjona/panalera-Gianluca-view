<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/Logo.vue'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const mobileOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

const navLinks = computed(() => [
  { label: 'Inicio', to: '/' },
  { label: 'Tienda', to: '/shop' },
  { label: 'Nosotros', to: '/about' },
  { label: 'Contacto', to: '/contact' },
  ...(auth.isAuthenticated ? [{ label: 'Gestión Productos', to: '/admin/products' },{ label: 'Registrar Usuario', to: '/admin/users' }] : []),
])

const isActive = computed(() => (path: string) => {
  if (path === '/') return router.currentRoute.value.path === '/'
  return router.currentRoute.value.path.startsWith(path)
})

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return

  // ✅ FIX: query limpia — no arrastrar categoria/subcategoria previas de /shop
  router.push({ path: '/shop', query: { search: q } })

  searchQuery.value = ''
  searchOpen.value = false
  mobileOpen.value = false
}

function closeAll() {
  mobileOpen.value = false
  searchOpen.value = false
}
</script>

<template>
  <nav class="bg-white shadow sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-brand" @click="closeAll">
          <Logo />
        </router-link>

        <!-- Desktop nav links -->
        <ul class="hidden md:flex items-center gap-6">
          <li v-for="link in navLinks" :key="link.to">
            <router-link
              :to="link.to"
              :class="[
                'text-sm font-medium transition hover:text-brand',
                isActive(link.to) ? 'text-brand border-b-2 border-brand pb-0.5' : 'text-gray-700',
              ]"
            >
              {{ link.label }}
            </router-link>
          </li>
        </ul>

        <!-- Right icons -->
        <div class="flex items-center gap-2">
          <!-- Search toggle -->
          <button
            class="p-2 rounded hover:bg-gray-100 transition"
            aria-label="Search"
            @click="searchOpen = !searchOpen"
          >
            <i class="fa fa-search text-gray-700" />
          </button>

          <!-- Cart -->
          <router-link
            to="/cart"
            class="relative p-2 rounded hover:bg-gray-100 transition"
            aria-label="Cart"
          >
            <i class="fa fa-cart-arrow-down text-gray-700" />
            <span
              v-if="cart.totalItems > 0"
              class="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
            >
              {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
            </span>
          </router-link>

          <!-- User -->
          <template v-if="auth.isAuthenticated">
            <div class="hidden sm:flex items-center gap-1">
              <router-link
                to="#"
                class="flex items-center gap-1.5 text-sm font-medium text-brand hover:opacity-75 transition px-1"
              >
                <i class="fa fa-user-circle text-lg" />
                <span class="hidden lg:inline max-w-[90px] truncate">{{ auth.userName }}</span>
              </router-link>
              <button
                class="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                title="Cerrar sesión"
                @click="auth.logout(); $router.push('/')"
              >
                <i class="fa fa-arrow-right-from-bracket text-sm" />
              </button>
            </div>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand transition"
            >
              <i class="fa fa-user" />
              <span class="hidden lg:inline">Iniciar Sesión</span>
            </router-link>
          </template>

          <!-- Mobile menu toggle -->
          <button
            class="md:hidden p-2 rounded hover:bg-gray-100 transition"
            aria-label="Menu"
            @click="mobileOpen = !mobileOpen"
          >
            <i :class="['fa', mobileOpen ? 'fa-xmark' : 'fa-bars', 'text-gray-700']" />
          </button>
        </div>
      </div>

      <!-- Search bar (animated) -->
      <transition name="slide-down">
        <div v-if="searchOpen" class="pb-3">
          <div class="flex gap-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="input flex-1"
              autofocus
              @keyup.enter="handleSearch"
            />
            <button class="btn-primary" @click="handleSearch">
              <i class="fa fa-search" />
            </button>
            <button class="btn-ghost" @click="searchOpen = false">
              <i class="fa fa-xmark" />
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Mobile menu -->
    <transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
        <ul class="flex flex-col gap-1 pt-2">
          <li v-for="link in navLinks" :key="link.to">
            <router-link
              :to="link.to"
              :class="[
                'block px-3 py-2 rounded text-sm font-medium transition',
                isActive(link.to) ? 'bg-brand/10 text-brand' : 'text-gray-700 hover:bg-gray-50',
              ]"
              @click="mobileOpen = false"
            >
              {{ link.label }}
            </router-link>
          </li>
          <li v-if="auth.isAuthenticated">
            <!-- <router-link
              to="/orders"
              class="block px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="mobileOpen = false"
            >
              <i class="fa fa-box mr-2 text-brand" />Mis Pedidos
            </router-link> -->
          </li>
          <li v-if="auth.isAuthenticated">
            <button
              class="w-full text-left px-3 py-2 rounded text-sm font-medium text-red-500 hover:bg-red-50 transition"
              @click="auth.logout(); mobileOpen = false; $router.push('/')"
            >
              <i class="fa fa-arrow-right-from-bracket mr-2" />Cerrar sesión
            </button>
          </li>
          <li v-else>
            <router-link
              to="/login"
              class="block px-3 py-2 rounded text-sm font-medium text-brand hover:bg-brand/10"
              @click="mobileOpen = false"
            >
              <i class="fa fa-user mr-2" />Iniciar Sesión
            </router-link>
          </li>
        </ul>

        <!-- Mobile search -->
        <div class="mt-3 flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="input flex-1 text-sm"
            @keyup.enter="handleSearch(); mobileOpen = false"
          />
          <button class="btn-primary px-3" @click="handleSearch(); mobileOpen = false">
            <i class="fa fa-search" />
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>