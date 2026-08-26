<script setup lang="ts">
import { computed, ref, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'

interface RevenuePoint {
  label: string
  val: number
}

const props = withDefaults(
  defineProps<{
    items?: RevenuePoint[]
  }>(),
  {
    items: () => [],
  }
)

const width = 640
const height = 240
const plot = { top: 30, right: 20, bottom: 35, left: 45 }
const plotWidth = width - plot.left - plot.right
const plotHeight = height - plot.top - plot.bottom
const gradientId = `chart-grad-${useId().replaceAll(':', '')}`
const { locale } = useI18n()

const chartColors = {
  gradientStart: 'var(--chart-start)',
  gradientEnd: 'var(--chart-end)',
  stroke: 'var(--chart-start)',
  filter: 'drop-shadow(0 4px 8px color-mix(in srgb, var(--chart-start) 24%, transparent))',
  guideStroke: 'color-mix(in srgb, var(--chart-start) 42%, transparent)',
  ringFill: 'var(--surface)',
  ringStroke: 'var(--chart-start)',
  dotFill: 'var(--foreground)',
  tooltipBg: 'var(--foreground)',
  tooltipBorder: 'var(--border)',
  gridStroke: 'color-mix(in srgb, var(--border) 72%, transparent)',
  textFill: 'var(--muted)',
}

const chartData = computed(() => props.items)

const maxYValue = computed(() => {
  const maxVal = Math.max(...chartData.value.map((d) => d.val), 10000)
  return Math.ceil(maxVal / 10000) * 10000
})

const yTicks = computed(() => {
  const max = maxYValue.value
  const step = max / 4
  return [
    { label: `${max / 1000}K`, val: max, y: plot.top },
    { label: `${(step * 3) / 1000}K`, val: step * 3, y: plot.top + plotHeight * 0.25 },
    { label: `${(step * 2) / 1000}K`, val: step * 2, y: plot.top + plotHeight * 0.5 },
    { label: `${step / 1000}K`, val: step, y: plot.top + plotHeight * 0.75 },
    { label: '0', val: 0, y: plot.top + plotHeight },
  ]
})

const points = computed(() => {
  const count = chartData.value.length
  const max = maxYValue.value
  return chartData.value.map((d, i) => {
    const x = plot.left + (i * plotWidth) / (count - 1 || 1)
    const y = plot.top + plotHeight - (d.val / max) * plotHeight
    return { ...d, x, y }
  })
})

const linePath = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i]
    const next = pts[i + 1]
    const mx = (curr.x + next.x) / 2
    d += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`
  }
  return d
})

const areaPath = computed(() => {
  if (!linePath.value || points.value.length === 0) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  const baseline = plot.top + plotHeight
  return `${linePath.value} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
})

// Active Hover Index State
const activeIndex = ref<number>(Math.floor((chartData.value.length - 1) / 2))

watch(chartData, (newData) => {
  activeIndex.value = Math.floor((newData.length - 1) / 2)
})

const activePoint = computed(() => {
  const pts = points.value
  if (pts.length === 0) return null
  return pts[activeIndex.value] || pts[0]
})

function handlePointerMove(event: MouseEvent | TouchEvent) {
  const svg = (event.currentTarget as HTMLElement).closest('svg') as SVGSVGElement | null
  if (!svg) return

  const rect = svg.getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const mouseX = clientX - rect.left
  const viewBoxX = (mouseX / rect.width) * width

  let closestIndex = 0
  let minDistance = Infinity

  points.value.forEach((pt, idx) => {
    const dist = Math.abs(pt.x - viewBoxX)
    if (dist < minDistance) {
      minDistance = dist
      closestIndex = idx
    }
  })

  activeIndex.value = closestIndex
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
  <div class="area-chart-shell">
    <svg
      class="revenue-area-chart"
      :viewBox="`0 0 ${width} ${height}`"
      role="img"
      @mousemove="handlePointerMove"
      @touchmove.prevent="handlePointerMove"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="chartColors.gradientStart" stop-opacity="0.38" />
          <stop offset="60%" :stop-color="chartColors.gradientEnd" stop-opacity="0.08" />
          <stop offset="100%" :stop-color="chartColors.gradientEnd" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <g v-for="tick in yTicks" :key="tick.label" class="chart-grid-line">
        <line :x1="plot.left" :x2="width - plot.right" :y1="tick.y" :y2="tick.y" :stroke="chartColors.gridStroke" stroke-dasharray="3 3" />
        <text :x="plot.left - 10" :y="tick.y + 4" :fill="chartColors.textFill" font-size="10" text-anchor="end">{{ tick.label }}</text>
      </g>

      <!-- X-axis Labels -->
      <g v-for="(pt, i) in points" :key="pt.label + i">
        <text
          :x="pt.x"
          :y="height - 8"
          :fill="activeIndex === i ? chartColors.stroke : chartColors.textFill"
          :font-weight="activeIndex === i ? '700' : '400'"
          font-size="10"
          text-anchor="middle"
          class="x-label-text"
          @click="activeIndex = i"
        >
          {{ pt.label }}
        </text>
      </g>

      <!-- Area Fill -->
      <path :d="areaPath" :fill="`url(#${gradientId})`" />

      <!-- Curve Line -->
      <path
        :d="linePath"
        fill="none"
        :stroke="chartColors.stroke"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="{ filter: chartColors.filter }"
      />

      <!-- Interactive Node Hitboxes -->
      <g v-for="(pt, i) in points" :key="'hit-' + i" class="chart-node" @mouseenter="activeIndex = i" @click="activeIndex = i">
        <circle :cx="pt.x" :cy="pt.y" r="14" fill="transparent" />
      </g>

      <!-- Active Guide Line & Floating Tooltip -->
      <g v-if="activePoint" class="active-point-group">
        <line
          :x1="activePoint.x"
          :x2="activePoint.x"
          :y1="activePoint.y"
          :y2="plot.top + plotHeight"
          :stroke="chartColors.guideStroke"
          stroke-dasharray="2 2"
        />
        <!-- Outer Glowing Ring -->
        <circle :cx="activePoint.x" :cy="activePoint.y" r="6" :fill="chartColors.ringFill" :stroke="chartColors.ringStroke" stroke-width="2.5" />
        <circle :cx="activePoint.x" :cy="activePoint.y" r="2.5" :fill="chartColors.dotFill" />

        <!-- Floating Tooltip Card -->
        <g :transform="`translate(${Math.max(plot.left, Math.min(width - plot.right - 80, activePoint.x - 40))}, ${Math.max(10, activePoint.y - 38)})`">
          <rect width="80" height="26" rx="6" :fill="chartColors.tooltipBg" :stroke="chartColors.tooltipBorder" />
          <text x="40" y="17" fill="var(--background)" font-size="11" font-weight="600" text-anchor="middle">
            {{ formatCurrency(activePoint.val) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>
