<script setup lang="ts">
import { Check, Moon, Sun } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/ui/PageHeader.vue'
import { type AccentColor, useThemeStore } from '@/store/theme'

const theme = useThemeStore()
const { t, locale } = useI18n()
const accentOptions: AccentColor[] = ['violet', 'blue', 'cyan', 'emerald', 'amber', 'orange', 'rose', 'slate']
const radiusOptions = [2, 6, 10, 14, 18, 24]

function setLocale(value: string) {
  locale.value = value
  localStorage.setItem('vue-admin-locale', value)
  toast.success(t('toast.appearanceUpdated'))
}

function setAccent(value: AccentColor) {
  theme.setAccent(value)
  toast.success(t('toast.appearanceUpdated'))
}

function setRadius(value: number, notify = true) {
  theme.setRadius(value)
  if (notify) toast.success(t('toast.appearanceUpdated'))
}
</script>

<template>
  <PageHeader :title="t('settings.title')" :description="t('settings.description')" />
  <div class="settings-grid">
    <Card class="appearance-card">
      <CardHeader>
        <CardTitle>{{ t('settings.appearance') }}</CardTitle>
        <CardDescription>{{ t('settings.appearanceDesc') }}</CardDescription>
      </CardHeader>
      <CardContent class="appearance-content">
        <div class="appearance-setting">
          <div><strong>{{ t('settings.theme') }}</strong><span>{{ t('settings.themeDesc') }}</span></div>
          <div class="theme-choice-grid">
            <button :class="{ active: !theme.isDark }" :aria-pressed="!theme.isDark" @click="theme.setDark(false)"><Sun :size="17" />{{ t('settings.light') }}<Check v-if="!theme.isDark" :size="14" /></button>
            <button :class="{ active: theme.isDark }" :aria-pressed="theme.isDark" @click="theme.setDark(true)"><Moon :size="17" />{{ t('settings.dark') }}<Check v-if="theme.isDark" :size="14" /></button>
          </div>
        </div>

        <div class="appearance-setting">
          <div><strong>{{ t('settings.accent') }}</strong><span>{{ t('settings.accentDesc') }}</span></div>
          <div class="accent-choice-grid">
            <button v-for="color in accentOptions" :key="color" :class="[`accent-${color}`, { active: theme.accent === color }]" :aria-label="t(`settings.colors.${color}`)" :aria-pressed="theme.accent === color" @click="setAccent(color)"><i /><Check v-if="theme.accent === color" :size="13" /></button>
          </div>
        </div>

        <div class="appearance-setting">
          <div><strong>{{ t('settings.radius') }}</strong><span>{{ t('settings.radiusDesc') }}</span></div>
          <div class="radius-control">
            <div class="radius-control-header"><span>{{ t('settings.radiusValue') }}</span><strong>{{ theme.radius }} px</strong></div>
            <input :value="theme.radius" type="range" min="2" max="24" step="1" :aria-label="t('settings.radius')" @input="setRadius(Number(($event.target as HTMLInputElement).value), false)" @change="toast.success(t('toast.appearanceUpdated'))" />
            <div class="radius-presets">
              <button v-for="radius in radiusOptions" :key="radius" :class="{ active: theme.radius === radius }" :aria-label="`${radius} px`" :aria-pressed="theme.radius === radius" @click="setRadius(radius)"><i :style="{ borderRadius: `${Math.min(radius, 10)}px` }" />{{ radius }}</button>
            </div>
          </div>
        </div>

        <div class="appearance-setting">
          <div><strong>{{ t('settings.language') }}</strong><span>{{ t('settings.languageDesc') }}</span></div>
          <select :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value)"><option value="tr">Türkçe</option><option value="en">English</option></select>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
