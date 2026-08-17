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
  const user = ref<AuthUser | null>(session?.user ?? null)
  const token = ref<string | null>(session?.token ?? null)
  const isAuthenticated = computed(() => Boolean(user.value && token.value))

  function setSession(nextUser: AuthUser, nextToken: string) {
    user.value = nextUser
    token.value = nextToken
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { user, token, isAuthenticated, setSession, logout }
})

