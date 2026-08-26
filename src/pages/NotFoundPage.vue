<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="not-found">
    <strong>404</strong>
    <h1>{{ t('notFound.title') }}</h1>
    <RouterLink to="/">{{ t('notFound.back') }}</RouterLink>
  </main>
</template>
