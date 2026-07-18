import { useTranslation } from 'react-i18next'
import {
  cabalgataBosqueDosJinetes,
  jineteSaludoBosque,
  cruceRioCaballo,
  heroPlaceholder as img,
} from '../../assets'

const IMG_LEFT   = cabalgataBosqueDosJinetes  // foto tall — socios a caballo
const IMG_MID_1  = jineteSaludoBosque         // foto horizontal — en la finca
const IMG_MID_2  = cruceRioCaballo            // foto horizontal — cruzando el río

/* ── Caballos — reemplazar src con las fotos reales ────────── */
const HORSES = [
  { name: 'Careta',  src: img },
  { name: 'Lucero',  src: img },
  { name: 'Mamona',  src: img },
  { name: 'Canela',  src: img },
  { name: 'Peluso',  src: img },
]

function HorseCard({ name, src, idx }) {
  const rotateClass = idx % 2 === 0 ? 'hover:rotate-3' : 'hover:-rotate-3'
  return (
    <div
      className={`bg-white rounded-2xl p-3 pb-5 shadow-md relative
                  transition-all duration-300 ease-out cursor-default
                  hover:scale-[1.08] hover:shadow-xl hover:z-10
                  ${rotateClass}`}
    >
      <div className="rounded-xl overflow-hidden aspect-[4/5]">
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
      <p
        className="text-center mt-3 text-gray-700 text-lg"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        {name}
      </p>
    </div>
  )
}

export function About({ showHorses = false }) {
  const { t } = useTranslation()

  return (
    <section id="about" className="bg-white rounded-t-[2.5rem] -mt-10 relative z-10 shadow-[0_-12px_30px_-4px_rgba(0,0,0,0.08)] py-24 pb-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Título ──────────────────────────────────── */}
        <h2
          className="font-heading font-bold text-gray-900 text-center mb-16 leading-tight"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          {t('about.title')}
        </h2>

        {/* ── Grid principal — items-stretch para igualar alturas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">

          {/* ── Imágenes ────────────────────────────────── */}
          <div className="grid grid-cols-[1.1fr_1fr] gap-4 h-full">

            {/* Imagen izquierda — ocupa toda la altura de la columna */}
            <div className="relative flex flex-col h-full">
              <div
                className="rounded-3xl overflow-hidden cursor-pointer will-change-transform
                           transition-all duration-300 ease-out flex-1
                           shadow-lg hover:shadow-2xl
                           hover:rotate-2 hover:-translate-y-3
                           min-h-[320px] lg:min-h-0"
              >
                <img
                  src={IMG_LEFT}
                  alt={t('about.imgAlt1')}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badge "Since" con gradiente */}
              <div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5
                           px-3 py-1.5 text-xs rounded-full text-white font-semibold
                           md:gap-2 md:px-4 md:py-2 md:text-sm
                           shadow-xl shadow-forest-900/30 select-none whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 45%, #52b788 100%)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {t('about.since')}
              </div>
            </div>

            {/* Columna derecha — 2 imágenes que llenan el espacio */}
            <div className="flex flex-col gap-4 pt-8 h-full">
              <div
                className="flex-1 rounded-2xl overflow-hidden cursor-pointer will-change-transform
                           transition-all duration-300 ease-out
                           shadow-md hover:shadow-xl
                           hover:-rotate-2 hover:-translate-y-3"
              >
                <img
                  src={IMG_MID_1}
                  alt={t('about.imgAlt2')}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className="flex-1 rounded-2xl overflow-hidden cursor-pointer will-change-transform
                           transition-all duration-300 ease-out
                           shadow-md hover:shadow-xl
                           hover:rotate-2 hover:-translate-y-3"
              >
                <img
                  src={IMG_MID_2}
                  alt={t('about.imgAlt3')}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* ── Texto ───────────────────────────────────── */}
          <div className="flex flex-col gap-6 pt-2">

            {/* Párrafo 1 */}
            <p className="text-gray-600 leading-relaxed text-[1.05rem]">
              {t('about.para1a')}{' '}
              <strong className="text-gray-900 font-semibold">
                {t('about.para1bold')}
              </strong>{' '}
              {t('about.para1b')}
            </p>

            {/* Párrafo 2 */}
            <p className="text-gray-600 leading-relaxed text-[1.05rem]">
              {t('about.para2')}
            </p>

            {/* Cita — gradiente vintage cálido con profundidad */}
            <blockquote
              className="relative overflow-hidden rounded-xl px-6 py-5
                         shadow-md shadow-amber-900/10
                         transition-all duration-300 ease-out
                         hover:scale-[1.03] hover:-translate-y-2 cursor-default"
              style={{
                background: 'linear-gradient(135deg, #faf3e8 0%, #f0e4cc 55%, #e8d5b4 100%)',
              }}
            >
              {/* Línea decorativa */}
              <div className="w-10 h-0.5 bg-amber-600/40 mb-4 rounded-full" />
              <p className="font-heading italic text-stone-700 leading-relaxed text-base">
                {t('about.quote')}
              </p>
            </blockquote>

            {/* Párrafo 3 */}
            <p className="text-gray-600 leading-relaxed text-[1.05rem]">
              {t('about.para3a')}{' '}
              <strong className="text-gray-900 font-semibold">
                {t('about.para3bold')}
              </strong>{' '}
              {t('about.para3b')}
            </p>
          </div>
        </div>

        {/* ── Galería de caballos (solo en AboutPage) ─── */}
        {showHorses && (
          <div className="mt-24">
            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-forest-600 text-xs tracking-[0.18em] uppercase font-semibold mb-2">
                {t('horses.badge')}
              </p>
              <h2
                className="font-heading font-bold text-gray-900 leading-tight mb-4"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
              >
                {t('horses.title')}
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                {t('horses.subtitle')}
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {HORSES.map(({ name, src }, i) => (
                <HorseCard key={name} name={name} src={src} idx={i} />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
