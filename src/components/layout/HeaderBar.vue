<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
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

defineEmits<{ 'toggle-menu': [] }>()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const { t } = useI18n()

const pageName = computed(() => {
  if (route.name === 'dashboard' || !route.name) return t('nav.dashboard')
  return t(`nav.${String(route.name)}`)
})

const userInitials = computed(() => {
  const name = auth.user?.name || 'Admin'
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
  icon: any
}

const searchablePages: SearchResultItem[] = [
  { id: 'p1', title: 'Dashboard', category: 'pages', path: '/dashboard', icon: LayoutDashboard },
  { id: 'p2', title: 'Kullanıcılar / Users', category: 'pages', path: '/users', icon: Users },
  { id: 'p3', title: 'Ürünler / Products', category: 'pages', path: '/products', icon: Package },
  { id: 'p4', title: 'Siparişler / Orders', category: 'pages', path: '/orders', icon: ShoppingCart },
  { id: 'p5', title: 'Ayarlar / Settings', category: 'pages', path: '/settings', icon: Settings },
]

const searchableItems: SearchResultItem[] = [
  { id: 'o1', title: '#12578 - Ahmet Yılmaz', subtitle: '$120.00 • Teslim Edildi', category: 'orders', path: '/orders', icon: ShoppingBag },
  { id: 'o2', title: '#12577 - Ayşe Demir', subtitle: '$89.00 • Teslim Edildi', category: 'orders', path: '/orders', icon: ShoppingBag },
  { id: 'o3', title: '#12576 - Mehmet Kaya', subtitle: '$149.00 • Bekliyor', category: 'orders', path: '/orders', icon: ShoppingBag },
  { id: 'pr1', title: 'iPhone 15 Pro Max', subtitle: 'Stok: 42 • $1,199', category: 'products', path: '/products', icon: Package },
  { id: 'pr2', title: 'MacBook Pro M3 16"', subtitle: 'Stok: 18 • $2,499', category: 'products', path: '/products', icon: Package },
  { id: 'pr3', title: 'Wireless Noise Canceling Headphones', subtitle: 'Stok: 3 • $299', category: 'products', path: '/products', icon: Package },
  { id: 'u1', title: 'Ahmet Yılmaz', subtitle: 'ahmet@example.com • Yönetici', category: 'users', path: '/users', icon: User },
  { id: 'u2', title: 'Ayşe Demir', subtitle: 'ayse@example.com • Editör', category: 'users', path: '/users', icon: User },
]

const filteredSearchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return searchablePages
  }

  const results: SearchResultItem[] = []
  
  searchablePages.forEach(p => {
    if (p.title.toLowerCase().includes(query)) {
      results.push(p)
    }
  })

  searchableItems.forEach(item => {
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

// Notifications State & Functionality
const isNotificationOpen = ref(false)

interface NotificationItem {
  id: number
  title: string
  description: string
  time: string
  read: boolean
  type: 'order' | 'warning' | 'user' | 'system'
}

const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    title: 'Yeni Sipariş Alındı',
    description: '#12578 - Ahmet Yılmaz ($120.00)',
    time: '5 dk önce',
    read: false,
    type: 'order',
  },
  {
    id: 2,
    title: 'Stok Uyarısı',
    description: 'Wireless Headphones stoku 3 adede düştü.',
    time: '1 saat önce',
    read: false,
    type: 'warning',
  },
  {
    id: 3,
    title: 'Yeni Kullanıcı Kaydı',
    description: 'Ayşe Demir sisteme üye oldu.',
    time: '2 saat önce',
    read: false,
    type: 'user',
  },
  {
    id: 4,
    title: 'Sistem Güncellemesi',
    description: 'Admin Panel v2.4 güncellemesi tamamlandı.',
    time: '1 gün önce',
    read: true,
    type: 'system',
  },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function toggleNotifications() {
  isNotificationOpen.value = !isNotificationOpen.value
  isSearchOpen.value = false
  isProfileOpen.value = false
}

function markAllAsRead() {
  notifications.value.forEach(n => (n.read = true))
}

function toggleRead(id: number) {
  const item = notifications.value.find(n => n.id === id)
  if (item) {
    item.read = !item.read
  }
}

function clearAllNotifications() {
  notifications.value = []
}

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
            <span>{{ t('common.noResults') || 'Sonuç bulunamadı' }}</span>
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
              <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }} yeni</span>
            </div>
            <button
              v-if="unreadCount > 0"
              type="button"
              class="mark-read-btn"
              @click="markAllAsRead"
            >
              <CheckCheck :size="14" />
              <span>Tümünü Oku</span>
            </button>
          </div>

          <div v-if="notifications.length === 0" class="notification-empty">
            <span>Henüz bildirim yok.</span>
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
                <strong class="notif-title">{{ notif.title }}</strong>
                <p class="notif-desc">{{ notif.description }}</p>
                <span class="notif-time">{{ notif.time }}</span>
              </div>
            </div>
          </div>

          <div v-if="notifications.length > 0" class="notification-footer">
            <button type="button" class="clear-all-btn" @click="clearAllNotifications">
              <Trash2 :size="13" />
              <span>Tümünü Temizle</span>
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
          <span class="user-name-text">{{ auth.user?.name || 'Admin' }}</span>
          <ChevronDown :size="14" class="dropdown-icon" :class="{ open: isProfileOpen }" />
        </div>

        <div v-if="isProfileOpen" class="profile-dropdown">
          <div class="profile-dropdown-user">
            <strong>{{ auth.user?.name || 'Admin' }}</strong>
            <span>{{ auth.user?.email || 'admin@example.com' }}</span>
          </div>
          <div class="profile-dropdown-divider" />
          <button type="button" class="profile-dropdown-item" @click="navigateTo('/settings?tab=profile')">
            <User :size="15" />
            <span>Profil Ayarları</span>
          </button>
          <button type="button" class="profile-dropdown-item" @click="navigateTo('/settings?tab=appearance')">
            <Palette :size="15" />
            <span>Görünüm & Tema</span>
          </button>
          <div class="profile-dropdown-divider" />
          <button type="button" class="profile-dropdown-item danger" @click="handleLogout">
            <LogOut :size="15" />
            <span>{{ t('common.logout') || 'Çıkış Yap' }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
