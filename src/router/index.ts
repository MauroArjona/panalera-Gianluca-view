import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { title: 'Home' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Auth/Login.vue'),
      meta: { title: 'Iniciar Sesión', guestOnly: true },
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/views/Shop.vue'),
      meta: { title: 'Shop' },
    },
    {
      path: '/product/:slug',
      name: 'product-detail',
      component: () => import('@/views/ProductDetail.vue'),
      meta: { title: 'Product' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart.vue'),
      meta: { title: 'Cart' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/Checkout.vue'),
      meta: { title: 'Checkout', requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/Orders.vue'),
      meta: { title: 'My Orders', requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue'),
      meta: { title: 'About Us' },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/Contact.vue'),
      meta: { title: 'Contact' },
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: () => import('@/views/Admin/ProductsView.vue'),
      meta: { title: 'Admin – Productos', requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/Admin/UserCreate.vue'),
      meta: { title: 'Admin – Usuarios', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

// ─── Auth guard ───────────────────────────────────────────────────────────────
router.beforeEach((to) => {
  // Update document title
  document.title = `${to.meta.title ?? 'Page'} | Calzados CR`

  const auth = useAuthStore()

  // Redirigir al inicio si ya está autenticado e intenta ir a /login
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }

  // Redirigir a /login si requiere autenticación y no está logueado
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router