<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { Button } from '@/components/ui/button'

defineProps<{ title: string; description: string; showAction?: boolean }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="page-header">
    <div><h1>{{ title }}</h1><p>{{ description }}</p></div>
    <div class="page-header-actions">
      <slot name="actions" />
      <Button v-if="showAction" @click="$emit('action')"><Plus :size="16" />{{ $t('common.add') }}</Button>
    </div>
  </div>
</template>
