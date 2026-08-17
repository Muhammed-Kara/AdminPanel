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
const { data, isPending } = useQuery({ queryKey: ['products'], queryFn: dummyService.getProducts })
const dialogMode = ref<DialogMode>('view')
const dialogOpen = ref(false)
const selectedRow = ref<Record<string, unknown> | null>(null)
const rows = computed(() => (data.value ?? []).map((row) => ({ ...row } as Record<string, unknown>)))
const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('products.name') }, { key: 'category', label: t('products.category') },
  { key: 'price', label: t('products.price'), format: 'currency' }, { key: 'stock', label: t('products.stock') },
  { key: 'status', label: t('products.status'), format: 'status' }, { key: 'sku', label: t('products.sku') },
])
const fields = computed<EntityField[]>(() => [
  { key: 'name', label: t('products.name') }, { key: 'category', label: t('products.category') },
  { key: 'price', label: t('products.price'), type: 'number', format: 'currency' }, { key: 'stock', label: t('products.stock'), type: 'number' },
  { key: 'status', label: t('products.status'), type: 'select', format: 'status', options: ['in-stock', 'low-stock', 'out-of-stock'].map((value) => ({ value, label: t(`status.${value}`) })) },
  { key: 'sku', label: t('products.sku') },
])
const dialogTitle = computed(() => t(`common.${dialogMode.value}Entity`, { entity: t('products.entity') }))
const dialogDescription = computed(() => dialogMode.value === 'delete' ? t('common.deleteDescription', { name: selectedRow.value?.name }) : t('common.entityDialogDescription'))
const mutation = useMutation({
  mutationFn: async (value: Record<string, unknown> | null) => {
    if (dialogMode.value === 'create' && value) await dummyService.createProduct(value)
    if (dialogMode.value === 'edit' && value && selectedRow.value) await dummyService.updateProduct(String(selectedRow.value.id), value)
    if (dialogMode.value === 'delete' && selectedRow.value) await dummyService.deleteProduct(String(selectedRow.value.id))
  },
  onSuccess: async () => {
    toast.success(t(`toast.${dialogMode.value}Success`, { entity: t('products.entity') }))
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    dialogOpen.value = false
  },
})

function openDialog(mode: DialogMode, row?: Record<string, unknown>) {
  dialogMode.value = mode
  selectedRow.value = row ?? (mode === 'create' ? { status: 'in-stock', price: 0, stock: 0 } : null)
  dialogOpen.value = true
}
</script>

<template>
  <PageHeader :title="t('products.title')" :description="t('products.description')" show-action @action="openDialog('create')" />
  <DataTable :rows="rows" :columns="columns" search-key="name" :loading="isPending" @view="openDialog('view', $event)" @edit="openDialog('edit', $event)" @delete="openDialog('delete', $event)" />
  <EntityDialog :open="dialogOpen" :mode="dialogMode" :title="dialogTitle" :description="dialogDescription" :fields="fields" :row="selectedRow" :pending="mutation.isPending.value" @close="dialogOpen = false" @save="mutation.mutate($event)" @confirm-delete="mutation.mutate(null)" />
</template>
