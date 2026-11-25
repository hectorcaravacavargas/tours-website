import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import es from '../locales/es.json'

const SUPPORTED = ['es', 'en']

/*
 * First language, in order: ?lang=en|es (lets each QR code pick one, and is remembered),
 * the visitor's earlier choice, then the phone's language (Airbnb guests are often English speakers).
 */
function initialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (SUPPORTED.includes(fromUrl)) {
    localStorage.setItem('lang', fromUrl)
    return fromUrl
  }
  const saved = localStorage.getItem('lang')
  if (SUPPORTED.includes(saved)) return saved
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

/* Keep <html lang> right for screen readers, translation prompts and hyphenation */
document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lng) => { document.documentElement.lang = lng })

export default i18n
