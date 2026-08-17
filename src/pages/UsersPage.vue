<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import DataTable, { type TableColumn } from '@/components/ui/DataTable.vue'
import EntityDialog, { type EntityField } from '@/components/ui/EntityDialog.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { dummyService } from '@/service/dummy/dummy-service'

type DialogMode = 'create' | 'view' | 'edit' | 'delete'
const { t } = useI18n()
const queryClient = useQueryClient()
const { data, isPending } = useQuery({ queryKey: ['users'], queryFn: dummyService.getUsers })
const dialogMode = ref<DialogMode>('view')
const dialogOpen = ref(false)
const selectedRow = ref<Record<string, unknown> | null>(null)
const rows = computed(() => (data.value ?? []).map((row) => ({ ...row } as Record<string, unknown>)))
const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('users.name') }, { key: 'email', label: t('users.email') },
  { key: 'role', label: t('users.role') }, { key: 'status', label: t('users.status'), format: 'status' },
  { key: 'createdAt', label: t('users.createdAt'), format: 'date' },
])
const fields = computed<EntityField[]>(() => [
  { key: 'name', label: t('users.name') },
  { key: 'email', label: t('users.email'), type: 'email' },
  { key: 'role', label: t('users.role'), type: 'select', options: ['admin', 'editor', 'viewer'].map((value) => ({ value, label: t(`roles.${value}`) })) },
  { key: 'status', label: t('users.status'), type: 'select', format: 'status', options: ['active', 'inactive', 'banned'].map((value) => ({ value, label: t(`status.${value}`) })) },
  { key: 'createdAt', label: t('users.createdAt'), type: 'date', format: 'date' },
])
const dialogTitle = computed(() => t(`common.${dialogMode.value}Entity`, { entity: t('users.entity') }))
const dialogDescription = computed(() => dialogMode.value === 'delete' ? t('common.deleteDescription', { name: selectedRow.value?.name }) : t('common.entityDialogDescription'))
const mutation = useMutation({
  mutationFn: async (value: Record<string, unknown> | null) => {
    if (dialogMode.value === 'create' && value) await dummyService.createUser(value)
    if (dialogMode.value === 'edit' && value && selectedRow.value) await dummyService.updateUser(String(selectedRow.value.id), value)
    if (dialogMode.value === 'delete' && selectedRow.value) await dummyService.deleteUser(String(selectedRow.value.id))
  },
  onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['users'] }); dialogOpen.value = false },
})

function openDialog(mode: DialogMode, row?: Record<string, unknown>) {
  dialogMode.value = mode
  selectedRow.value = row ?? (mode === 'create' ? { role: 'viewer', status: 'active', createdAt: new Date().toISOString().slice(0, 10) } : null)
  dialogOpen.value = true
}
</script>

<template>
  <PageHeader :title="t('users.title')" :description="t('users.description')" show-action @action="openDialog('create')" />
  <DataTable :rows="rows" :columns="columns" search-key="name" :loading="isPending" @view="openDialog('view', $event)" @edit="openDialog('edit', $event)" @delete="openDialog('delete', $event)" />
  <EntityDialog :open="dialogOpen" :mode="dialogMode" :title="dialogTitle" :description="dialogDescription" :fields="fields" :row="selectedRow" :pending="mutation.isPending.value" @close="dialogOpen = false" @save="mutation.mutate($event)" @confirm-delete="mutation.mutate(null)" />
</template>
