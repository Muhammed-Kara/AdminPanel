<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner'
import { useThemeStore } from '@/store/theme'

const theme = useThemeStore()
</script>

<template>
  <Sonner class="app-toaster" position="top-right" :theme="theme.isDark ? 'dark' : 'light'" :duration="3500" :visible-toasts="4" expand close-button />
</template>
