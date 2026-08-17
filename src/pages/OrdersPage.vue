<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import EntityDialog, { type EntityField } from '@/components/ui/EntityDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { dummyService } from '@/service/dummy/dummy-service'

type DialogMode = 'create' | 'view' | 'edit' | 'delete'
const { t } = useI18n()
const queryClient = useQueryClient()
const { data, isPending } = useQuery({ queryKey: ['orders'], queryFn: dummyService.getOrders })
const dialogMode = ref<DialogMode>('view')
const dialogOpen = ref(false)
const selectedRow = ref<Record<string, unknown> | null>(null)
const rows = computed(() => (data.value ?? []).map((row) => ({ ...row } as Record<string, unknown>)))
const columns = computed<TableColumn[]>(() => [
  { key: 'id', label: t('orders.id') }, { key: 'customer', label: t('orders.customer') },
  { key: 'items', label: t('orders.items') }, { key: 'total', label: t('orders.total'), format: 'currency' },
  { key: 'status', label: t('orders.status'), format: 'status' }, { key: 'createdAt', label: t('orders.createdAt'), format: 'date' },
])
const fields = computed<EntityField[]>(() => [
  { key: 'customer', label: t('orders.customer') }, { key: 'email', label: t('orders.email'), type: 'email' },
  { key: 'items', label: t('orders.items'), type: 'number' }, { key: 'total', label: t('orders.total'), type: 'number', format: 'currency' },
  { key: 'status', label: t('orders.status'), type: 'select', format: 'status', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((value) => ({ value, label: t(`status.${value}`) })) },
  { key: 'createdAt', label: t('orders.createdAt'), type: 'date', format: 'date' },
])
const dialogTitle = computed(() => t(`common.${dialogMode.value}Entity`, { entity: t('orders.entity') }))
const dialogDescription = computed(() => dialogMode.value === 'delete' ? t('common.deleteDescription', { name: selectedRow.value?.id }) : t('common.entityDialogDescription'))
const mutation = useMutation({
  mutationFn: async (value: Record<string, unknown> | null) => {
    if (dialogMode.value === 'create' && value) await dummyService.createOrder(value)
    if (dialogMode.value === 'edit' && value && selectedRow.value) await dummyService.updateOrder(String(selectedRow.value.id), value)
    if (dialogMode.value === 'delete' && selectedRow.value) await dummyService.deleteOrder(String(selectedRow.value.id))
  },
  onSuccess: async () => {
    toast.success(t(`toast.${dialogMode.value}Success`, { entity: t('orders.entity') }))
    await queryClient.invalidateQueries({ queryKey: ['orders'] })
    dialogOpen.value = false
  },
})

function openDialog(mode: DialogMode, row?: Record<string, unknown>) {
  dialogMode.value = mode
  selectedRow.value = row ?? (mode === 'create' ? { status: 'pending', items: 1, total: 0, createdAt: new Date().toISOString().slice(0, 10) } : null)
  dialogOpen.value = true
}
</script>

<template>
  <PageHeader :title="t('orders.title')" :description="t('orders.description')" show-action @action="openDialog('create')" />
  <DataTable :rows="rows" :columns="columns" search-key="customer" :loading="isPending" @view="openDialog('view', $event)" @edit="openDialog('edit', $event)" @delete="openDialog('delete', $event)" />
  <EntityDialog :open="dialogOpen" :mode="dialogMode" :title="dialogTitle" :description="dialogDescription" :fields="fields" :row="selectedRow" :pending="mutation.isPending.value" @close="dialogOpen = false" @save="mutation.mutate($event)" @confirm-delete="mutation.mutate(null)" />
</template>
