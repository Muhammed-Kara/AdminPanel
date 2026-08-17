import { createI18n } from 'vue-i18n'
import tr from './locales/tr.json'
import en from './locales/en.json'

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('vue-admin-locale') ?? 'tr',
  fallbackLocale: 'en',
  messages: { tr, en },
})

