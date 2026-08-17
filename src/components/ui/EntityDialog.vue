<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface EntityField {
  key: string
  label: string
  type?: 'text' | 'email' | 'number' | 'date' | 'select'
  options?: Array<{ label: string; value: string }>
  format?: 'currency' | 'status' | 'date'
}

const props = defineProps<{
  open: boolean
  mode: 'create' | 'view' | 'edit' | 'delete'
  title: string
  description: string
  fields: EntityField[]
  row?: Record<string, unknown> | null
  pending?: boolean
}>()

const emit = defineEmits<{ close: []; save: [value: Record<string, unknown>]; confirmDelete: [] }>()
const { t } = useI18n()
const draft = reactive<Record<string, unknown>>({})
const isForm = computed(() => props.mode === 'create' || props.mode === 'edit')

watch(() => [props.open, props.row], () => {
  Object.keys(draft).forEach((key) => delete draft[key])
  Object.assign(draft, props.row ?? {})
}, { immediate: true })

function updateValue(field: EntityField, value?: string) {
  draft[field.key] = field.type === 'number' ? Number(value ?? 0) : String(value ?? '')
}

function displayValue(field: EntityField) {
  const value = draft[field.key]
  if (field.format === 'status') return t(`status.${String(value)}`)
  if (field.format === 'currency') return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD' }).format(Number(value))
  if (field.format === 'date' && value) return new Intl.DateTimeFormat('tr-TR').format(new Date(String(value)))
  return String(value ?? '—')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-layer" role="presentation" @mousedown.self="emit('close')">
      <section class="entity-dialog" role="dialog" aria-modal="true" :aria-label="title">
        <header class="entity-dialog-header">
          <div><h2>{{ title }}</h2><p>{{ description }}</p></div>
          <Button variant="ghost" size="icon" :aria-label="t('common.close')" @click="emit('close')"><X :size="18" /></Button>
        </header>

        <form v-if="isForm" class="entity-form" @submit.prevent="emit('save', { ...draft })">
          <label v-for="field in fields" :key="field.key" class="entity-field">
            <span>{{ field.label }}</span>
            <select v-if="field.type === 'select'" :value="String(draft[field.key] ?? '')" required @change="updateValue(field, ($event.target as HTMLSelectElement).value)">
              <option value="" disabled>{{ t('common.select') }}</option>
              <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <Input v-else :model-value="String(draft[field.key] ?? '')" :type="field.type ?? 'text'" required @update:model-value="updateValue(field, $event)" />
          </label>
          <footer class="entity-dialog-actions">
            <Button type="button" variant="outline" @click="emit('close')">{{ t('common.cancel') }}</Button>
            <Button type="submit" :disabled="pending">{{ pending ? t('common.saving') : t('common.save') }}</Button>
          </footer>
        </form>

        <div v-else-if="mode === 'view'" class="entity-details">
          <div v-for="field in fields" :key="field.key"><span>{{ field.label }}</span><strong>{{ displayValue(field) }}</strong></div>
          <footer class="entity-dialog-actions"><Button variant="outline" @click="emit('close')">{{ t('common.close') }}</Button></footer>
        </div>

        <div v-else class="entity-delete-copy">
          <p>{{ t('common.deleteWarning') }}</p>
          <footer class="entity-dialog-actions">
            <Button variant="outline" @click="emit('close')">{{ t('common.cancel') }}</Button>
            <Button class="danger-button" :disabled="pending" @click="emit('confirmDelete')">{{ pending ? t('common.deleting') : t('common.delete') }}</Button>
          </footer>
        </div>
      </section>
    </div>
  </Teleport>
</template>
