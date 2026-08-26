<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, ChevronDown, Menu, Moon, Search, Sun, User } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { Button } from '@/components/ui/button'

defineEmits<{ 'toggle-menu': [] }>()
const route = useRoute()
const auth = useAuthStore()
const theme = useThemeStore()
const { t } = useI18n()

const pageName = computed(() => {
  if (route.name === 'dashboard' || !route.name) return 'Dashboard'
  return t(`nav.${String(route.name)}`)
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <Button class="menu-button" variant="ghost" size="icon" :aria-label="t('common.menu')" @click="$emit('toggle-menu')"><Menu :size="20" /></Button>
      <h1 class="header-page-title">{{ pageName }}</h1>
    </div>
    <div class="topbar-actions">
      <Button variant="ghost" size="icon" aria-label="Search">
        <Search :size="18" />
      </Button>
      <Button variant="ghost" size="icon" :aria-label="t('common.toggleTheme')" @click="theme.toggle()">
        <Sun v-if="theme.isDark" :size="18" /><Moon v-else :size="18" />
      </Button>
      <Button class="notification" variant="ghost" size="icon" :aria-label="t('common.notifications')">
        <Bell :size="18" />
        <i />
      </Button>
      <div class="profile-header-box">
        <div class="avatar-circle">
          <User :size="16" />
        </div>
        <span class="user-name-text">{{ auth.user?.name || 'Admin' }}</span>
        <ChevronDown :size="14" class="dropdown-icon" />
      </div>
    </div>
  </header>
</template>
