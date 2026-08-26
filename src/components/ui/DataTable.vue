<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2
} from '@lucide/vue'
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
const currentPage = ref(1)
const pageSize = ref(20)

const filteredRows = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('tr')
  if (!term) return props.rows
  return props.rows.filter((row) => String(row[props.searchKey] ?? '').toLocaleLowerCase('tr').includes(term))
})

watch(search, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(filteredRows.value.length / pageSize.value) || 1)

const visiblePages = computed(() => {
  const count = Math.min(totalPages.value, 5)
  const start = Math.max(1, Math.min(currentPage.value - 2, totalPages.value - count + 1))
  return Array.from({ length: count }, (_, index) => start + index)
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = total
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

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
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="String(row.id)">
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.format === 'status'" class="status-badge" :class="`status-${String(row[column.key])}`">{{ $t(`status.${String(row[column.key])}`) }}</span>
              <span v-else>{{ cellValue(row, column) }}</span>
            </td>
            <td class="action-cell">
              <details class="row-actions">
                <summary :aria-label="$t('common.actions')"><MoreHorizontal :size="17" /></summary>
                <div class="row-actions-menu">
                  <button type="button" @click="handleAction($event, 'view', row)"><Eye :size="15" />{{ $t('common.viewDetails') }}</button>
                  <button type="button" @click="handleAction($event, 'edit', row)"><Pencil :size="15" />{{ $t('common.edit') }}</button>
                  <button type="button" class="danger" @click="handleAction($event, 'delete', row)"><Trash2 :size="15" />{{ $t('common.delete') }}</button>
                </div>
              </details>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length + 1" class="empty-table-cell">
              {{ $t('common.noResults') || 'Kayıt bulunamadı.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!loading" class="table-footer">
      <span class="record-info">{{ $t('common.recordCount', { count: filteredRows.length }) }}</span>
      <div class="pagination-bar">
        <div class="pagination-controls">
          <button type="button" class="page-btn" :aria-label="$t('common.firstPage')" :disabled="currentPage <= 1" @click="goToPage(1)">
            <ChevronsLeft :size="15" />
          </button>
          <button type="button" class="page-btn" :aria-label="$t('common.previous')" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            <ChevronLeft :size="15" />
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="page-btn num-btn"
            :class="{ active: currentPage === page }"
            :aria-current="currentPage === page ? 'page' : undefined"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button type="button" class="page-btn" :aria-label="$t('common.next')" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
            <ChevronRight :size="15" />
          </button>
          <button type="button" class="page-btn" :aria-label="$t('common.lastPage')" :disabled="currentPage >= totalPages" @click="goToPage(totalPages)">
            <ChevronsRight :size="15" />
          </button>
        </div>

        <select v-model.number="pageSize" class="page-size-select" :aria-label="$t('common.pageSize')" @change="currentPage = 1">
          <option :value="10">{{ $t('common.rowsPerPage', { count: 10 }) }}</option>
          <option :value="20">{{ $t('common.rowsPerPage', { count: 20 }) }}</option>
          <option :value="50">{{ $t('common.rowsPerPage', { count: 50 }) }}</option>
        </select>
      </div>
    </div>
  </div>
</template>
