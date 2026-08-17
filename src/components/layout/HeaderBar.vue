<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Menu, Moon, Search, Sun, LogOut } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

defineEmits<{ 'toggle-menu': [] }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const { t } = useI18n()
const pageName = computed(() => t(`nav.${String(route.name ?? 'dashboard')}`))

function logout() {
  auth.logout()
  void router.push('/login')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <Button class="menu-button" variant="ghost" size="icon" :aria-label="t('common.menu')" @click="$emit('toggle-menu')"><Menu :size="20" /></Button>
      <div class="breadcrumb"><span>{{ t('nav.overview') }}</span><b>/</b><strong>{{ pageName }}</strong></div>
    </div>
    <div class="topbar-actions">
      <label class="header-search"><Search :size="16" /><Input :placeholder="t('common.search')" /></label>
      <Button variant="ghost" size="icon" :aria-label="t('common.toggleTheme')" @click="theme.toggle()">
        <Sun v-if="theme.isDark" :size="18" /><Moon v-else :size="18" />
      </Button>
      <Button class="notification" variant="ghost" size="icon" :aria-label="t('common.notifications')"><Bell :size="18" /><i /></Button>
      <div class="profile">
        <div class="avatar">{{ auth.user?.name?.slice(0, 2).toUpperCase() }}</div>
        <div class="profile-copy"><strong>{{ auth.user?.name }}</strong><span>{{ auth.user?.role }}</span></div>
        <Button class="logout" variant="ghost" size="icon" :title="t('common.logout')" @click="logout"><LogOut :size="17" /></Button>
      </div>
    </div>
  </header>
</template>
