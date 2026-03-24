import { useTranslation } from 'react-i18next'

import image1 from '../../assets/hero.png'


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
          src={image1}
          alt="Tour a caballo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/30 to-transparent" />
      </div>

      {/* ── Columna central — visible siempre ──── */}
      <div className="flex-1 relative md:rounded-2xl overflow-hidden">
        <img
          src={image1}
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

          {/* Botones — min-w fijo para evitar layout shift al cambiar idioma */}
          <div className="flex items-center gap-3 mt-1">
            <a
              href="#contact"
              className="min-w-[158px] flex items-center justify-center bg-forest-500 hover:bg-forest-400 text-white font-semibold px-6 md:px-7 py-3 rounded-full transition-colors duration-200 shadow-lg shadow-forest-900/50 text-sm md:text-base whitespace-nowrap"
            >
              {t('hero.bookNow')}
            </a>
            <a
              href="#tours"
              className="min-w-[120px] flex items-center justify-center bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-semibold px-6 md:px-7 py-3 rounded-full border border-white/25 transition-colors duration-200 text-sm md:text-base whitespace-nowrap"
            >
              {t('hero.viewTours')}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => {
            const tours = document.getElementById('tours')
            if (!tours) return
            tours.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          aria-label="Scroll to tours"
          className="absolute bottom-6 left-1/2 -translate-x-1/2
                     group flex flex-col items-center gap-1 cursor-pointer
                     focus:outline-none"
        >
          {/* Píldora con blur + rebote */}
          <span
            className="flex items-center justify-center
                       w-10 h-10 rounded-full
                       bg-white/10 backdrop-blur-md
                       border border-white/20
                       shadow-lg shadow-black/20
                       text-white/50 group-hover:text-white
                       group-hover:bg-white/20 group-hover:border-white/40
                       group-hover:shadow-xl group-hover:shadow-black/30
                       transition-all duration-300
                       animate-bounce"
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>

      {/* ── Columna derecha — solo desktop ──────── */}
      <div className="hidden md:block md:w-[28%] relative rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={image1}
          alt="Tour a caballo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-forest-950/30 to-transparent" />
      </div>
    </section>
  )
}
