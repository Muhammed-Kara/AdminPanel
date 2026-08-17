<script setup lang="ts">
import { computed, useId } from 'vue'

interface RevenuePoint {
  month: string
  revenue: number
}

const props = defineProps<{
  items: RevenuePoint[]
  locale: string
  currentLabel: string
  averageLabel: string
  accessibleLabel: string
}>()

const width = 960
const height = 280
const plot = { top: 20, right: 18, bottom: 40, left: 58 }
const plotWidth = width - plot.left - plot.right
const plotHeight = height - plot.top - plot.bottom
const gradientId = `revenue-line-${useId().replaceAll(':', '')}`

const maxValue = computed(() => Math.max(1, ...props.items.map((item) => item.revenue)))
const axisMaximum = computed(() => Math.ceil(maxValue.value / 2000) * 2000)
const average = computed(() => props.items.length
  ? props.items.reduce((total, item) => total + item.revenue, 0) / props.items.length
  : 0)

const points = computed(() => props.items.map((item, index) => {
  const x = plot.left + (index * plotWidth) / Math.max(1, props.items.length - 1)
  return {
    ...item,
    x,
    y: plot.top + plotHeight - (item.revenue / axisMaximum.value) * plotHeight,
    labelX: Math.min(width - 42, Math.max(plot.left + 42, x)),
  }
}))
const polylinePoints = computed(() => points.value.map((point) => `${point.x},${point.y}`).join(' '))
const areaPoints = computed(() => {
  const first = points.value[0]
  const last = points.value.at(-1)
  if (!first || !last) return ''
  const baseline = plot.top + plotHeight
  return `${first.x},${baseline} ${polylinePoints.value} ${last.x},${baseline}`
})

const yTicks = computed(() => Array.from({ length: 5 }, (_, index) => {
  const value = axisMaximum.value - (axisMaximum.value / 4) * index
  return { value, y: plot.top + (plotHeight / 4) * index }
}))

const averageY = computed(() => plot.top + plotHeight - (average.value / axisMaximum.value) * plotHeight)
const current = computed(() => props.items.at(-1)?.revenue ?? 0)
const currency = computed(() => new Intl.NumberFormat(props.locale, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format)
const compactCurrency = computed(() => new Intl.NumberFormat(props.locale, {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
}).format)
</script>

<template>
  <div class="area-chart-shell">
    <div class="area-chart-summary">
      <div class="chart-current-summary">
        <span>{{ currentLabel }}</span>
        <strong>{{ currency(current) }}</strong>
      </div>
      <div class="chart-average-summary">
        <span class="average-key" />
        <div><span>{{ averageLabel }}</span><strong>{{ currency(average) }}</strong></div>
      </div>
    </div>

    <svg class="revenue-area-chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="accessibleLabel">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--chart-end)" stop-opacity="0.2" />
          <stop offset="75%" stop-color="var(--chart-end)" stop-opacity="0.035" />
          <stop offset="100%" stop-color="var(--chart-end)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g v-for="tick in yTicks" :key="tick.value" class="chart-grid-line">
        <line :x1="plot.left" :x2="width - plot.right" :y1="tick.y" :y2="tick.y" />
        <text :x="plot.left - 12" :y="tick.y + 4">{{ compactCurrency(tick.value) }}</text>
      </g>

      <polygon class="chart-trend-area" :points="areaPoints" :fill="`url(#${gradientId})`" />
      <line class="chart-average-line" :x1="plot.left" :x2="width - plot.right" :y1="averageY" :y2="averageY" />
      <polyline class="chart-trend-shadow" :points="polylinePoints" />
      <polyline class="chart-trend-line" :points="polylinePoints" />

      <g
        v-for="(point, index) in points"
        :key="point.month"
        class="chart-node"
        :class="{ 'chart-node-current': index === points.length - 1 }"
        tabindex="0"
      >
        <title>{{ point.month }}: {{ currency(point.revenue) }}</title>
        <rect class="chart-node-hitbox" :x="point.x - 28" :y="plot.top" width="56" :height="plotHeight" />
        <line class="chart-node-guide" :x1="point.x" :x2="point.x" :y1="point.y" :y2="plot.top + plotHeight" />
        <circle class="chart-node-ring" :cx="point.x" :cy="point.y" r="7" />
        <circle class="chart-node-dot" :cx="point.x" :cy="point.y" r="3.5" />
        <g v-if="index === points.length - 1" class="chart-current-label">
          <rect :x="point.labelX - 27" :y="point.y - 30" width="54" height="21" rx="7" />
          <text :x="point.labelX" :y="point.y - 16">{{ compactCurrency(point.revenue) }}</text>
        </g>
        <text class="chart-node-month" :x="point.x" :y="height - 12">{{ point.month }}</text>
      </g>
    </svg>
  </div>
</template>
