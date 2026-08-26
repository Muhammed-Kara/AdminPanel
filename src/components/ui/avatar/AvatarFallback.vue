<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <span :class="cn('ui-avatar-fallback flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground', props.class)">
    <slot />
  </span>
</template>
