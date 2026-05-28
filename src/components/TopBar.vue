<script setup lang="ts">
// TopBar — visible on lg+ screens, matches original Zay template
</script>

<template>
  <div class="hidden lg:block bg-gray-900 text-gray-300 text-sm">
    <div class="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
      <!-- Contact -->
      <div class="flex items-center gap-4">
        <a href="mailto:info@zayshop.com" class="flex items-center gap-1.5 hover:text-white transition">
          <i class="fa fa-envelope text-xs" />
          info@zayshop.com
        </a>
        <a href="tel:010-020-0340" class="flex items-center gap-1.5 hover:text-white transition">
          <i class="fa fa-phone text-xs" />
          010-020-0340
        </a>
      </div>
      <!-- Social -->
      <div class="flex items-center gap-3">
        <a href="#" target="_blank" class="hover:text-white transition" aria-label="Facebook">
          <i class="fab fa-facebook-f text-xs" />
        </a>
        <a href="#" target="_blank" class="hover:text-white transition" aria-label="Instagram">
          <i class="fab fa-instagram text-xs" />
        </a>
        <a href="#" target="_blank" class="hover:text-white transition" aria-label="Twitter">
          <i class="fab fa-twitter text-xs" />
        </a>
        <a href="#" target="_blank" class="hover:text-white transition" aria-label="LinkedIn">
          <i class="fab fa-linkedin-in text-xs" />
        </a>
      </div>
    </div>
  </div>
</template>
