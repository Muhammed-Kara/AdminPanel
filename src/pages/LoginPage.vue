<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ShieldCheck, Sparkles } from '@lucide/vue'
import { z } from 'zod'
import { dummyService } from '@/service/dummy/dummy-service'
import { useAuthStore } from '@/store/auth'

const email = ref('admin@example.com')
const password = ref('password')
const loading = ref(false)
const error = ref('')
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()
const schema = z.object({ email: z.email(), password: z.string().min(1) })

async function submit() {
  error.value = ''
  if (!schema.safeParse({ email: email.value, password: password.value }).success) {
    error.value = t('login.invalid')
    return
  }
  loading.value = true
  try {
    const result = await dummyService.login(email.value, password.value)
    auth.setSession(result.user, result.token)
    await router.push(String(route.query.redirect ?? '/'))
  } catch {
    error.value = t('login.invalid')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-showcase">
      <div class="showcase-brand"><span><Sparkles :size="20" /></span>{{ t('brand') }}</div>
      <div class="showcase-copy">
        <div class="shield"><ShieldCheck :size="40" /></div>
        <p>OPERATIONS CENTER</p>
        <h1>{{ t('login.welcome') }}</h1>
        <span>Performansınızı tek bir modern çalışma alanından yönetin.</span>
      </div>
      <div class="showcase-grid" />
    </section>
    <section class="login-panel">
      <form class="login-card" @submit.prevent="submit">
        <div class="mobile-brand"><Sparkles :size="20" /> {{ t('brand') }}</div>
        <h2>{{ t('login.title') }}</h2>
        <p>{{ t('login.description') }}</p>
        <label><span>{{ t('login.email') }}</span><input v-model="email" type="email" autocomplete="email" /></label>
        <label><span>{{ t('login.password') }}</span><input v-model="password" type="password" autocomplete="current-password" /></label>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="login-button" :disabled="loading">{{ loading ? t('login.submitting') : t('login.submit') }}</button>
        <div class="demo-hint">{{ t('login.demo') }}</div>
      </form>
    </section>
  </main>
</template>

