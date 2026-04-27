import i18next from 'i18next'
import { LanguageDetector } from 'i18next-http-middleware'

import enCommon from '../locales/en/common.json'
import arCommon from '../locales/ar/common.json'

// Initialize i18next
i18next.use(LanguageDetector).init({
  resources: {
    en: {
      common: enCommon,
    },
    ar: {
      common: arCommon,
    },
  },
  fallbackLng: 'ar',
  preload: ['en', 'ar'],
  detection: {
    order: ['header'],
    caches: false,
  },
  ns: ['common'],
  defaultNS: 'common',
})

export default i18next
