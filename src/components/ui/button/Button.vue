<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'icon'
  }>(),
  { variant: 'default', size: 'default' },
)

const attrs = useAttrs()
const classes = computed(() => ['ui-button', `ui-button-${props.variant}`, `ui-button-${props.size}`, attrs.class])
</script>

<template>
  <button v-bind="attrs" :class="classes">
    <slot />
  </button>
</template>
