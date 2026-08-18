import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const RADIUS_KEY = 'vue-admin-radius'

function readRadius() {
  const value = localStorage.getItem(RADIUS_KEY)
  const legacyValues: Record<string, number> = { compact: 6, default: 12, soft: 18 }
  const parsed = value && value in legacyValues ? legacyValues[value] : Number(value)
  return Number.isFinite(parsed) ? Math.min(24, Math.max(2, parsed)) : 12
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('vue-admin-theme') === 'dark')
  const radius = ref(readRadius())

  watch([isDark, radius], ([darkValue, radiusValue]) => {
    document.documentElement.classList.toggle('dark', darkValue)
    document.documentElement.dataset.radius = String(radiusValue)
    document.documentElement.style.setProperty('--radius', `${radiusValue}px`)

    localStorage.setItem('vue-admin-theme', darkValue ? 'dark' : 'light')
    localStorage.setItem(RADIUS_KEY, String(radiusValue))
  }, { immediate: true, deep: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean) {
    isDark.value = value
  }

  function setRadius(value: number) {
    radius.value = Math.min(24, Math.max(2, value))
  }

  return {
    isDark,
    radius,
    toggle,
    setDark,
    setRadius,
  }
})
