import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('vue-admin-theme') === 'dark')

  watch(isDark, (value) => {
    document.documentElement.classList.toggle('dark', value)
    localStorage.setItem('vue-admin-theme', value ? 'dark' : 'light')
  }, { immediate: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
})
