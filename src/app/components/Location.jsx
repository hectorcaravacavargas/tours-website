import { useTranslation } from 'react-i18next'

const DESTINATION = '10.4266613,-84.5951054'
const MAPS_EMBED  = `https://maps.google.com/maps?q=${DESTINATION}&z=14&output=embed`

function openDirections() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.open(
          `https://maps.google.com/maps?saddr=${coords.latitude},${coords.longitude}&daddr=${DESTINATION}&dirflg=d`,
          '_blank'
        )
      },
      () => {
        window.open(
          `https://maps.google.com/maps?saddr=My+Location&daddr=${DESTINATION}&dirflg=d`,
          '_blank'
        )
      }
    )
  } else {
    window.open(
      `https://maps.google.com/maps?saddr=My+Location&daddr=${DESTINATION}&dirflg=d`,
      '_blank'
    )
  }
}

export function Location() {
  const { t } = useTranslation()

  return (
    <section id="location" className="bg-white pt-28 pb-20 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Cabecera ─────────────────────────────────── */}
        <div className="text-center mb-14">
          <h2
            className="font-heading font-bold text-gray-900 leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
          >
            {t('location.title')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            {t('location.subtitle')}
          </p>
          <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
        </div>

        {/* ── Grid: izquierda tarjeta, derecha mapa ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_8fr] gap-6 items-stretch">

          {/* Tarjeta de distancia — gradiente radial */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-6 text-white
                        shadow-2xl shadow-forest-950/40"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, #3a7d58 0%, #1b4332 45%, #0d1f17 100%)',
            }}
          >
            <p className="text-xs tracking-[0.18em] uppercase text-white/50 font-medium">
              {t('location.distance')}
            </p>

            <div className="flex items-center gap-5">
              <div>
                <span className="font-heading font-bold text-5xl leading-none">14.4</span>
                <span className="text-white/60 text-sm ml-2">{t('location.km')}</span>
              </div>
              <div className="w-px h-10 bg-white/20 flex-shrink-0" />
              <div>
                <span className="font-heading font-bold text-5xl leading-none">9.0</span>
                <span className="text-white/60 text-sm ml-2">{t('location.miles')}</span>
              </div>
            </div>

            <div className="flex-1" />

            <div>
              <button
                onClick={openDirections}
                className="group flex items-center justify-center gap-2
                           bg-white text-gray-900 font-semibold
                           px-6 py-3 rounded-xl w-full text-sm
                           hover:bg-gray-50 hover:-translate-y-0.5
                           hover:shadow-lg hover:shadow-black/20
                           transition-all duration-200 cursor-pointer"
              >
                {t('location.getDirections')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  className="transition-transform duration-200 group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <p className="text-white/40 text-xs text-center mt-2.5">
                {t('location.fromCenter')}
              </p>
            </div>
          </div>

          {/* Mapa embebido */}
          <div
            className="rounded-3xl overflow-hidden shadow-lg min-h-[360px] lg:min-h-0"
          >
            <iframe
              src={MAPS_EMBED}
              className="w-full h-full border-0 min-h-[360px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Finca El Abanico location"
            />
          </div>
        </div>

        {/* Nota alternativa */}
        <p className="text-center text-sm text-gray-400 mt-8">
          {t('location.altSearch')}{' '}
          <strong className="text-gray-500">{t('location.altSearchName')}</strong>
          {' '}{t('location.altSearchEnd')}
        </p>
      </div>
    </section>
  )
}
