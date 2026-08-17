<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import HeaderBar from './HeaderBar.vue'

const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="admin-shell">
    <AppSidebar :open="mobileMenuOpen" @close="mobileMenuOpen = false" />
    <div class="admin-content">
      <HeaderBar @toggle-menu="mobileMenuOpen = !mobileMenuOpen" />
      <main class="page-container">
        <RouterView />
      </main>
    </div>
  </div>
</template>

