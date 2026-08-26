<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  BarChart3,
  Bell,
  Eye,
  EyeOff,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  UsersRound,
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { dummyService } from '@/service/dummy/dummy-service'
import { useAuthStore } from '@/store/auth'

const email = ref('admin@example.com')
const password = ref('password')
const rememberMe = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const schema = z.object({ email: z.string().min(1), password: z.string().min(1) })

async function submit() {
  error.value = ''
  if (!schema.safeParse({ email: email.value, password: password.value }).success) {
    error.value = t('login.required')
    return
  }

  loading.value = true
  try {
    const result = await dummyService.login(email.value, password.value)
    auth.setSession(result.user, result.token)
    toast.success(t('toast.loginSuccess'), { description: t('toast.welcome', { name: result.user.name }) })
    await router.push(String(route.query.redirect ?? '/'))
  } catch {
    error.value = t('login.invalid')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-shell" aria-labelledby="login-title">
      <div class="auth-visual" aria-hidden="true">
        <div class="visual-intro">
          <span>{{ t('login.visualEyebrow') }}</span>
          <h2>{{ t('login.visualTitle') }}</h2>
          <p>{{ t('login.visualDescription') }}</p>
        </div>

        <div class="dashboard-preview">
          <aside class="preview-sidebar">
            <div class="preview-logo"><ShieldCheck :size="22" /></div>
            <div class="preview-nav preview-nav-active"><LayoutDashboard :size="18" /></div>
            <div class="preview-nav"><UsersRound :size="18" /></div>
            <div class="preview-nav"><ShoppingBag :size="18" /></div>
            <div class="preview-nav"><BarChart3 :size="18" /></div>
            <div class="preview-nav preview-settings"><Settings :size="18" /></div>
          </aside>

          <div class="preview-main">
            <header class="preview-header">
              <div><small>{{ t('nav.overview') }}</small><strong>{{ t('dashboard.title') }}</strong></div>
              <div class="preview-user"><Bell :size="16" /><span>NA</span></div>
            </header>

            <div class="preview-stats">
              <div class="preview-stat">
                <span class="stat-icon stat-icon-violet"><BarChart3 :size="16" /></span>
                <small>{{ t('dashboard.revenue') }}</small><i class="stat-line stat-line-long" />
              </div>
              <div class="preview-stat">
                <span class="stat-icon stat-icon-blue"><ShoppingBag :size="16" /></span>
                <small>{{ t('dashboard.orders') }}</small><i class="stat-line" />
              </div>
              <div class="preview-stat">
                <span class="stat-icon stat-icon-green"><UsersRound :size="16" /></span>
                <small>{{ t('dashboard.activeUsers') }}</small><i class="stat-line stat-line-short" />
              </div>
            </div>

            <div class="preview-grid">
              <section class="preview-chart-card">
                <div class="preview-card-title"><strong>{{ t('dashboard.chartTitle') }}</strong><span>{{ t('dashboard.period') }}</span></div>
                <div class="preview-chart">
                  <span v-for="height in [28, 42, 36, 62, 52, 76, 68, 88, 74, 94]" :key="height" :style="{ height: `${height}%` }" />
                </div>
              </section>

              <section class="preview-activity-card">
                <strong>{{ t('dashboard.recentOrders') }}</strong>
                <div v-for="index in 4" :key="index" class="activity-row">
                  <span><ShoppingBag :size="14" /></span><div><i /><i /></div><b />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-card">
        <form class="auth-form" @submit.prevent="submit">
          <div class="auth-mark" aria-hidden="true">
            <ShieldCheck :size="48" :stroke-width="1.7" />
          </div>

          <div class="auth-heading">
            <h1 id="login-title">{{ t('login.panelTitle') }}</h1>
            <p>{{ t('login.description') }}</p>
          </div>

          <div class="auth-fields">
            <label class="auth-field">
              <span class="sr-only">{{ t('login.username') }}</span>
              <UserRound class="field-icon" :size="19" aria-hidden="true" />
              <Input
                v-model="email"
                type="text"
                class="auth-input"
                :placeholder="t('login.username')"
                autocomplete="username"
                required
              />
            </label>

            <label class="auth-field">
              <span class="sr-only">{{ t('login.password') }}</span>
              <LockKeyhole class="field-icon" :size="19" aria-hidden="true" />
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="auth-input auth-input-password"
                :placeholder="t('login.password')"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="t(showPassword ? 'login.hidePassword' : 'login.showPassword')"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="19" aria-hidden="true" />
                <Eye v-else :size="19" aria-hidden="true" />
              </button>
            </label>
          </div>

          <div class="auth-options">
            <label class="remember-option">
              <input v-model="rememberMe" type="checkbox" />
              <span>{{ t('login.remember') }}</span>
            </label>
            <button type="button" class="forgot-password">{{ t('login.forgot') }}</button>
          </div>

          <p v-if="error" class="auth-error" role="alert">{{ error }}</p>

          <Button class="auth-submit" type="submit" :disabled="loading" :aria-busy="loading">
            {{ t(loading ? 'login.submitting' : 'login.submit') }}
          </Button>

          <div class="security-note">
            <span />
            <div><ShieldCheck :size="15" aria-hidden="true" />{{ t('login.secure') }}</div>
            <span />
          </div>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100svh;
  padding: clamp(18px, 2.4vw, 34px);
  overflow: hidden;
  color: #111a35;
  background: radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.92), transparent 29%), linear-gradient(135deg, #f2f5ff 0%, #edf1ff 48%, #f8f9fd 100%);
}

