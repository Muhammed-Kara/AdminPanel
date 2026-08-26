<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, type Component } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  CheckCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Palette,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sun,
  Trash2,
  User,
  Users,
  X
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { Button } from '@/components/ui/button'
import { dummyService } from '@/service/dummy/dummy-service'

defineEmits<{ 'toggle-menu': [] }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const { t, locale } = useI18n()
const queryClient = useQueryClient()
const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: dummyService.getUsers })
const { data: productsData } = useQuery({ queryKey: ['products'], queryFn: dummyService.getProducts })
const { data: ordersData } = useQuery({ queryKey: ['orders'], queryFn: dummyService.getOrders })
const { data: notificationsData } = useQuery({ queryKey: ['notifications'], queryFn: dummyService.getNotifications })

const pageName = computed(() => {
  if (route.name === 'dashboard' || !route.name) return t('nav.dashboard')
  return t(`nav.${String(route.name)}`)
})

const userInitials = computed(() => {
  const name = auth.user?.name || t('roles.admin')
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// Search State & Functionality
const searchQuery = ref('')
const isSearchOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  category: 'pages' | 'orders' | 'products' | 'users'
  path: string
  icon: Component
}

const searchablePages = computed<SearchResultItem[]>(() => [
  { id: 'page-dashboard', title: t('nav.dashboard'), category: 'pages', path: '/', icon: LayoutDashboard },
  { id: 'page-users', title: t('nav.users'), category: 'pages', path: '/users', icon: Users },
  { id: 'page-products', title: t('nav.products'), category: 'pages', path: '/products', icon: Package },
  { id: 'page-orders', title: t('nav.orders'), category: 'pages', path: '/orders', icon: ShoppingCart },
  { id: 'page-settings', title: t('nav.settings'), category: 'pages', path: '/settings', icon: Settings },
])

function formatCurrency(value: number) {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD' }).format(value)
}
const searchableItems = computed<SearchResultItem[]>(() => [
  ...(ordersData.value ?? []).slice(0, 4).map((order) => ({
    id: `order-${order.id}`,
    title: `${order.id} - ${order.customer}`,
    subtitle: `${formatCurrency(order.total)} • ${t(`status.${order.status}`)}`,
    category: 'orders' as const,
    path: '/orders',
    icon: ShoppingBag,
  })),
  ...(productsData.value ?? []).slice(0, 4).map((product) => ({
    id: `product-${product.id}`,
    title: product.name,
    subtitle: `${t('products.stock')}: ${product.stock} • ${formatCurrency(product.price)}`,
    category: 'products' as const,
    path: '/products',
    icon: Package,
  })),
  ...(usersData.value ?? []).slice(0, 4).map((user) => ({
    id: `user-${user.id}`,
    title: user.name,
    subtitle: `${user.email} • ${t(`roles.${user.role}`)}`,
    category: 'users' as const,
    path: '/users',
    icon: User,
  })),
])

const filteredSearchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return searchablePages.value
  }

  const results: SearchResultItem[] = []
  
  searchablePages.value.forEach(p => {
    if (p.title.toLowerCase().includes(query)) {
      results.push(p)
    }
  })

  searchableItems.value.forEach(item => {
    if (
      item.title.toLowerCase().includes(query) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query))
    ) {
      results.push(item)
    }
  })

  return results
})

function navigateTo(path: string) {
  router.push(path)
  isSearchOpen.value = false
  isNotificationOpen.value = false
  isProfileOpen.value = false
  searchQuery.value = ''
}

function focusSearch() {
  isSearchOpen.value = true
  searchInputRef.value?.focus()
}

const isNotificationOpen = ref(false)
const notifications = computed(() => notificationsData.value ?? [])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function toggleNotifications() {
  isNotificationOpen.value = !isNotificationOpen.value
  isSearchOpen.value = false
  isProfileOpen.value = false
}

function markAllAsRead() {
  notificationMutation.mutate({ type: 'mark-all' })
}

function toggleRead(id: number) {
  notificationMutation.mutate({ type: 'toggle', id })
}

function clearAllNotifications() {
  notificationMutation.mutate({ type: 'clear' })
}

const notificationMutation = useMutation({
  mutationFn: async (action: { type: 'mark-all' | 'clear' } | { type: 'toggle'; id: number }) => {
    if (action.type === 'mark-all') await dummyService.markAllNotificationsRead()
    if (action.type === 'toggle') await dummyService.toggleNotification(action.id)
    if (action.type === 'clear') await dummyService.clearNotifications()
  },
  onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
})

// Profile Dropdown State
const isProfileOpen = ref(false)

function toggleProfile() {
  isProfileOpen.value = !isProfileOpen.value
  isSearchOpen.value = false
  isNotificationOpen.value = false
}

function handleLogout() {
  auth.logout()
  router.push('/login')
  isProfileOpen.value = false
}

