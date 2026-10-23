<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import Logo from '@/components/Logo.vue'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const mobileOpen = ref(false)

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

function closeAll() {
  mobileOpen.value = false
}

watch(mobileOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <nav class="bg-white shadow sticky top-0 z-50">
    <div class="w-full px-0">
      <div class="flex items-center justify-between min-h-20 py-2">

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
          <!-- Cart -->
          <router-link
            to="/cart"
            class="relative p-2 rounded hover:bg-gray-100 transition"
            aria-label="Cart"
            @click="closeAll"
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

    </div>

    <!-- Capa que bloquea el contenido mientras el menú está abierto -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/50 md:hidden"
      aria-hidden="true"
      @click="closeAll"
    />

    <!-- Mobile menu -->
    <transition name="slide-left">
      <aside v-if="mobileOpen" class="fixed inset-y-0 right-0 z-[60] flex w-[88vw] max-w-sm flex-col bg-white shadow-2xl md:hidden">
        <div class="flex items-center justify-between border-b border-sky-100 px-5 py-4">
          <Logo />
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-gray-600 transition hover:bg-sky-100"
            aria-label="Cerrar menú"
            @click="closeAll"
          >
            <i class="fa fa-xmark text-lg" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-5">
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-sky-600">Navegación</p>
          <ul class="flex flex-col gap-1">
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
            <button
              class="mt-3 w-full border-t border-gray-100 px-3 pt-5 text-left text-sm font-medium text-red-500 transition hover:text-red-600"
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
        </div>

        <router-link to="/cart" class="mx-5 mb-5 flex items-center justify-between rounded-lg bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700" @click="closeAll">
          <span><i class="fa fa-cart-shopping mr-2" /> Ver carrito</span>
          <span v-if="cart.totalItems" class="rounded-full bg-brand px-2 py-0.5 text-xs text-white">{{ cart.totalItems }}</span>
        </router-link>
      </aside>
    </transition>
  </nav>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}
</style>