.auth-shell {
  width: min(100%, 1440px);
  min-height: calc(100svh - clamp(36px, 4.8vw, 68px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(440px, 0.92fr);
  gap: clamp(18px, 2.2vw, 34px);
}

.auth-visual {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  isolation: isolate;
  border-radius: 28px;
  background: radial-gradient(circle at 75% 66%, rgba(100, 117, 241, 0.13), transparent 37%);
}
.auth-visual::before {
  position: absolute;
  width: 620px;
  height: 620px;
  right: -160px;
  bottom: -250px;
  content: '';
  border: 1px solid rgba(91, 109, 224, 0.12);
  border-radius: 50%;
  box-shadow: 0 0 0 80px rgba(91, 109, 224, 0.025), 0 0 0 160px rgba(91, 109, 224, 0.018);
  z-index: -1;
}

.visual-intro { position: absolute; top: 7%; left: 6%; max-width: 540px; z-index: 3; }
.visual-intro span { display: inline-flex; align-items: center; gap: 8px; color: #5269df; font-size: 10px; font-weight: 750; letter-spacing: 0.16em; }
.visual-intro span::before { width: 18px; height: 2px; content: ''; border-radius: 999px; background: #5269df; }
.visual-intro h2 { margin: 13px 0 9px; color: #17213d; font-size: clamp(27px, 2.4vw, 36px); line-height: 1.08; letter-spacing: -0.035em; }
.visual-intro p { max-width: 470px; margin: 0; color: #707d9c; font-size: 13px; line-height: 1.65; }

.dashboard-preview { position: absolute; left: 50%; top: 61%; width: min(94%, 780px); aspect-ratio: 1.38; display: grid; grid-template-columns: 72px 1fr; overflow: hidden; border: 1px solid rgba(207, 214, 238, 0.9); border-radius: 21px; background: #f7f8fd; box-shadow: 0 28px 65px rgba(55, 68, 137, 0.16), 0 2px 8px rgba(55, 68, 137, 0.06); transform: translate(-50%, -50%); animation: dashboard-float 8s ease-in-out infinite; z-index: 2; }
.preview-sidebar { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 18px 12px; color: #8190b1; background: #17213c; }
.preview-logo { width: 40px; height: 40px; margin-bottom: 15px; display: grid; place-items: center; border-radius: 12px; color: #fff; background: #4c66ec; }
.preview-nav { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 11px; }
.preview-nav-active { color: #fff; background: linear-gradient(145deg, #5a74f3, #4059dd); box-shadow: 0 8px 18px rgba(52, 72, 183, 0.36); animation: nav-glow 3s ease-in-out infinite; }
.preview-settings { margin-top: auto; }
.preview-main { min-width: 0; padding: 24px; }
.preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.preview-header > div:first-child { display: grid; gap: 3px; }
.preview-header small { color: #8b95ad; font-size: 10px; }
.preview-header strong { color: #202a47; font-size: 19px; }
.preview-user { display: flex; align-items: center; gap: 13px; color: #8b95ad; }
.preview-user span { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: #5a6fe7; font-size: 10px; font-weight: 700; }

.preview-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 13px; }
.preview-stat { min-height: 94px; padding: 14px; border: 1px solid #e8ebf3; border-radius: 14px; background: #fff; box-shadow: 0 7px 18px rgba(66, 78, 123, 0.05); }
.preview-stat small { display: block; margin: 11px 0 9px; overflow: hidden; color: #6f7a97; font-size: 9px; white-space: nowrap; text-overflow: ellipsis; }
.stat-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; }
.stat-icon-violet { color: #6256df; background: #efedff; }
.stat-icon-blue { color: #3276e8; background: #e8f1ff; }
.stat-icon-green { color: #139b78; background: #e4f8f1; }
.stat-line { display: block; width: 48%; height: 7px; border-radius: 999px; background: #dfe4f2; }
.stat-line-long { width: 64%; }
.stat-line-short { width: 39%; }

.preview-grid { margin-top: 14px; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(150px, 0.65fr); gap: 13px; }
.preview-chart-card, .preview-activity-card { min-width: 0; height: 214px; padding: 16px; border: 1px solid #e8ebf3; border-radius: 14px; background: #fff; box-shadow: 0 7px 18px rgba(66, 78, 123, 0.05); }
.preview-card-title { display: flex; align-items: center; justify-content: space-between; }
.preview-card-title strong, .preview-activity-card > strong { color: #303a56; font-size: 10px; }
.preview-card-title span { color: #8b95ad; font-size: 8px; }
.preview-chart { height: 157px; margin-top: 16px; display: flex; align-items: end; gap: 7px; border-bottom: 1px solid #edf0f6; background: repeating-linear-gradient(to bottom, #edf0f6 0, #edf0f6 1px, transparent 1px, transparent 38px); }
.preview-chart span { flex: 1; min-width: 5px; border-radius: 5px 5px 1px 1px; background: linear-gradient(to top, #4b63e9, #9baaff); box-shadow: 0 5px 12px rgba(75, 99, 233, 0.16); transform-origin: bottom; animation: chart-breathe 3.6s ease-in-out infinite; }
.preview-chart span:nth-child(2n) { animation-delay: -1.2s; }
.preview-chart span:nth-child(3n) { animation-delay: -2.1s; }
.preview-activity-card { display: flex; flex-direction: column; gap: 15px; }
.activity-row { display: grid; grid-template-columns: 28px 1fr 22px; align-items: center; gap: 8px; }
.activity-row > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: #6575ce; background: #eef1ff; }
.activity-row div { display: grid; gap: 5px; }
.activity-row i { height: 5px; border-radius: 999px; background: #dfe4f0; }
.activity-row i:last-child { width: 61%; }
.activity-row b { height: 6px; border-radius: 999px; background: #b9c3e4; }

@keyframes dashboard-float {
  0%, 100% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, calc(-50% - 5px)); }
}
@keyframes chart-breathe { 0%, 100% { transform: scaleY(0.92); opacity: 0.82; } 50% { transform: scaleY(1); opacity: 1; } }
@keyframes nav-glow { 0%, 100% { box-shadow: 0 8px 18px rgba(52, 72, 183, 0.28); } 50% { box-shadow: 0 8px 24px rgba(85, 109, 241, 0.55); } }

@media (prefers-reduced-motion: reduce) {
  .dashboard-preview,
  .preview-nav-active,
  .preview-chart span { animation: none; }
}

.auth-card {
  min-height: 620px;
  display: grid;
  place-items: center;
  padding: clamp(36px, 5vw, 76px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: clamp(22px, 2vw, 30px);
  background: rgba(255, 255, 255, 0.91);
  box-shadow: 0 28px 80px rgba(63, 74, 128, 0.1);
  backdrop-filter: blur(18px);
}

.auth-form { width: min(100%, 470px); }
.auth-mark { width: 74px; height: 74px; margin: 0 auto 20px; display: grid; place-items: center; color: #4664ef; }
.auth-heading { margin-bottom: 38px; text-align: center; }
.auth-heading h1 { margin: 0 0 9px; color: #111a35 !important; font-size: clamp(32px, 3vw, 42px); line-height: 1.05; letter-spacing: -0.04em; }
.auth-heading p { margin: 0; color: #77819b; font-size: 15px; }
.auth-fields { display: grid; gap: 18px; }
.auth-field { position: relative; display: block; }
.field-icon { position: absolute; left: 18px; top: 50%; z-index: 2; color: #707b96; transform: translateY(-50%); }

.auth-input.ui-input {
  width: 100%;
  height: 58px;
  padding: 0 50px;
  color: #18213b;
  border: 1px solid #d6dcea;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 7px rgba(41, 53, 101, 0.025);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.auth-input.ui-input::placeholder { color: #7b849d; opacity: 1; }
.auth-input.ui-input:focus { border-color: #5570ef; box-shadow: 0 0 0 3px rgba(70, 100, 239, 0.12); }
.auth-input-password.ui-input { padding-right: 54px; }

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  z-index: 2;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: #66718c;
  background: transparent;
  transform: translateY(-50%);
}
.password-toggle:hover { color: #4664ef; background: #f1f4ff; }

.auth-options { margin: 20px 0 28px; display: flex; align-items: center; justify-content: space-between; gap: 18px; font-size: 14px; }
.remember-option { display: inline-flex; align-items: center; gap: 9px; color: #4d5873; cursor: pointer; }
.remember-option input { width: 17px; height: 17px; margin: 0; accent-color: #4664ef; }
.forgot-password { padding: 3px 0; border: 0; color: #4664ef; background: transparent; font-size: inherit; font-weight: 500; }
.forgot-password:hover { text-decoration: underline; }
.auth-error { margin: -10px 0 16px; color: #dc2626; font-size: 13px; text-align: center; }

.auth-submit.ui-button {
  width: 100%;
  height: 58px;
  border: 0;
  border-radius: 8px;
  color: #fff !important;
  background: linear-gradient(100deg, #4963eb, #3f56e8) !important;
  box-shadow: 0 13px 26px rgba(67, 89, 229, 0.2);
  font-size: 16px;
  font-weight: 650;
}
.auth-submit.ui-button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); }
.auth-submit.ui-button:disabled { cursor: wait; opacity: 0.68; }

.security-note { margin-top: 39px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; color: #7d879e; font-size: 13px; }
.security-note > span { height: 1px; background: #e1e5ee; }
.security-note div { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@media (max-width: 1050px) {
  .auth-shell { grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr); }
  .dashboard-preview { width: 106%; }
  .auth-card { padding-inline: 42px; }
}

@media (max-width: 820px) {
  .auth-page { display: grid; place-items: center; overflow: auto; }
  .auth-shell { min-height: 0; grid-template-columns: 1fr; }
  .auth-visual { display: none; }
  .auth-card { width: min(100%, 560px); min-height: min(680px, calc(100svh - 36px)); margin: 0 auto; padding: 44px 32px; }
}

@media (max-width: 480px) {
  .auth-page { padding: 0; background: #fff; }
  .auth-card { min-height: 100svh; padding: 34px 22px; border: 0; border-radius: 0; box-shadow: none; }
  .auth-mark { width: 62px; height: 62px; margin-bottom: 14px; }
  .auth-heading { margin-bottom: 30px; }
  .auth-heading h1 { font-size: 32px; }
  .auth-options { font-size: 13px; }
}

/* Login yüzeyinde tema kaynaklı açık metinleri engelle ve köşeleri tek ölçüde tut. */
.auth-card { color: #111a35 !important; }
.auth-heading h1 { color: #111a35 !important; -webkit-text-fill-color: #111a35; }
.auth-heading p { color: #66728f !important; -webkit-text-fill-color: #66728f; }
.auth-input.ui-input { color: #18213b !important; -webkit-text-fill-color: #18213b; }
.auth-input.ui-input::placeholder { color: #7b849d !important; -webkit-text-fill-color: #7b849d; }
.remember-option,
.remember-option span { color: #4d5873 !important; -webkit-text-fill-color: #4d5873; }
.forgot-password { color: #405ee8 !important; -webkit-text-fill-color: #405ee8; }
.security-note,
.security-note div { color: #6f7a94 !important; -webkit-text-fill-color: #6f7a94; }
.auth-error { color: #dc2626 !important; -webkit-text-fill-color: #dc2626; }
.auth-submit.ui-button { color: #fff !important; -webkit-text-fill-color: #fff; }

.auth-page,
.auth-page *,
.auth-page *::before,
.auth-page *::after {
  border-radius: 2.5px !important;
}

/* Login de uygulamanın ortak açık/koyu tema tokenlarını kullanır. */
.auth-page {
  color: var(--foreground) !important;
  background: radial-gradient(circle at 14% 12%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 30%), var(--background) !important;
}
.auth-visual { background: radial-gradient(circle at 75% 66%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 38%) !important; }
.auth-visual::before { border-color: color-mix(in srgb, var(--accent) 18%, transparent); box-shadow: 0 0 0 80px color-mix(in srgb, var(--accent) 3%, transparent), 0 0 0 160px color-mix(in srgb, var(--accent) 2%, transparent); }
.visual-intro span { color: var(--accent) !important; }
.visual-intro span::before { background: var(--accent) !important; }
.visual-intro h2 { color: var(--foreground) !important; }
.visual-intro p { color: var(--muted) !important; }

.dashboard-preview { background: var(--surface-soft) !important; border-color: var(--border) !important; box-shadow: 0 24px 54px color-mix(in srgb, var(--foreground) 12%, transparent) !important; }
.preview-sidebar { color: var(--muted) !important; background: var(--preview-sidebar) !important; }
.preview-logo,
.preview-nav-active { color: var(--primary-foreground) !important; background: var(--primary) !important; box-shadow: none !important; }
.preview-main,
.preview-stat,
.preview-chart-card,
.preview-activity-card { color: var(--foreground) !important; background: var(--surface) !important; border-color: var(--border) !important; box-shadow: none !important; }
.preview-header small,
.preview-stat small,
.preview-card-title span { color: var(--muted) !important; }
.preview-header strong,
.preview-card-title strong,
.preview-activity-card > strong { color: var(--foreground) !important; }
.preview-user { color: var(--muted) !important; }
.preview-user span { color: var(--primary-foreground) !important; background: var(--primary) !important; }
.stat-icon-violet,
.stat-icon-blue,
.stat-icon-green,
.activity-row > span { color: var(--accent) !important; background: color-mix(in srgb, var(--accent) 12%, var(--surface-soft)) !important; }
.stat-line,
.activity-row i,
.activity-row b { background: var(--border) !important; }
.preview-chart { border-color: var(--border) !important; background: repeating-linear-gradient(to bottom, var(--border) 0, var(--border) 1px, transparent 1px, transparent 38px) !important; }
.preview-chart span { background: linear-gradient(to top, var(--chart-end), var(--chart-start)) !important; }

.auth-card { color: var(--foreground) !important; background: var(--surface) !important; border-color: transparent !important; box-shadow: 0 24px 60px color-mix(in srgb, var(--foreground) 9%, transparent) !important; }
.auth-mark { color: var(--accent) !important; }
.auth-heading h1 { color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground); }
.auth-heading p { color: var(--muted) !important; -webkit-text-fill-color: var(--muted); }
.auth-input.ui-input { color: var(--foreground) !important; background: var(--surface-soft) !important; border-color: var(--border) !important; -webkit-text-fill-color: var(--foreground); }
.auth-input.ui-input::placeholder { color: var(--muted) !important; -webkit-text-fill-color: var(--muted); }
.field-icon,
.password-toggle { color: var(--muted) !important; }
.password-toggle:hover { color: var(--foreground) !important; background: var(--surface-soft) !important; }
.remember-option,
.remember-option span { color: var(--foreground) !important; -webkit-text-fill-color: var(--foreground); }
.forgot-password { color: var(--accent) !important; -webkit-text-fill-color: var(--accent); }
.security-note,
.security-note div { color: var(--muted) !important; -webkit-text-fill-color: var(--muted); }
.security-note > span { background: var(--border) !important; }
.auth-submit.ui-button { color: var(--primary-foreground) !important; background: var(--primary) !important; border-color: var(--primary) !important; -webkit-text-fill-color: var(--primary-foreground); box-shadow: none !important; }
</style>
