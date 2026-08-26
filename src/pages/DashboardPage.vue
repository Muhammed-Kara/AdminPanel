<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Activity,
  Check,
  ChevronDown,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  Users
} from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/ui/PageHeader.vue'
import RevenueAreaChart from '@/components/ui/RevenueAreaChart.vue'

const router = useRouter()
const { t } = useI18n()

type PeriodKey = 'currentMonth' | 'last30Days' | 'last7Days' | 'thisYear'

const selectedPeriodKey = ref<PeriodKey>('currentMonth')
const isPeriodDropdownOpen = ref(false)

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: 'currentMonth', label: t('dashboard.currentMonth') || 'Bu Ay' },
  { key: 'last30Days', label: 'Son 30 Gün' },
  { key: 'last7Days', label: 'Son 7 Gün' },
  { key: 'thisYear', label: 'Bu Yıl' },
]

const selectedPeriodLabel = computed(() => {
  const opt = periodOptions.find((p) => p.key === selectedPeriodKey.value)
  return opt ? opt.label : t('dashboard.currentMonth')
})

function selectPeriod(key: PeriodKey) {
  selectedPeriodKey.value = key
  isPeriodDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.period-select-container')) {
    isPeriodDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const stats = computed(() => [
  { key: 'users', label: t('dashboard.totalUsers'), value: '12,540', change: '↑ 12.5%', icon: Users, color: 'purple' },
  { key: 'orders', label: t('dashboard.orders'), value: '8,320', change: '↑ 8.2%', icon: ShoppingCart, color: 'blue' },
  { key: 'revenue', label: t('dashboard.revenue'), value: '$24,820', change: '↑ 15.3%', icon: CreditCard, color: 'indigo' },
  { key: 'active', label: t('dashboard.activeUsers'), value: '1,320', change: '↑ 6.1%', icon: Activity, color: 'violet' },
])

const recentOrders = computed(() => [
  { id: '#12578', customer: 'Ahmet Yılmaz', amount: '$120.00', statusKey: 'delivered', statusLabel: t('status.delivered') },
  { id: '#12577', customer: 'Ayşe Demir', amount: '$89.00', statusKey: 'delivered', statusLabel: t('status.delivered') },
  { id: '#12576', customer: 'Mehmet Kaya', amount: '$149.00', statusKey: 'pending', statusLabel: t('status.pending') },
  { id: '#12575', customer: 'Fatma Şahin', amount: '$99.00', statusKey: 'delivered', statusLabel: t('status.delivered') },
])
</script>

<template>
  <div class="dashboard-page-shell">
    <PageHeader :title="t('dashboard.title')" :description="t('dashboard.description')" />

    <!-- Stat Cards (4 Columns) -->
    <div class="dashboard-stats-grid">
      <Card v-for="stat in stats" :key="stat.key" class="dashboard-stat-card">
        <CardContent>
          <div class="stat-card-top">
            <div class="stat-icon-box" :class="stat.color">
              <component :is="stat.icon" :size="18" />
            </div>
            <span class="stat-label-text">{{ stat.label }}</span>
          </div>
          <strong class="stat-number-text">{{ stat.value }}</strong>
          <div class="stat-meta-row">
            <span class="stat-trend-text">{{ stat.change }}</span>
            <span class="stat-period-text">{{ t('dashboard.lastMonth') }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Chart + Orders Grid -->
    <div class="dashboard-content-grid">
      <!-- Sales Overview Card -->
      <Card class="dashboard-chart-card">
        <div class="card-header-row">
          <h2 class="card-heading-title">{{ t('dashboard.chartTitle') }}</h2>

          <!-- Interactive Period Selector Dropdown -->
          <div class="period-select-container">
            <div class="period-select-box" @click="isPeriodDropdownOpen = !isPeriodDropdownOpen">
              <span>{{ selectedPeriodLabel }}</span>
              <ChevronDown :size="14" :class="{ open: isPeriodDropdownOpen }" class="period-chevron" />
            </div>

            <div v-if="isPeriodDropdownOpen" class="period-dropdown-menu">
              <button
                v-for="opt in periodOptions"
                :key="opt.key"
                type="button"
                class="period-dropdown-item"
                :class="{ active: selectedPeriodKey === opt.key }"
                @click="selectPeriod(opt.key)"
              >
                <span>{{ opt.label }}</span>
                <Check v-if="selectedPeriodKey === opt.key" :size="14" />
              </button>
            </div>
          </div>
        </div>

        <CardContent>
          <RevenueAreaChart :period-key="selectedPeriodKey" />
        </CardContent>
      </Card>

      <!-- Recent Orders Card -->
      <Card class="dashboard-orders-card">
        <div class="card-header-row">
          <h2 class="card-heading-title">{{ t('dashboard.recentOrders') }}</h2>
          <button type="button" class="view-all-btn" @click="router.push('/orders')">
            {{ t('dashboard.viewAll') }}
          </button>
        </div>
        <CardContent class="orders-list-wrapper">
          <div v-for="order in recentOrders" :key="order.id" class="recent-order-item">
            <div class="order-icon-box">
              <ShoppingBag :size="17" />
            </div>
            <div class="order-info-box">
              <strong class="order-id-text">{{ order.id }}</strong>
              <span class="order-customer-text">{{ order.customer }}</span>
            </div>
            <div class="order-right-box">
              <strong class="order-amount-text">{{ order.amount }}</strong>
              <span
                class="order-status-badge"
                :class="order.statusKey === 'delivered' ? 'paid' : 'pending'"
              >
                {{ order.statusLabel }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
