<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Check,
  Crop,
  KeyRound,
  LogOut,
  Moon,
  Palette,
  RotateCw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  User,
  X
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useThemeStore } from '@/store/theme'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const theme = useThemeStore()
const auth = useAuthStore()
const { t, locale } = useI18n()

const activeTab = ref<'appearance' | 'profile' | 'general'>('appearance')

// Sync tab state with route query param (?tab=profile etc.)
watch(
  () => route.query.tab,
  (tabQuery) => {
    if (tabQuery === 'profile' || tabQuery === 'appearance' || tabQuery === 'general') {
      activeTab.value = tabQuery
    }
  },
  { immediate: true }
)

function switchTab(tab: 'appearance' | 'profile' | 'general') {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

// Profile State synced with Auth Store
const fullName = ref(auth.user?.name || t('roles.admin'))
const email = ref(auth.user?.email || '')
const role = ref(auth.user?.role || t('roles.admin'))
const avatarUrl = ref<string | null>(auth.user?.avatar || null)
const fileInput = ref<HTMLInputElement | null>(null)

watch(
  () => auth.user,
  (u) => {
    if (u) {
      fullName.value = u.name || ''
      email.value = u.email || ''
      role.value = u.role || ''
      avatarUrl.value = u.avatar || null
    }
  },
  { deep: true, immediate: true }
)

const userInitials = computed(() => {
  const name = fullName.value || t('roles.admin')
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// Crop Modal State & Functions
const isCropModalOpen = ref(false)
const rawImageSrc = ref<string | null>(null)
const zoomScale = ref(1)
const cropRotation = ref(0)
const cropOffsetX = ref(0)
const cropOffsetY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

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
      rawImageSrc.value = result
      zoomScale.value = 1
      cropRotation.value = 0
      cropOffsetX.value = 0
      cropOffsetY.value = 0
      isCropModalOpen.value = true
    }
    reader.readAsDataURL(file)
  }
}

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  dragStart.value = { x: clientX - cropOffsetX.value, y: clientY - cropOffsetY.value }
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  cropOffsetX.value = clientX - dragStart.value.x
  cropOffsetY.value = clientY - dragStart.value.y
}

function stopDrag() {
  isDragging.value = false
}

function rotateImage() {
  cropRotation.value = (cropRotation.value + 90) % 360
}

function saveCroppedImage() {
  if (!rawImageSrc.value) return

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const size = 300
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, size, size)
    ctx.save()

    // Move origin to center of canvas
    ctx.translate(size / 2, size / 2)
    ctx.rotate((cropRotation.value * Math.PI) / 180)
    ctx.scale(zoomScale.value, zoomScale.value)

    const aspect = img.width / img.height
    let drawW = size
    let drawH = size
    if (aspect > 1) {
      drawW = size * aspect
    } else {
      drawH = size / aspect
    }

    ctx.drawImage(
      img,
      -drawW / 2 + cropOffsetX.value,
      -drawH / 2 + cropOffsetY.value,
      drawW,
      drawH
    )
    ctx.restore()

    const croppedResult = canvas.toDataURL('image/png')
    avatarUrl.value = croppedResult
    auth.updateUser({ avatar: croppedResult })
    isCropModalOpen.value = false
    rawImageSrc.value = null
    if (fileInput.value) fileInput.value.value = ''
    toast.success(t('toast.avatarCropped'))
  }
  img.src = rawImageSrc.value
}

function removeAvatar() {
  avatarUrl.value = null
  auth.updateUser({ avatar: undefined })
  if (fileInput.value) fileInput.value.value = ''
  toast.success(t('toast.avatarRemoved'))
}

function savePersonalInfo() {
  if (!fullName.value.trim() || !email.value.trim()) {
    toast.error(t('login.required') || 'Lütfen gerekli alanları doldurun.')
    return
  }

  auth.updateUser({
    name: fullName.value.trim(),
    email: email.value.trim(),
    role: role.value.trim(),
  })
  toast.success(t('toast.profileUpdated'))
}

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

function updatePassword() {
  if (!currentPassword.value) {
    toast.error('Lütfen mevcut şifrenizi girin.')
    return
  }
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
  toast.success(t('toast.sessionsClosed'))
}
</script>

<template>
  <PageHeader :title="t('settings.title')" :description="t('settings.description')" />

  <!-- Settings Top Navbar (3 Tabs) -->
  <nav class="settings-nav-bar" :aria-label="t('settings.navigationLabel')">
    <button
      type="button"
      :class="{ active: activeTab === 'appearance' }"
      @click="switchTab('appearance')"
    >
      <Palette :size="16" /> {{ t('settings.themeTab') }}
    </button>
    <button
      type="button"
      :class="{ active: activeTab === 'profile' }"
      @click="switchTab('profile')"
    >
      <User :size="16" /> {{ t('settings.profileTab') }}
    </button>
    <button
      type="button"
      :class="{ active: activeTab === 'general' }"
      @click="switchTab('general')"
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
            <img v-if="avatarUrl" :src="avatarUrl" :alt="t('settings.profile.avatar')" />
            <span v-else>{{ userInitials }}</span>
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
              @click="twoFactor = !twoFactor; toast.success(t(twoFactor ? 'toast.twoFactorEnabled' : 'toast.twoFactorDisabled'))"
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

  <!-- Image Cropper Dialog Modal -->
  <div v-if="isCropModalOpen" class="dialog-layer" @click.self="isCropModalOpen = false">
    <div class="crop-modal-card">
      <div class="crop-modal-header">
        <h3>{{ t('settings.profile.cropTitle') }}</h3>
        <button type="button" class="crop-modal-close" :aria-label="t('common.close')" @click="isCropModalOpen = false">
          <X :size="18" />
        </button>
      </div>

      <div class="crop-modal-body">
        <!-- Drag & Pan Workspace -->
        <div
          class="crop-workspace"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          @touchstart="startDrag"
          @touchmove="onDrag"
          @touchend="stopDrag"
        >
          <img
            v-if="rawImageSrc"
            :src="rawImageSrc"
            class="crop-preview-img"
            :style="{
              transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) rotate(${cropRotation}deg) scale(${zoomScale})`,
              width: '100%'
            }"
            :alt="t('settings.profile.cropPreview')"
          />
          <div class="crop-circle-mask" />
        </div>

        <!-- Adjustment Controls (Zoom & Rotate) -->
        <div class="crop-controls">
          <div class="crop-control-row">
            <label>{{ t('settings.profile.zoom') }}: {{ Math.round(zoomScale * 100) }}%</label>
            <input
              v-model.number="zoomScale"
              type="range"
              min="1"
              max="3"
              step="0.05"
              class="crop-slider"
            />
          </div>
          <div class="crop-control-row">
            <span>{{ t('settings.profile.rotation') }}: {{ cropRotation }}°</span>
            <button type="button" class="secondary-button small-btn" @click="rotateImage">
              <RotateCw :size="14" /> {{ t('settings.profile.rotate') }}
            </button>
          </div>
        </div>
      </div>

      <div class="crop-modal-footer">
        <button type="button" class="secondary-button" @click="isCropModalOpen = false">
          {{ t('common.cancel') }}
        </button>
        <button type="button" class="primary-button" @click="saveCroppedImage">
          <Crop :size="15" /> {{ t('settings.profile.cropSave') }}
        </button>
      </div>
    </div>
  </div>
</template>
