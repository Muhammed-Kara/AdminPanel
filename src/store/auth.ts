import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthUser } from '@/types'

const STORAGE_KEY = 'vue-admin-auth'

function readSession(): { user: AuthUser; token: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = readSession()
  const user = ref<AuthUser | null>(session?.user ?? { id: '1', name: 'Admin', email: 'admin@example.com', role: 'Yönetici' })
  const token = ref<string | null>(session?.token ?? 'demo-token')
  const isAuthenticated = computed(() => Boolean(user.value && token.value))

  function setSession(nextUser: AuthUser, nextToken: string) {
    user.value = nextUser
    token.value = nextToken
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }))
  }

  function updateUser(updated: Partial<AuthUser>) {
    if (!user.value) {
      user.value = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'Yönetici' }
    }
    user.value = { ...user.value, ...updated }
    if (!token.value) token.value = 'demo-token'
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: user.value, token: token.value }))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { user, token, isAuthenticated, setSession, updateUser, logout }
})

