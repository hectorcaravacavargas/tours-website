import { useLanguage } from '../hooks/useLanguage'

export function LanguageToggle({ variant = 'default' }) {
  const { language, toggleLanguage } = useLanguage()
  const isES = language === 'es'

  const pill = (w, h, circleSize, margin) => {
    const toRight = w - circleSize - margin
    return (
      <button
        onClick={toggleLanguage}
        aria-label={isES ? 'Switch to English' : 'Cambiar a Español'}
        style={{
          width: w,
          height: h,
          background: 'rgba(255,255,255,0.15)',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.22)',
        }}
        className="relative rounded-full flex-shrink-0 cursor-pointer focus:outline-none hover:bg-white/20 transition-colors duration-200"
      >
        <div
          style={{
            top: '50%',
            width: circleSize,
            height: circleSize,
            transform: `translate(${isES ? toRight : margin}px, -50%)`,
          }}
          className="absolute bg-white rounded-full shadow z-10 transition-transform duration-300"
        />
      </button>
    )
  }

  /* variant="compact" — mobile bar: two 40px segments, the current one highlighted */
  if (variant === 'compact') {
    const seg = (code, active) => (
      <button
        type="button"
        onClick={active ? undefined : toggleLanguage}
        aria-pressed={active}
        aria-label={code === 'es' ? 'Español' : 'English'}
        className={`w-10 h-10 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors duration-200
                    ${active ? 'bg-white/15 text-white' : 'text-white/50'}`}
      >
        {code}
      </button>
    )
    return (
      <div role="group" aria-label="Idioma / Language" className="flex items-center rounded-xl border border-forest-600/40 bg-forest-800/60 p-0.5">
        {seg('es', isES)}
        {seg('en', !isES)}
      </div>
    )
  }

  if (variant === 'navbar') {
    return (
      /* Ancho fijo para que el cambio de idioma no mueva el layout */
      <div className="flex items-center gap-2 w-[72px] justify-between">
        <span
          className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 w-5 text-center ${
            !isES ? 'text-white' : 'text-white/35'
          }`}
        >
          EN
        </span>

        {pill(36, 18, 14, 2)}

        <span
          className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-200 w-5 text-center ${
            isES ? 'text-white' : 'text-white/35'
          }`}
        >
          ES
        </span>
      </div>
    )
  }

  /* variant="default" — dropdown mobile */
  return (
    <div className="flex items-center gap-2.5 w-[82px] justify-between">
      <span
        className={`text-sm font-bold tracking-widest uppercase transition-colors duration-200 w-5 text-center ${
          !isES ? 'text-white' : 'text-white/40'
        }`}
      >
        EN
      </span>

      {pill(42, 22, 18, 2)}

      <span
        className={`text-sm font-bold tracking-widest uppercase transition-colors duration-200 w-5 text-center ${
          isES ? 'text-white' : 'text-white/40'
        }`}
      >
        ES
      </span>
    </div>
  )
}
