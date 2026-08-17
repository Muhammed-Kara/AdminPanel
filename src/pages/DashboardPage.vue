<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, CalendarDays, DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from '@lucide/vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/ui/PageHeader.vue'
import RevenueAreaChart from '@/components/ui/RevenueAreaChart.vue'
import { dummyService } from '@/service/dummy/dummy-service'

const { t, locale } = useI18n()
const { data, isPending } = useQuery({ queryKey: ['dashboard'], queryFn: dummyService.getDashboard })
const icons = { revenue: DollarSign, orders: ShoppingCart, products: Package, activeUsers: Users }
const iconFor = (key: string) => icons[key as keyof typeof icons] ?? Package
const statusVariant = (status: string) => {
  if (status === 'delivered') return 'success'
  if (status === 'pending') return 'warning'
  return 'info'
}
</script>

<template>
  <PageHeader :title="t('dashboard.title')" :description="t('dashboard.description')">
    <template #actions>
      <Button variant="outline"><CalendarDays :size="15" />{{ t('dashboard.period') }}</Button>
    </template>
  </PageHeader>
  <div v-if="isPending" class="loading-state dashboard-loading"><span class="spinner" />{{ t('common.loading') }}</div>
  <template v-else-if="data">
    <div class="dashboard-stats-grid">
      <Card v-for="stat in data.stats" :key="stat.key" class="dashboard-stat-card">
        <CardHeader class="dashboard-stat-header">
          <CardDescription>{{ t(`dashboard.${stat.key}`) }}</CardDescription>
          <div class="stat-icon"><component :is="iconFor(stat.key)" :size="17" /></div>
        </CardHeader>
        <CardContent>
          <strong class="dashboard-stat-value">{{ stat.value }}</strong>
          <div class="dashboard-stat-meta">
            <Badge :variant="stat.trend === 'up' ? 'success' : 'destructive'">
              <TrendingUp v-if="stat.trend === 'up'" :size="12" /><TrendingDown v-else :size="12" />{{ stat.change }}
            </Badge>
            <span>{{ t('dashboard.lastMonth') }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    <div class="dashboard-content-grid">
      <Card class="dashboard-chart-card">
        <CardHeader class="dashboard-panel-header">
          <div><CardTitle>{{ t('dashboard.chartTitle') }}</CardTitle><CardDescription>{{ t('dashboard.chartDescription') }}</CardDescription></div>
          <Badge variant="default"><ArrowUpRight :size="13" />{{ t('dashboard.yearlyGrowth') }}</Badge>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart
            :items="data.revenue"
            :locale="locale"
            :current-label="t('dashboard.currentMonth')"
            :average-label="t('dashboard.monthlyAverage')"
            :accessible-label="t('dashboard.chartAccessibleLabel')"
          />
        </CardContent>
      </Card>
      <Card class="dashboard-orders-card">
        <CardHeader class="dashboard-panel-header">
          <div><CardTitle>{{ t('dashboard.recentOrders') }}</CardTitle><CardDescription>{{ t('dashboard.recentDescription') }}</CardDescription></div>
          <Button variant="ghost" size="sm">{{ t('dashboard.viewAll') }}</Button>
        </CardHeader>
        <CardContent class="dashboard-order-list">
          <div v-for="order in data.recentOrders" :key="order.id" class="dashboard-order-row">
            <Avatar><AvatarFallback>{{ order.customer.slice(0, 2).toUpperCase() }}</AvatarFallback></Avatar>
            <div class="dashboard-order-customer"><strong>{{ order.customer }}</strong><span>{{ order.id }}</span></div>
            <div class="dashboard-order-total"><strong>{{ order.amount }}</strong><Badge :variant="statusVariant(order.status)">{{ t(`status.${order.status}`) }}</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </template>
</template>
