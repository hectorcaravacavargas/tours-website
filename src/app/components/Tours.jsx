import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { heroPlaceholder as tourImage } from '../../assets'

/* ── Íconos SVG ─────────────────────────────────────────────── */

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="#2d7a4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="#2d7a4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function FarmIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="#2d7a4f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M9 8h1" />
      <path d="M9 12h1" />
      <path d="M14 8h1" />
      <path d="M14 12h1" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest-500/15 border border-forest-500/25">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
        stroke="#2d7a4f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </span>
  )
}

/* ── Gradiente para los íconos de info ──────────────────────── */
const iconBoxStyle = {
  background: 'linear-gradient(135deg, #e6f5ec 0%, #b8e0c8 100%)',
}

/* ── Componente principal ────────────────────────────────────── */
export function Tours() {
  const { t } = useTranslation()

  const checks = ['check1', 'check2', 'check3', 'check4']

  return (
    <>
      {/* ── Transición 3D Hero → Tours ──────────────── */}
      <div
        className="relative bg-forest-950"
        style={{ height: '90px', marginBottom: '-2px' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full block"
        >
          <defs>
            {/* Sombra proyectada hacia arriba — da profundidad 3D */}
            <filter id="foldShadow" x="-10%" y="-100%" width="120%" height="250%">
              <feDropShadow dx="0" dy="-4" stdDeviation="6"  floodColor="rgba(0,0,0,0.55)" result="s1" />
              <feDropShadow dx="0" dy="-14" stdDeviation="22" floodColor="rgba(0,0,0,0.30)" />
            </filter>
          </defs>

          {/* Plano de tours (claro) que emerge desde abajo */}
          <path
            d="M0,15 Q720,90 1440,15 L1440,90 L0,90 Z"
            fill="#fafaf9"
            filter="url(#foldShadow)"
          />
          {/* Reflejo de luz en el borde del pliegue */}
          <path
            d="M0,13 Q720,88 1440,13"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* ── Sección Tours ────────────────────────────── */}
      <section id="tours" className="bg-[#fafaf9] py-20 px-5 md:px-8">
        {/* Cabecera */}
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2
            className="font-heading font-bold text-gray-900 leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
          >
            {t('tours.title')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            {t('tours.subtitle')}
          </p>
          <div className="mx-auto mt-6 w-14 h-0.5 bg-gray-200 rounded-full" />
        </div>

        {/* ── Tarjeta principal ───────────────────────── */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/70 overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-300/60 cursor-pointer">
          <div className="flex flex-col lg:flex-row">

            {/* Imagen — IZQUIERDA */}
            <div className="lg:w-[44%] relative flex-shrink-0">
              <img
                src={tourImage}
                alt={t('tours.card.title')}
                className="w-full h-64 lg:h-full object-cover"
              />
              {/* Gradiente suave sobre la imagen */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5" />
            </div>

            {/* Contenido — DERECHA */}
            <div className="flex-1 p-7 md:p-9 flex flex-col justify-center gap-5">
              {/* Título + descripción */}
              <div>
                <h3
                  className="font-heading font-bold text-forest-700 mb-2.5"
                  style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)' }}
                >
                  {t('tours.card.title')}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t('tours.card.description')}
                </p>
              </div>

              {/* Íconos de información con gradiente */}
              <div className="grid grid-cols-3 gap-3">
                {/* Duración */}
                <div className="rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center min-h-[96px] justify-center" style={iconBoxStyle}>
                  <ClockIcon />
                  <span className="text-xs text-gray-500 font-medium">{t('tours.card.duration')}</span>
                  <strong className="text-sm text-gray-800">2 hrs</strong>
                </div>
                {/* Grupo */}
                <div className="rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center min-h-[96px] justify-center" style={iconBoxStyle}>
                  <GroupIcon />
                  <span className="text-xs text-gray-500 font-medium">{t('tours.card.group')}</span>
                  <strong className="text-sm text-gray-800 leading-tight text-center">
                    2–20<br />{t('tours.card.people')}
                  </strong>
                </div>
                {/* Finca Natural */}
                <div className="rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center min-h-[96px] justify-center" style={iconBoxStyle}>
                  <FarmIcon />
                  <span className="text-xs text-gray-500 font-medium">{t('tours.card.locLabel')}</span>
                  <strong className="text-sm text-gray-800">{t('tours.card.locValue')}</strong>
                </div>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                {checks.map((key) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <ArrowIcon />
                    <span className="text-sm text-gray-600">{t(`tours.card.${key}`)}</span>
                  </div>
                ))}
              </div>

              {/* Precio + Botones */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 border-t border-gray-100">
                <div className="min-w-[130px]">
                  <span className="text-xs text-gray-400 block whitespace-nowrap">{t('tours.card.from')}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-bold text-forest-600">$50</span>
                    <span className="text-sm text-gray-400 whitespace-nowrap">/ {t('tours.card.perPerson')}</span>
                  </div>
                </div>

                <div className="flex gap-3 sm:ml-auto">
                  {/* Botón "Más Información" — min-w fijo + relleno al hover */}
                  <Link to="/tours" className="group min-w-[158px] flex items-center justify-center gap-1.5 border-2 border-forest-600 text-forest-600 hover:bg-forest-600 hover:text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-forest-900/20 active:translate-y-0 whitespace-nowrap">
                    <svg
                      width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className="flex-shrink-0 transition-transform duration-250 group-hover:scale-110"
                    >
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {t('tours.card.moreInfo')}
                  </Link>
                  {/* Botón "Reservar Ahora" — min-w fijo + flecha desliza al hover */}
                  <Link
                    to="/contacto"
                    className="group min-w-[148px] flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-500 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest-900/30 active:translate-y-0 whitespace-nowrap"
                  >
                    {t('tours.card.bookNow')}
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      className="transition-transform duration-250 group-hover:translate-x-1"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
