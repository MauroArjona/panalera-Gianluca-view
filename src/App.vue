<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
// import TopBar from '@/components/TopBar.vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const auth = useAuthStore()
onMounted(() => auth.fetchMe())
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- <TopBar /> -->
    <Navbar />

    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <Footer />
    <ToastContainer />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
