import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  volcanArenalVista,
  grupoSenderoBosque,
  grupoCruceRioPiedras,
  grupoSenderoBosquePanoramica,
  grupoCruceRioPiedrasPanoramica,
} from '../../assets'

/* position keeps the volcano / riders in frame when object-cover crops the photo.
   portrait: on upright phones the original vertical photo (~270 KB) replaces the panorama (~700 KB),
   which would be cropped to that same centre anyway. */
const SLIDES = [
  { src: volcanArenalVista,              altKey: 'media.volcanArenalVista',    position: 'center 75%' },
  { src: grupoSenderoBosquePanoramica,   portrait: grupoSenderoBosque,   altKey: 'media.grupoSenderoBosque',   position: 'center 60%' },
  { src: grupoCruceRioPiedrasPanoramica, portrait: grupoCruceRioPiedras, altKey: 'media.grupoCruceRioPiedras', position: 'center 60%' },
]

const SLIDE_MS = 6000

export function Hero() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(2) // slides mounted so far: the first one plus the next to fade in
  const [held, setHeld] = useState(false) // mouse over or keyboard focus: hold the slide (WCAG 2.2.2, no visible button)

  const goTo = (i) => {
    setCurrent(i)
    setLoaded((n) => Math.max(n, Math.min(SLIDES.length, i + 2)))
  }

  /* Auto-advance (off for reduced-motion users); keyed on `current` so picking a dot restarts the timer */
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => goTo((current + 1) % SLIDES.length), SLIDE_MS)
    return () => clearTimeout(id)
  }, [current, held])

  return (
    <section
      id="home"
      className="h-svh bg-forest-950 p-0 md:p-2.5"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHeld(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHeld(false) }}
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setHeld(true) }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false) }}
    >
      <div className="relative h-full md:rounded-2xl overflow-hidden">
        {/* Carrusel — una imagen visible a la vez */}
        {/* Only slides up to the next one are mounted, so the third photo isn't downloaded on arrival */}
        {SLIDES.slice(0, loaded).map((slide, i) => (
          <picture key={slide.src}>
            {slide.portrait && <source media="(orientation: portrait)" srcSet={slide.portrait} />}
            <img
              src={slide.src}
              alt={t(slide.altKey)}
              aria-hidden={i !== current}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className={`absolute inset-0 w-full h-full object-cover
                          transition-opacity duration-1000 ease-in-out motion-reduce:transition-none
                          ${i === current ? 'opacity-100' : 'opacity-0'}`}
              style={{ objectPosition: slide.position }}
            />
          </picture>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-5 px-6 md:px-8 pt-24 pb-10 md:py-0 text-center">
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

          {/* Leyenda */}
          <div className="space-y-1.5 max-w-xl">
            <p className="text-white font-bold uppercase tracking-[0.12em] text-sm md:text-base">
              {t('hero.tagline')}
            </p>
            <p className="text-white/80 text-base md:text-lg">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Botones — min-w fijo para evitar layout shift al cambiar idioma */}
          <div className="flex items-center gap-3 mt-1">
            <Link
              to="/contacto"
              className="min-w-[158px] flex items-center justify-center bg-forest-500 hover:bg-forest-400 text-white font-semibold px-6 md:px-7 py-3 rounded-full transition-colors duration-200 shadow-lg shadow-forest-900/50 text-sm md:text-base whitespace-nowrap"
            >
              {t('hero.bookNow')}
            </Link>
            <a
              href="#tours"
              className="min-w-[120px] flex items-center justify-center bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-semibold px-6 md:px-7 py-3 rounded-full border border-white/25 transition-colors duration-200 text-sm md:text-base whitespace-nowrap"
            >
              {t('hero.viewTours')}
            </a>
          </div>

          {/* Controles del carrusel — en el flujo para no tapar el texto en pantallas bajas */}
          <div className="flex items-center mt-1">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                onClick={() => goTo(i)}
                aria-label={t('hero.goToSlide', { n: i + 1 })}
                aria-current={i === current}
                className="group min-w-6 min-h-6 flex items-center justify-center cursor-pointer rounded-full
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/45 group-hover:bg-white/70'
                  }`}
                />
              </button>
            ))}
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
                     group hidden md:flex flex-col items-center gap-1 cursor-pointer
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
    </section>
  )
}
