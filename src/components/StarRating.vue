<script setup lang="ts">
defineProps<{
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span :class="['inline-flex gap-0.5', size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm']">
    <i
      v-for="n in (max ?? 5)"
      :key="n"
      :class="[
        'fa fa-star',
        n <= rating ? 'text-yellow-400' : 'text-gray-300',
      ]"
    />
  </span>
</template>
