import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type AccentColor = 'violet' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'orange' | 'rose' | 'slate'

const ACCENT_KEY = 'vue-admin-accent'
const RADIUS_KEY = 'vue-admin-radius'
const accentValues: AccentColor[] = ['violet', 'blue', 'cyan', 'emerald', 'amber', 'orange', 'rose', 'slate']

function readAccent(): AccentColor {
  const value = localStorage.getItem(ACCENT_KEY) as AccentColor | null
  return value && accentValues.includes(value) ? value : 'violet'
}

function readRadius() {
  const value = localStorage.getItem(RADIUS_KEY)
  const legacyValues: Record<string, number> = { compact: 6, default: 12, soft: 18 }
  const parsed = value && value in legacyValues ? legacyValues[value] : Number(value)
  return Number.isFinite(parsed) ? Math.min(24, Math.max(2, parsed)) : 12
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('vue-admin-theme') === 'dark')
  const accent = ref<AccentColor>(readAccent())
  const radius = ref(readRadius())

  watch([isDark, accent, radius], ([darkValue, accentValue, radiusValue]) => {
    document.documentElement.classList.toggle('dark', darkValue)
    document.documentElement.dataset.accent = accentValue
    document.documentElement.dataset.radius = String(radiusValue)
    document.documentElement.style.setProperty('--radius', `${radiusValue}px`)
    localStorage.setItem('vue-admin-theme', darkValue ? 'dark' : 'light')
    localStorage.setItem(ACCENT_KEY, accentValue)
    localStorage.setItem(RADIUS_KEY, String(radiusValue))
  }, { immediate: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean) {
    isDark.value = value
  }

  function setAccent(value: AccentColor) {
    accent.value = value
  }

  function setRadius(value: number) {
    radius.value = Math.min(24, Math.max(2, value))
  }

  return { isDark, accent, radius, toggle, setDark, setAccent, setRadius }
})
