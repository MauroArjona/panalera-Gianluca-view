import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authApi } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? '')

  // ─── Actions ────────────────────────────────────────────────────────────────
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login(email, password)
      user.value = res.user
      token.value = res.token
      localStorage.setItem('auth_token', res.token)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.register(name, email, password)
      user.value = res.user
      token.value = res.token
      localStorage.setItem('auth_token', res.token)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout().catch(() => {})
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      user.value = await authApi.me()
    } catch {
      await logout()
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userName,
    login,
    register,
    logout,
    fetchMe,
    clearError,
  }
})
