<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// ─── Form state ───────────────────────────────────────────────────────────────
const name             = ref('')
const email            = ref('')
const password         = ref('')
const confirm          = ref('')
// const role             = ref<'customer' | 'admin'>('customer')
const showPassword     = ref(false)
const showConfirm      = ref(false)

// ─── Validation ───────────────────────────────────────────────────────────────
const errors  = ref({ name: '', email: '', password: '', confirm: '', api: '' })
const success  = ref('')

function validate() {
  errors.value = { name: '', email: '', password: '', confirm: '', api: '' }
  let valid = true
  if (!name.value.trim()) {
    errors.value.name = 'El nombre es requerido'
    valid = false
  }
  if (!email.value) {
    errors.value.email = 'El email es requerido'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Email inválido'
    valid = false
  }
  if (!password.value || password.value.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres'
    valid = false
  }
  if (password.value !== confirm.value) {
    errors.value.confirm = 'Las contraseñas no coinciden'
    valid = false
  }
  return valid
}

// ─── Actions ──────────────────────────────────────────────────────────────────
async function handleCreate() {
  if (!validate()) return
  success.value = ''
  try {
    await auth.register(name.value, email.value, password.value)
    success.value = `Usuario "${name.value}" creado correctamente.`
    // Limpiar form para crear otro si se necesita
    name.value = email.value = password.value = confirm.value = ''
    // role.value = 'customer'
  } catch (e: unknown) {
    errors.value.api = e instanceof Error ? e.message : 'Error al crear el usuario'
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto py-10 px-4">

    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <button class="hover:text-brand transition-colors" @click="router.push({ name: 'admin-products' })">
        Admin
      </button>
      <i class="fa fa-chevron-right text-xs" />
      <span class="text-gray-900 font-medium">Nuevo Usuario</span>
    </div>

    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">

      <!-- Header -->
      <div class="px-8 pt-8 pb-2">
        <h1 class="text-xl font-bold text-gray-900">Crear usuario</h1>
        <p class="text-sm text-gray-500 mt-1">Solo los administradores pueden registrar nuevas cuentas.</p>
      </div>

      <!-- Form -->
      <form class="p-8 space-y-5" @submit.prevent="handleCreate">

        <!-- Success -->
        <div
          v-if="success"
          class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2"
        >
          <i class="fa fa-circle-check" /> {{ success }}
        </div>

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            v-model="name"
            type="text"
            autocomplete="off"
            placeholder="Juan Pérez"
            class="input w-full"
            :class="{ 'border-red-400 focus:ring-red-300': errors.name }"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="off"
            placeholder="usuario@email.com"
            class="input w-full"
            :class="{ 'border-red-400 focus:ring-red-300': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
        </div>

        <!-- Rol -->
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select v-model="role" class="input w-full">
            <option value="customer">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </div> -->

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Mínimo 6 caracteres"
              class="input w-full pr-10"
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

        <!-- Confirm password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <div class="relative">
            <input
              v-model="confirm"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Repetí la contraseña"
              class="input w-full pr-10"
              :class="{ 'border-red-400 focus:ring-red-300': errors.confirm }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showConfirm = !showConfirm"
            >
              <i :class="showConfirm ? 'fa fa-eye-slash' : 'fa fa-eye'" />
            </button>
          </div>
          <p v-if="errors.confirm" class="mt-1 text-xs text-red-500">{{ errors.confirm }}</p>
        </div>

        <!-- API error -->
        <div
          v-if="errors.api"
          class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600"
        >
          <i class="fa fa-circle-exclamation mr-1" /> {{ errors.api }}
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-1">
          <button
            type="button"
            class="btn-secondary flex-1 py-3"
            @click="router.push({ name: 'admin-products' })"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            :disabled="auth.loading"
          >
            <span
              v-if="auth.loading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            {{ auth.loading ? 'Creando...' : 'Crear Usuario' }}
          </button>
        </div>

      </form>
    </div>

  </div>
</template>