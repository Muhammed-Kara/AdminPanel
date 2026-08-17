<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LayoutDashboard, Users, Package, ShoppingCart, Settings, Sparkles, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  { label: t('nav.dashboard'), to: '/', icon: LayoutDashboard },
  { label: t('nav.users'), to: '/users', icon: Users },
  { label: t('nav.products'), to: '/products', icon: Package },
  { label: t('nav.orders'), to: '/orders', icon: ShoppingCart },
])
</script>

<template>
  <div v-if="open" class="sidebar-backdrop" @click="emit('close')" />
  <aside class="sidebar" :class="{ 'sidebar-open': open }">
    <div class="sidebar-brand">
      <div class="brand-icon"><Sparkles :size="19" /></div>
      <div><strong>{{ t('brand') }}</strong><span>{{ t('nav.enterprise') }}</span></div>
      <Button class="mobile-close" variant="ghost" size="icon" :aria-label="t('common.closeMenu')" @click="emit('close')"><X :size="19" /></Button>
    </div>

    <nav class="sidebar-nav">
      <p class="nav-section">{{ t('nav.workspace') }}</p>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: route.path === item.to }"
        @click="emit('close')"
      >
        <component :is="item.icon" :size="18" />
        <span>{{ item.label }}</span>
      </RouterLink>
      <p class="nav-section management">{{ t('nav.management') }}</p>
      <RouterLink to="/settings" class="nav-link" :class="{ active: route.path === '/settings' }" @click="emit('close')">
        <Settings :size="18" /><span>{{ t('nav.settings') }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="storage-label"><span>{{ t('nav.storage') }}</span><span>68%</span></div>
      <div class="storage-track"><span /></div>
      <p>6.8 GB / 10 GB</p>
    </div>
  </aside>
</template>
