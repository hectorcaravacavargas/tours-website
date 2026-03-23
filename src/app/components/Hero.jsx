import { useTranslation } from 'react-i18next'

/*
 * Imágenes locales — agregá en src/assets/:
 *   horse1.jpg  → columna izquierda  (solo desktop)
 *   horse2.jpg  → columna central    (visible en mobile y desktop)
 *   horse3.jpg  → columna derecha    (solo desktop)
 *
 * Por ahora usamos hero.png como placeholder para las 3.
 */
import horse1 from '../../assets/hero.png'
import horse2 from '../../assets/hero.png'
import horse3 from '../../assets/hero.png'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section
      id="home"
      className="h-screen bg-forest-950
                 flex gap-2.5
                 p-0 md:p-2.5"
    >
      {/* ── Columna izquierda — solo desktop ───── */}
      <div className="hidden md:block md:w-[28%] relative rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={horse1}
          alt="Tour a caballo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/30 to-transparent" />
      </div>

      {/* ── Columna central — visible siempre ──── */}
      <div className="flex-1 relative md:rounded-2xl overflow-hidden">
        <img
          src={horse2}
          alt="Tour de Caballos El Abanico"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-5 px-6 md:px-8 text-center">
          {/* Badge */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/15 rounded-full px-4 md:px-5 py-1.5 md:py-2">
            <span className="text-white/60 text-xs">✦</span>
            <span className="text-white/80 text-xs md:text-sm font-medium tracking-wide">
              {t('hero.badge')}
            </span>
          </div>

          {/* Título */}
          <div className="space-y-0.5">
            <h1
              className="font-heading text-white font-bold leading-tight"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 4rem)' }}
            >
              {t('hero.title')}
            </h1>
            <h2
              className="font-heading text-forest-300 font-bold leading-tight"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 4rem)' }}
            >
              {t('hero.name')}
            </h2>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 mt-1">
            <a
              href="#contact"
              className="bg-forest-500 hover:bg-forest-400 text-white font-semibold px-6 md:px-7 py-3 rounded-full transition-colors duration-200 shadow-lg shadow-forest-900/50 text-sm md:text-base"
            >
              {t('hero.bookNow')}
            </a>
            <a
              href="#tours"
              className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-semibold px-6 md:px-7 py-3 rounded-full border border-white/25 transition-colors duration-200 text-sm md:text-base"
            >
              {t('hero.viewTours')}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* ── Columna derecha — solo desktop ──────── */}
      <div className="hidden md:block md:w-[28%] relative rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={horse3}
          alt="Tour a caballo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-forest-950/30 to-transparent" />
      </div>
    </section>
  )
}
