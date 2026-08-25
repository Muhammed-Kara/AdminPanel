<script setup lang="ts">
import { ref } from 'vue'
import { Check, KeyRound, LogOut, Moon, Palette, Sparkles, Sun, Trash2, Upload, User } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useThemeStore } from '@/store/theme'

const theme = useThemeStore()
const { t, locale } = useI18n()
const activeTab = ref<'appearance' | 'profile' | 'general'>('appearance')

// Profile State
const avatarUrl = ref<string | null>(localStorage.getItem('vue-admin-user-avatar'))
const fullName = ref(localStorage.getItem('vue-admin-user-name') || 'Admin User')
const email = ref(localStorage.getItem('vue-admin-user-email') || 'admin@example.com')
const role = ref('Sistem Yöneticisi')
const fileInput = ref<HTMLInputElement | null>(null)

// Password State
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const twoFactor = ref(true)

function setLocale(value: string) {
  locale.value = value
  localStorage.setItem('vue-admin-locale', value)
  toast.success(t('toast.appearanceUpdated'))
}

function triggerAvatarUpload() {
  fileInput.value?.click()
}

function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      avatarUrl.value = result
      localStorage.setItem('vue-admin-user-avatar', result)
      toast.success(t('toast.avatarUpdated'))
    }
    reader.readAsDataURL(file)
  }
}

function removeAvatar() {
  avatarUrl.value = null
  localStorage.removeItem('vue-admin-user-avatar')
  if (fileInput.value) fileInput.value.value = ''
  toast.success(t('toast.avatarRemoved'))
}

function savePersonalInfo() {
  localStorage.setItem('vue-admin-user-name', fullName.value)
  localStorage.setItem('vue-admin-user-email', email.value)
  toast.success(t('toast.profileUpdated'))
}

function updatePassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    toast.error(t('toast.passwordMinLength'))
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error(t('toast.passwordMismatch'))
    return
  }
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  toast.success(t('toast.passwordUpdated'))
}

function logoutOtherDevices() {
  toast.success(t('common.actions') + ': Tüm cihaz oturumları sonlandırıldı.')
}
</script>

