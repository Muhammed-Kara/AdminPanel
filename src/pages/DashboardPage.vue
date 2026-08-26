<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Activity,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  Users
} from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/ui/PageHeader.vue'
import RevenueAreaChart from '@/components/ui/RevenueAreaChart.vue'
import { dummyService } from '@/service/dummy/dummy-service'

const router = useRouter()
const { t } = useI18n()
const { data: dashboardData, isPending } = useQuery({ queryKey: ['dashboard'], queryFn: dummyService.getDashboard })

const statPresentation = {
  revenue: { icon: CreditCard, color: 'indigo' },
  orders: { icon: ShoppingCart, color: 'blue' },
  products: { icon: ShoppingBag, color: 'purple' },
  activeUsers: { icon: Activity, color: 'violet' },
} as const

const stats = computed(() => (dashboardData.value?.stats ?? []).map((stat) => ({
  ...stat,
  label: t(`dashboard.${stat.key}`),
  icon: statPresentation[stat.key as keyof typeof statPresentation]?.icon ?? Users,
  color: statPresentation[stat.key as keyof typeof statPresentation]?.color ?? 'blue',
})))

const recentOrders = computed(() => (dashboardData.value?.recentOrders ?? []).map((order) => ({
  ...order,
  statusLabel: t(`status.${order.status}`),
})))

const yearlyRevenue = computed(() => (dashboardData.value?.revenue ?? []).map((item) => ({
  label: t(`months.${item.month}`),
  val: item.revenue,
})))
</script>

<template>
  <div class="dashboard-page-shell">
    <PageHeader :title="t('dashboard.title')" :description="t('dashboard.description')" />

    <div v-if="isPending" class="loading-state dashboard-loading">
      <span class="spinner" />{{ t('common.loading') }}
    </div>

    <!-- Stat Cards (4 Columns) -->
    <div v-else class="dashboard-stats-grid">
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
    <div v-if="!isPending" class="dashboard-content-grid">
      <!-- Sales Overview Card -->
      <Card class="dashboard-chart-card">
        <div class="card-header-row">
          <h2 class="card-heading-title">{{ t('dashboard.chartTitle') }}</h2>

          <div class="period-select-box">
            <span>{{ t('dashboard.period') }}</span>
          </div>
        </div>

        <CardContent>
          <RevenueAreaChart :items="yearlyRevenue" />
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
                :class="order.status === 'pending' ? 'pending' : 'paid'"
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