// Global click outside listener
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.header-search-box')) {
    isSearchOpen.value = false
  }
  if (!target.closest('.notification-box')) {
    isNotificationOpen.value = false
  }
  if (!target.closest('.profile-header-container')) {
    isProfileOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <Button class="menu-button" variant="ghost" size="icon" :aria-label="t('common.menu')" @click="$emit('toggle-menu')"><Menu :size="20" /></Button>
      <h1 class="header-page-title">{{ pageName }}</h1>
    </div>
    <div class="topbar-actions">
      <!-- Interactive Search Input & Dropdown -->
      <div class="header-search-box">
        <div class="header-search-input-wrapper" :class="{ active: isSearchOpen }">
          <Search :size="16" class="search-icon" @click="focusSearch" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="header-search-input"
            :placeholder="t('common.search')"
            @focus="isSearchOpen = true"
          />
          <button v-if="searchQuery" class="clear-search-btn" type="button" @click="searchQuery = ''">
            <X :size="14" />
          </button>
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="isSearchOpen" class="header-search-dropdown">
          <div v-if="filteredSearchResults.length === 0" class="search-empty-state">
            <span>{{ t('common.noResults') }}</span>
          </div>
          <div v-else class="search-results-list">
            <div
              v-for="item in filteredSearchResults"
              :key="item.id"
              class="search-result-item"
              @click="navigateTo(item.path)"
            >
              <div class="result-icon-box">
                <component :is="item.icon" :size="16" />
              </div>
              <div class="result-info">
                <span class="result-title">{{ item.title }}</span>
                <small v-if="item.subtitle" class="result-subtitle">{{ item.subtitle }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Toggle -->
      <Button variant="ghost" size="icon" :aria-label="t('common.toggleTheme')" @click="theme.toggle()">
        <Sun v-if="theme.isDark" :size="18" /><Moon v-else :size="18" />
      </Button>

      <!-- Interactive Notifications Dropdown -->
      <div class="notification-box">
        <Button class="notification" variant="ghost" size="icon" :aria-label="t('common.notifications')" @click="toggleNotifications">
          <Bell :size="18" />
          <i v-if="unreadCount > 0" />
        </Button>

        <div v-if="isNotificationOpen" class="notification-dropdown">
          <div class="notification-header">
            <div class="notification-title-box">
              <strong>{{ t('common.notifications') }}</strong>
              <span v-if="unreadCount > 0" class="unread-badge">{{ t('notifications.unread', { count: unreadCount }) }}</span>
            </div>
            <button
              v-if="unreadCount > 0"
              type="button"
              class="mark-read-btn"
              @click="markAllAsRead"
            >
              <CheckCheck :size="14" />
              <span>{{ t('notifications.markAllRead') }}</span>
            </button>
          </div>

          <div v-if="notifications.length === 0" class="notification-empty">
            <span>{{ t('notifications.empty') }}</span>
          </div>

          <div v-else class="notification-list">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="notification-item"
              :class="{ unread: !notif.read }"
              @click="toggleRead(notif.id)"
            >
              <div class="notif-status-dot" v-if="!notif.read" />
              <div class="notif-content">
                <strong class="notif-title">{{ t(notif.titleKey) }}</strong>
                <p class="notif-desc">{{ t(notif.descriptionKey, notif.params) }}</p>
                <span class="notif-time">{{ t(notif.timeKey, notif.timeParams) }}</span>
              </div>
            </div>
          </div>

          <div v-if="notifications.length > 0" class="notification-footer">
            <button type="button" class="clear-all-btn" @click="clearAllNotifications">
              <Trash2 :size="13" />
              <span>{{ t('notifications.clearAll') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Header & Dropdown -->
      <div class="profile-header-container">
        <div class="profile-header-box" @click="toggleProfile">
          <div class="avatar-circle">
            <img v-if="auth.user?.avatar" :src="auth.user.avatar" class="avatar-circle-img" alt="Avatar" />
            <span v-else class="avatar-initials">{{ userInitials }}</span>
          </div>
          <span class="user-name-text">{{ auth.user?.name || t('roles.admin') }}</span>
          <ChevronDown :size="14" class="dropdown-icon" :class="{ open: isProfileOpen }" />
        </div>

        <div v-if="isProfileOpen" class="profile-dropdown">
          <div class="profile-dropdown-user">
            <strong>{{ auth.user?.name || t('roles.admin') }}</strong>
            <span>{{ auth.user?.email || '' }}</span>
          </div>
          <div class="profile-dropdown-divider" />
          <button type="button" class="profile-dropdown-item" @click="navigateTo('/settings?tab=profile')">
            <User :size="15" />
            <span>{{ t('settings.profileTab') }}</span>
          </button>
          <button type="button" class="profile-dropdown-item" @click="navigateTo('/settings?tab=appearance')">
            <Palette :size="15" />
            <span>{{ t('settings.themeTab') }}</span>
          </button>
          <div class="profile-dropdown-divider" />
          <button type="button" class="profile-dropdown-item danger" @click="handleLogout">
            <LogOut :size="15" />
            <span>{{ t('common.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
