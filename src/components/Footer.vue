<script setup lang="ts">
const productLinks = [
  { label: 'Pañales', query: { category: 'Panales' } },
  { label: 'Higiene', query: { category: 'Higiene' } },
  { label: 'Accesorios', query: { category: 'Accesorios' } },
]
</script>

<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="max-w-7xl mx-auto px-4 pt-12 pb-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">

        <!-- Marca -->
        <div>
          <h2 class="text-brand text-xl font-bold border-b border-gray-600 pb-3 mb-4">
            Panalera Gianluca
          </h2>

          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <i class="fa fa-map-marker-alt mt-0.5 w-4 shrink-0" />
              <span>Elio Medrano 2210</span>
            </li>

            <li>
              <a
                href="tel:+5492975011424"
                class="flex items-center gap-2 hover:text-white transition"
              >
                <i class="fa fa-phone w-4" />
                +54 9 2975011424
              </a>
            </li>
            <!--
            <li>
              <a
                href="mailto:elvissscabj1223@gmail.com"
                class="flex items-center gap-2 hover:text-white transition"
              >
                <i class="fa fa-envelope w-4" />
                elvissscabj1223@gmail.com
              </a>
            </li>  -->
          </ul>
        </div>

        <!-- Productos -->
        <div>
          <h3 class="text-white text-lg font-semibold border-b border-gray-600 pb-3 mb-4">
            Productos
          </h3>

          <ul class="space-y-2 text-sm">
            <li
              v-for="item in productLinks"
              :key="item.label"
            >
              <router-link
                :to="{ path: '/shop', query: item.query }"
                class="hover:text-white transition"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Información -->
        <div>
          <h3 class="text-white text-lg font-semibold border-b border-gray-600 pb-3 mb-4">
            Información
          </h3>

          <ul class="space-y-2 text-sm">
            <li
              v-for="link in [
                { label: 'Inicio', to: '/' },
                { label: 'Nosotros', to: '/about' },
                { label: 'Tienda', to: '/shop' },
                { label: 'Contacto', to: '/contact' }
              ]"
              :key="link.to"
            >
              <router-link
                :to="link.to"
                class="hover:text-white transition"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <hr class="border-gray-700 my-8" />

      <!-- Bottom row -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">

        <!-- Redes sociales -->
        <ul class="flex items-center gap-3">
          <li
            v-for="{ icon, href } in [
              { icon: 'fab fa-facebook-f', href: 'https://www.facebook.com/share/1BNxtcDYRF/' },
            //{ icon: 'fab fa-instagram', href: 'https://www.instagram.com/' },
            //{ icon: 'fab fa-tiktok', href: 'https://www.tiktok.com/' },
]"
            :key="icon"
          >
            <a
              :href="href"
              target="_blank"
              class="border border-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:border-white hover:text-white transition"
            >
              <i :class="[icon, 'text-xs']" />
            </a>
          </li>
        </ul>

        <!-- Suscripción -->
        <!-- <div class="flex items-center gap-2">
          <input
            v-model="email"
            type="email"
            placeholder="Tu correo electrónico"
            class="bg-gray-800 border border-gray-600 text-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-brand"
            @keyup.enter="subscribe"
          />

          <button
            class="bg-brand hover:bg-brand-700 text-white text-sm px-4 py-1.5 rounded transition"
            @click="subscribe"
          >
            {{ subscribed ? '✓ ¡Listo!' : 'Suscribirse' }}
          </button>
        </div> -->
      </div>
    </div>

    <!-- Copyright -->
    <div class="bg-black py-3 text-center text-xs text-gray-500">
      &copy; {{ new Date().getFullYear() }} Panalera Gianluca. Todos los derechos reservados.
    </div>
  </footer>
</template>
