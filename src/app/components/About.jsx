import { useTranslation } from 'react-i18next'
import img from '../../assets/hero.png'

/* ── Imágenes — reemplazar src con las fotos reales ─────────── */
const IMG_LEFT   = img   // foto tall — ej: familia a caballo
const IMG_MID_1  = img   // foto horizontal — ej: familia en la finca
const IMG_MID_2  = img   // foto horizontal — ej: padre cruzando río

export function About() {
  const { t } = useTranslation()

  return (
    <section id="about" className="bg-white py-24 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Título ──────────────────────────────────── */}
        <h2
          className="font-heading font-bold text-gray-900 text-center mb-16 leading-tight"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          {t('about.title')}
        </h2>

        {/* ── Grid principal ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── Imágenes ────────────────────────────────── */}
          <div className="grid grid-cols-[1.1fr_1fr] gap-4 items-start">

            {/* Imagen izquierda — tall, rota a la derecha */}
            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden cursor-pointer will-change-transform
                           transition-all duration-300 ease-out
                           shadow-lg hover:shadow-2xl
                           hover:rotate-2 hover:-translate-y-3"
              >
                <img
                  src={IMG_LEFT}
                  alt={t('about.imgAlt1')}
                  className="w-full object-cover"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>

              {/* Badge "Since" con gradiente */}
              <div
                className="absolute -bottom-4 left-4 inline-flex items-center gap-2
                           px-4 py-2 rounded-full text-white text-sm font-semibold
                           shadow-xl shadow-forest-900/30 select-none"
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

            {/* Columna derecha — 2 imágenes apiladas, desplazadas hacia abajo */}
            <div className="flex flex-col gap-4 pt-8">
              {/* Imagen media superior — rota a la izquierda */}
              <div
                className="rounded-2xl overflow-hidden cursor-pointer will-change-transform
                           transition-all duration-300 ease-out
                           shadow-md hover:shadow-xl
                           hover:-rotate-2 hover:-translate-y-3"
              >
                <img
                  src={IMG_MID_1}
                  alt={t('about.imgAlt2')}
                  className="w-full h-44 object-cover"
                />
              </div>

              {/* Imagen media inferior — rota a la derecha */}
              <div
                className="rounded-2xl overflow-hidden cursor-pointer will-change-transform
                           transition-all duration-300 ease-out
                           shadow-md hover:shadow-xl
                           hover:rotate-2 hover:-translate-y-3"
              >
                <img
                  src={IMG_MID_2}
                  alt={t('about.imgAlt3')}
                  className="w-full h-48 object-cover"
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

            {/* Cita */}
            <blockquote className="relative bg-stone-50 border-l-[4px] border-forest-500 rounded-xl px-6 py-5">
              <p className="font-heading italic text-gray-700 leading-relaxed text-lg">
                "{t('about.quote')}"
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
      </div>
    </section>
  )
}
