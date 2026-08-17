<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
const attrs = useAttrs()
</script>

<template>
  <input v-model="model" v-bind="attrs" class="ui-input" :class="attrs.class" />
</template>
