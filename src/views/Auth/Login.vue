<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// ─── Form state ───────────────────────────────────────────────────────────────
const email        = ref('')
const password     = ref('')
const showPassword = ref(false)

// ─── Validation ───────────────────────────────────────────────────────────────
const errors = ref({ email: '', password: '', api: '' })

function validate() {
  errors.value = { email: '', password: '', api: '' }
  let valid = true
  if (!email.value) {
    errors.value.email = 'El email es requerido'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Email inválido'
    valid = false
  }
  if (!password.value) {
    errors.value.password = 'La contraseña es requerida'
    valid = false
  }
  return valid
}

// ─── Actions ──────────────────────────────────────────────────────────────────
async function handleLogin() {
  if (!validate()) return
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect as string | undefined
    router.push(redirect ?? '/')
  } catch (e: unknown) {
    errors.value.api = e instanceof Error ? e.message : 'Error al iniciar sesión'
  }
}

const isLoading = computed(() => auth.loading)
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md">

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">

        <!-- Header -->
        <div class="px-8 pt-8 pb-2 text-center">
          <h1 class="text-2xl font-bold text-gray-900">¡Bienvenido!</h1>
          <p class="text-sm text-gray-500 mt-1">Ingresá a tu cuenta para continuar</p>
        </div>

        <!-- Form -->
        <form class="p-8 space-y-5" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="tu@email.com"
              class="input w-full"
              :class="{ 'border-red-400 focus:ring-red-300': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="input password-input w-full pr-10"
                :class="{ 'border-red-400 focus:ring-red-300': errors.password }"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
          </div>

          <!-- API error -->
          <div
            v-if="errors.api"
            class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600"
          >
            <i class="fa fa-circle-exclamation mr-1" /> {{ errors.api }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>

        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.password-input::-ms-reveal,
.password-input::-ms-clear {
  display: none;
}
</style>
