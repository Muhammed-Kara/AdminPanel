<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span :class="cn('ui-avatar relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border', props.class)">
    <slot />
  </span>
</template>
