<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, MoreHorizontal, Pencil, Search, SlidersHorizontal, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface TableColumn {
  key: string
  label: string
  format?: 'currency' | 'status' | 'date'
}

const props = defineProps<{ rows: Record<string, unknown>[]; columns: TableColumn[]; searchKey: string; loading?: boolean }>()
const emit = defineEmits<{ view: [row: Record<string, unknown>]; edit: [row: Record<string, unknown>]; delete: [row: Record<string, unknown>] }>()
const search = ref('')
const filteredRows = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('tr')
  if (!term) return props.rows
  return props.rows.filter((row) => String(row[props.searchKey] ?? '').toLocaleLowerCase('tr').includes(term))
})

function cellValue(row: Record<string, unknown>, column: TableColumn) {
  const value = row[column.key]
  if (column.format === 'currency') return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD' }).format(Number(value))
  if (column.format === 'date') return new Intl.DateTimeFormat('tr-TR').format(new Date(String(value)))
  return String(value ?? '')
}

function handleAction(event: MouseEvent, action: 'view' | 'edit' | 'delete', row: Record<string, unknown>) {
  ;(event.currentTarget as HTMLElement).closest('details')?.removeAttribute('open')
  if (action === 'view') emit('view', row)
  if (action === 'edit') emit('edit', row)
  if (action === 'delete') emit('delete', row)
}
</script>

<template>
  <div class="table-card">
    <div class="table-toolbar">
      <label class="table-search"><Search :size="16" /><Input v-model="search" :placeholder="$t('common.search')" /></label>
      <Button variant="outline"><SlidersHorizontal :size="16" />{{ $t('common.filters') }}</Button>
    </div>
    <div v-if="loading" class="loading-state"><span class="spinner" />{{ $t('common.loading') }}</div>
    <div v-else class="table-scroll">
      <table>
        <thead><tr><th v-for="column in columns" :key="column.key">{{ column.label }}</th><th /></tr></thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="String(row.id)">
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.format === 'status'" class="status-badge" :class="`status-${String(row[column.key])}`">{{ $t(`status.${String(row[column.key])}`) }}</span>
              <span v-else>{{ cellValue(row, column) }}</span>
            </td>
            <td class="action-cell">
              <details class="row-actions">
                <summary :aria-label="$t('common.actions')"><MoreHorizontal :size="17" /></summary>
                <div class="row-actions-menu">
                  <button @click="handleAction($event, 'view', row)"><Eye :size="15" />{{ $t('common.viewDetails') }}</button>
                  <button @click="handleAction($event, 'edit', row)"><Pencil :size="15" />{{ $t('common.edit') }}</button>
                  <button class="danger" @click="handleAction($event, 'delete', row)"><Trash2 :size="15" />{{ $t('common.delete') }}</button>
                </div>
              </details>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!loading" class="table-footer"><span>{{ $t('common.recordCount', { count: filteredRows.length }) }}</span><div><button disabled>{{ $t('common.previous') }}</button><button disabled>{{ $t('common.next') }}</button></div></div>
  </div>
</template>
