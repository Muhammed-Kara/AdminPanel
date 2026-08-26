<script setup lang="ts">
import { computed, useId } from 'vue'

interface RevenuePoint {
  month: string
  revenue: number
}

const props = defineProps<{
  items?: RevenuePoint[]
  locale?: string
  currentLabel?: string
  averageLabel?: string
  accessibleLabel?: string
}>()

const width = 640
const height = 240
const plot = { top: 30, right: 20, bottom: 35, left: 45 }
const plotWidth = width - plot.left - plot.right
const plotHeight = height - plot.top - plot.bottom
const gradientId = `chart-grad-${useId().replaceAll(':', '')}`

// Mock data matching the photo: 01, 05, 10, 15, 20, 25, 30 with 40K y-max
const chartData = computed(() => [
  { label: '01', val: 5000 },
  { label: '05', val: 18000 },
  { label: '10', val: 12000 },
  { label: '15', val: 23620, tooltip: true },
  { label: '20', val: 17000 },
  { label: '25', val: 28000 },
  { label: '30', val: 21000 },
])

const yTicks = [
  { label: '40K', val: 40000, y: plot.top },
  { label: '30K', val: 30000, y: plot.top + plotHeight * 0.25 },
  { label: '20K', val: 20000, y: plot.top + plotHeight * 0.5 },
  { label: '10K', val: 10000, y: plot.top + plotHeight * 0.75 },
  { label: '0', val: 0, y: plot.top + plotHeight },
]

const points = computed(() => {
  const count = chartData.value.length
  return chartData.value.map((d, i) => {
    const x = plot.left + (i * plotWidth) / (count - 1)
    const y = plot.top + plotHeight - (d.val / 40000) * plotHeight
    return { ...d, x, y }
  })
})

const linePath = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
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
  if (!linePath.value) return ''
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  const baseline = plot.top + plotHeight
  return `${linePath.value} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
})

const activePoint = computed(() => points.value.find((p) => p.tooltip) || points.value[3])
</script>

<template>
  <div class="area-chart-shell">
    <svg class="revenue-area-chart" :viewBox="`0 0 ${width} ${height}`" role="img">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#818cf8" stop-opacity="0.35" />
          <stop offset="60%" stop-color="#6366f1" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <g v-for="tick in yTicks" :key="tick.label" class="chart-grid-line">
        <line :x1="plot.left" :x2="width - plot.right" :y1="tick.y" :y2="tick.y" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
        <text :x="plot.left - 10" :y="tick.y + 4" fill="#8e9db7" font-size="10" text-anchor="end">{{ tick.label }}</text>
      </g>

      <!-- X-axis Labels -->
      <g v-for="pt in points" :key="pt.label">
        <text :x="pt.x" :y="height - 8" fill="#8e9db7" font-size="10" text-anchor="middle">{{ pt.label }}</text>
      </g>

      <!-- Area Fill -->
      <path :d="areaPath" :fill="`url(#${gradientId})`" />

      <!-- Curve Line -->
      <path
        :d="linePath"
        fill="none"
        stroke="#818cf8"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="filter: drop-shadow(0px 4px 10px rgba(129, 140, 248, 0.4));"
      />

      <!-- Active Guide Line & Tooltip (at Point 15) -->
      <g v-if="activePoint">
        <line
          :x1="activePoint.x"
          :x2="activePoint.x"
          :y1="activePoint.y"
          :y2="plot.top + plotHeight"
          stroke="rgba(129, 140, 248, 0.4)"
          stroke-dasharray="2 2"
        />
        <!-- Outer Glowing Ring -->
        <circle :cx="activePoint.x" :cy="activePoint.y" r="6" fill="#151c2e" stroke="#818cf8" stroke-width="2.5" />
        <circle :cx="activePoint.x" :cy="activePoint.y" r="2.5" fill="#ffffff" />

        <!-- Floating Tooltip Card ($23,620) -->
        <g :transform="`translate(${activePoint.x - 38}, ${activePoint.y - 36})`">
          <rect width="76" height="24" rx="6" fill="#0f172a" stroke="rgba(129, 140, 248, 0.3)" />
          <text x="38" y="16" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle">$23,620</text>
        </g>
      </g>
    </svg>
  </div>
</template>
