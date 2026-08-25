import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('vue-admin-theme') === 'dark')
  const radius = ref(2)

  watch([isDark, radius], ([darkValue, radiusValue]) => {
    document.documentElement.classList.toggle('dark', darkValue)
    document.documentElement.dataset.radius = String(radiusValue)
    document.documentElement.style.setProperty('--radius', `${radiusValue}px`)

    localStorage.setItem('vue-admin-theme', darkValue ? 'dark' : 'light')
  }, { immediate: true, deep: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean) {
    isDark.value = value
  }

  function setRadius(value: number) {
    radius.value = value
  }

  return {
    isDark,
    radius,
    toggle,
    setDark,
    setRadius,
  }
})
