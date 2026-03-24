import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import img from '../../assets/hero.png'

/* ── Slides — reemplazar src con las fotos reales ────────────── */
const SLIDES = [
  { src: img, titleKey: 'gallery.slide1Title', descKey: 'gallery.slide1Desc' },
  { src: img, titleKey: 'gallery.slide2Title', descKey: 'gallery.slide2Desc' },
  { src: img, titleKey: 'gallery.slide3Title', descKey: 'gallery.slide3Desc' },
  { src: img, titleKey: 'gallery.slide4Title', descKey: 'gallery.slide4Desc' },
  { src: img, titleKey: 'gallery.slide5Title', descKey: 'gallery.slide5Desc' },
]

const SLIDE_DURATION = 5500

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function Gallery() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const [hovering, setHovering] = useState(false)
  const intervalRef = useRef(null)

  /* ── Auto-advance: se resetea al cambiar de slide o pausar ─── */
  useEffect(() => {
    if (hovering) return
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length)
    }, SLIDE_DURATION)
    return () => clearInterval(intervalRef.current)
  }, [current, hovering])

  const goTo = (i) => setCurrent(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)

  const prev = () => goTo(current - 1)
  const next = () => goTo(current + 1)

  return (
    <section className="bg-[#fafaf9] pb-24 px-5 md:px-8">
      {/* ── Cabecera ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h2
          className="font-heading font-bold text-gray-900 leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
        >
          {t('gallery.title')}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
          {t('gallery.subtitle')}
        </p>
        <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
      </div>

      {/* ── Carrusel ─────────────────────────────────── */}
      <div
        className="max-w-5xl mx-auto"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Track — sombra dimensional para dar profundidad */}
        <div className="relative rounded-3xl overflow-hidden
                        shadow-[0_20px_60px_-10px_rgba(0,0,0,0.22),0_8px_24px_-6px_rgba(0,0,0,0.14)]
                        ring-1 ring-black/6">
          {/* Slides */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 relative overflow-hidden group"
              >
                <img
                  src={slide.src}
                  alt={t(slide.titleKey)}
                  className="w-full h-[420px] md:h-[520px] object-cover
                             transition-transform duration-500 ease-out
                             group-hover:scale-[1.04]"
                />
                {/* Gradiente + caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent">
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="font-heading text-white font-bold text-xl md:text-2xl mb-1.5 drop-shadow">
                      {t(slide.titleKey)}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed drop-shadow">
                      {t(slide.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flechas */}
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10
                       w-11 h-11 rounded-full
                       bg-black/25 hover:bg-black/45
                       backdrop-blur-sm text-white
                       flex items-center justify-center
                       transition-all duration-200 hover:scale-110
                       focus:outline-none"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                       w-11 h-11 rounded-full
                       bg-black/25 hover:bg-black/45
                       backdrop-blur-sm text-white
                       flex items-center justify-center
                       transition-all duration-200 hover:scale-110
                       focus:outline-none"
          >
            <ChevronRight />
          </button>

          {/* Barra de progreso — verde */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
            <div
              key={`${current}-${hovering}`}
              className="h-full bg-forest-400"
              style={{
                animation: hovering
                  ? 'none'
                  : `progress ${SLIDE_DURATION}ms linear forwards`,
              }}
            />
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center items-center gap-2 mt-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                i === current
                  ? 'w-6 bg-forest-600'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────── */}
      <div className="flex justify-center mt-10">
        <a
          href="#contact"
          className="group flex items-center gap-2
                     border border-gray-300 hover:border-forest-600
                     text-gray-600 hover:text-forest-600
                     font-medium px-7 py-3 rounded-full text-sm
                     transition-all duration-200 hover:shadow-md hover:shadow-forest-100"
        >
          {t('gallery.cta')}
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>
    </section>
  )
}
