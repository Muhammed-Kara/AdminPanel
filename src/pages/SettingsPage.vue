<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/ui/PageHeader.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useThemeStore } from '@/store/theme'

const theme = useThemeStore()
const { t, locale } = useI18n()
function setLocale(value: string) {
  locale.value = value
  localStorage.setItem('vue-admin-locale', value)
}
</script>

<template>
  <PageHeader :title="t('settings.title')" :description="t('settings.description')" />
  <AppCard class="settings-card">
    <div class="settings-heading"><h3>{{ t('settings.appearance') }}</h3><p>{{ t('settings.appearanceDesc') }}</p></div>
    <div class="setting-row"><div><strong>{{ t('settings.theme') }}</strong><span>{{ t('settings.themeDesc') }}</span></div><button class="switch" :class="{ on: theme.isDark }" @click="theme.toggle()"><i /></button></div>
    <div class="setting-row"><div><strong>{{ t('settings.language') }}</strong><span>{{ t('settings.languageDesc') }}</span></div><select :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value)"><option value="tr">Türkçe</option><option value="en">English</option></select></div>
  </AppCard>
</template>