<template>
  <PageHeader :title="t('settings.title')" :description="t('settings.description')" />

  <!-- Settings Top Navbar (3 Tabs) -->
  <nav class="settings-nav-bar" aria-label="Settings Navigation">
    <button
      type="button"
      :class="{ active: activeTab === 'appearance' }"
      @click="activeTab = 'appearance'"
    >
      <Palette :size="16" /> {{ t('settings.themeTab') }}
    </button>
    <button
      type="button"
      :class="{ active: activeTab === 'profile' }"
      @click="activeTab = 'profile'"
    >
      <User :size="16" /> {{ t('settings.profileTab') }}
    </button>
    <button
      type="button"
      :class="{ active: activeTab === 'general' }"
      @click="activeTab = 'general'"
    >
      <Sparkles :size="16" /> {{ t('settings.generalTab') }}
    </button>
  </nav>

  <div class="settings-grid">
    <!-- Tab 1: Görünüm ve Tema -->
    <div v-if="activeTab === 'appearance'" class="appearance-content">
      <!-- Tema Modu (Light / Dark) -->
      <div class="appearance-setting">
        <div><strong>{{ t('settings.theme') }}</strong><span>{{ t('settings.themeDesc') }}</span></div>
        <div class="theme-mode-toggle">
          <button
            type="button"
            class="mode-card"
            :class="{ active: !theme.isDark }"
            :aria-pressed="!theme.isDark"
            @click="theme.setDark(false)"
          >
            <div class="mode-icon-box"><Sun :size="18" /></div>
            <div class="mode-info">
              <strong>{{ t('settings.light') }}</strong>
            </div>
            <div v-if="!theme.isDark" class="mode-check"><Check :size="13" /></div>
          </button>

          <button
            type="button"
            class="mode-card"
            :class="{ active: theme.isDark }"
            :aria-pressed="theme.isDark"
            @click="theme.setDark(true)"
          >
            <div class="mode-icon-box"><Moon :size="18" /></div>
            <div class="mode-info">
              <strong>{{ t('settings.dark') }}</strong>
            </div>
            <div v-if="theme.isDark" class="mode-check"><Check :size="13" /></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 2: Profil Ayarları -->
    <div v-else-if="activeTab === 'profile'" class="appearance-content profile-tab-content">
      <!-- Profil Fotoğrafı (Avatar) -->
      <div class="appearance-setting">
        <div>
          <strong>{{ t('settings.profile.avatar') }}</strong>
          <span>{{ t('settings.profile.avatarDesc') }}</span>
        </div>
        <div class="avatar-upload-box">
          <div class="avatar-preview">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" />
            <span v-else>AD</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden-file-input"
            @change="handleAvatarUpload"
          />
          <div class="avatar-actions">
            <button type="button" class="primary-button small-btn" @click="triggerAvatarUpload">
              <Upload :size="14" /> {{ t('settings.profile.upload') }}
            </button>
            <button v-if="avatarUrl" type="button" class="secondary-button small-btn danger-text" @click="removeAvatar">
              <Trash2 :size="14" /> {{ t('settings.profile.remove') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Kişisel Bilgiler -->
      <div class="appearance-setting profile-form-setting">
        <div>
          <strong>{{ t('settings.profile.fullName') }} &amp; {{ t('settings.profile.email') }}</strong>
          <span>{{ t('settings.profile.saveInfo') }}</span>
        </div>
        <form class="profile-form-grid" @submit.prevent="savePersonalInfo">
          <div class="form-field">
            <label>{{ t('settings.profile.fullName') }}</label>
            <input v-model="fullName" type="text" class="ui-input" required />
          </div>
          <div class="form-field">
            <label>{{ t('settings.profile.email') }}</label>
            <input v-model="email" type="email" class="ui-input" required />
          </div>
          <div class="form-field">
            <label>{{ t('settings.profile.role') }}</label>
            <input v-model="role" type="text" class="ui-input" />
          </div>
          <div class="form-action-row">
            <button type="submit" class="primary-button">
              {{ t('settings.profile.saveInfo') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Şifre Değiştirme -->
      <div class="appearance-setting profile-form-setting">
        <div>
          <strong>{{ t('settings.profile.passwordTitle') }}</strong>
          <span>{{ t('settings.profile.passwordDesc') }}</span>
        </div>
        <form class="profile-form-grid" @submit.prevent="updatePassword">
          <div class="form-field">
            <label>{{ t('settings.profile.currentPassword') }}</label>
            <input v-model="currentPassword" type="password" class="ui-input" required />
          </div>
          <div class="form-field">
            <label>{{ t('settings.profile.newPassword') }}</label>
            <input v-model="newPassword" type="password" class="ui-input" required minlength="6" />
          </div>
          <div class="form-field">
            <label>{{ t('settings.profile.confirmPassword') }}</label>
            <input v-model="confirmPassword" type="password" class="ui-input" required minlength="6" />
          </div>
          <div class="form-action-row">
            <button type="submit" class="secondary-button">
              <KeyRound :size="14" /> {{ t('settings.profile.updatePassword') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Güvenlik & Oturumlar -->
      <div class="appearance-setting">
        <div>
          <strong>{{ t('settings.profile.securityTitle') }}</strong>
          <span>{{ t('settings.profile.securityDesc') }}</span>
        </div>
        <div class="security-actions-grid">
          <div class="two-factor-row">
            <div>
              <strong>{{ t('settings.profile.twoFactor') }}</strong>
              <span>{{ t('settings.profile.twoFactorDesc') }}</span>
            </div>
            <button
              type="button"
              class="switch"
              :class="{ on: twoFactor }"
              @click="twoFactor = !twoFactor; toast.success(twoFactor ? '2FA Aktif edildi.' : '2FA Devre dışı.')"
            >
              <i />
            </button>
          </div>
          <button type="button" class="secondary-button danger-text-btn" @click="logoutOtherDevices">
            <LogOut :size="14" /> {{ t('settings.profile.logoutOther') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 3: Genel Ayarlar -->
    <div v-else-if="activeTab === 'general'" class="appearance-content">
      <div class="appearance-setting">
        <div><strong>{{ t('settings.language') }}</strong><span>{{ t('settings.languageDesc') }}</span></div>
        <select :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value)">
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  </div>
</template>
