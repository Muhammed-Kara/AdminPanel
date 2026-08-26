<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Mail,
  Settings,
  LogOut,
  Shield,
  X
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const navItems = computed(() => [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Products', to: '/products', icon: Package },
  { label: 'Orders', to: '/orders', icon: ShoppingCart },
  { label: 'Analytics', to: '/users', icon: TrendingUp },
  { label: 'Messages', to: '/orders', icon: Mail },
  { label: 'Settings', to: '/settings', icon: Settings },
])

function handleLogout() {
  auth.logout()
  void router.push('/login')
}
</script>

<template>
  <div v-if="open" class="sidebar-backdrop" @click="emit('close')" />
  <aside class="sidebar" :class="{ 'sidebar-open': open }">
    <div class="sidebar-brand">
      <div class="brand-icon"><Shield :size="20" /></div>
      <div><strong>Admin Panel</strong></div>
      <Button class="mobile-close" variant="ghost" size="icon" :aria-label="t('common.closeMenu')" @click="emit('close')"><X :size="19" /></Button>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
        @click="emit('close')"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </RouterLink>

      <button type="button" class="nav-link logout-nav-btn" @click="handleLogout">
        <LogOut :size="18" />
        <span>Logout</span>
      </button>
    </nav>
  </aside>
</template>
