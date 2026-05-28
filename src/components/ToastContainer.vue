<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const icons: Record<string, string> = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
}
const colors: Record<string, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-yellow-500',
  info: 'bg-blue-600',
}
</script>

<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['flex items-center gap-3 px-4 py-3 rounded shadow-lg text-white text-sm', colors[t.type]]"
        >
          <i :class="['fa', icons[t.type]]" />
          <span class="flex-1">{{ t.message }}</span>
          <button class="opacity-70 hover:opacity-100 ml-2" @click="dismiss(t.id)">
            <i class="fa fa-xmark" />
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}
</style>
