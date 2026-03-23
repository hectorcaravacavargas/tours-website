import { useLanguage } from '../hooks/useLanguage'

export function LanguageToggle({ variant = 'default' }) {
  const { language, toggleLanguage } = useLanguage()
  const next = language === 'es' ? 'EN' : 'ES'

  if (variant === 'navbar') {
    return (
      <button
        onClick={toggleLanguage}
        className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors"
      >
        {next}
      </button>
    )
  }

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm font-medium transition-colors"
    >
      {next}
    </button>
  )
}
