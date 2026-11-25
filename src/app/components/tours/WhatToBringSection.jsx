import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/* ── Radial-gradient icon circle ───────────────────────────────── */
function IconCircle({ children }) {
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #f0faf4 0%, #95d5b2 100%)',
      }}
    >
      {children}
    </div>
  )
}

/* ── SVG icons ─────────────────────────────────────────────────── */
const iconProps = {
  width: '22', height: '22', viewBox: '0 0 24 24',
  fill: 'none', stroke: '#2d6a4f', strokeWidth: '1.8',
  strokeLinecap: 'round', strokeLinejoin: 'round',
}

function SunIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="5"  y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function ShoeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12l2-2 4 4 4-4 4 4 2-2" />
      <path d="M3 17h18a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z" />
    </svg>
  )
}

function PantsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 3h12l2 9-5 9h-2l-1-6-1 6H9L4 12z" />
      <line x1="12" y1="3" x2="12" y2="12" />
    </svg>
  )
}

function DropIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2z" />
    </svg>
  )
}

function ShirtIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 7l-4-4H8L4 7l3 2V20h10V9z" />
      <path d="M8 3s0 4-4 4M16 3s0 4 4 4" />
    </svg>
  )
}

const ITEMS = [
  { icon: <SunIcon />,    titleKey: 'whatToBring.item1Title', descKey: 'whatToBring.item1Desc' },
  { icon: <ShieldIcon />, titleKey: 'whatToBring.item2Title', descKey: 'whatToBring.item2Desc' },
  { icon: <ShoeIcon />,   titleKey: 'whatToBring.item3Title', descKey: 'whatToBring.item3Desc' },
  { icon: <PantsIcon />,  titleKey: 'whatToBring.item4Title', descKey: 'whatToBring.item4Desc' },
  { icon: <DropIcon />,   titleKey: 'whatToBring.item5Title', descKey: 'whatToBring.item5Desc' },
  { icon: <ShirtIcon />,  titleKey: 'whatToBring.item6Title', descKey: 'whatToBring.item6Desc' },
]

export function WhatToBringSection() {
  const { t } = useTranslation()

  return (
    <section className="bg-white relative z-30 rounded-t-[2.5rem] -mt-10
                        shadow-[0_-10px_30px_-4px_rgba(0,0,0,0.12)]
                        pt-20 pb-24 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-forest-600 text-xs tracking-[0.18em] uppercase font-semibold mb-2">
            {t('whatToBring.badge')}
          </p>
          <h2
            className="font-heading font-bold text-gray-900 leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
          >
            {t('whatToBring.title')}
          </h2>
          <p className="text-gray-500 max-w-xl leading-relaxed text-base md:text-lg">
            {t('whatToBring.subtitle')}
          </p>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {ITEMS.map(({ icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="flex items-start gap-4 p-5 rounded-2xl
                         border border-gray-100 bg-white
                         hover:border-forest-200 hover:shadow-sm
                         transition-all duration-200"
            >
              <IconCircle>{icon}</IconCircle>
              <div className="flex flex-col gap-0.5 pt-1">
                <span className="font-semibold text-gray-900 text-sm md:text-base">
                  {t(titleKey)}
                </span>
                <span className="text-gray-500 text-sm leading-relaxed">
                  {t(descKey)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/contacto"
            className="bg-forest-500 hover:bg-forest-400 text-white font-semibold
                       px-8 py-3.5 rounded-full text-sm
                       shadow-lg shadow-forest-200
                       transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            {t('toursPage.bookTour')}
          </Link>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-700 font-medium text-sm
                       flex items-center gap-2 transition-colors duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            {t('toursPage.backHome')}
          </Link>
        </div>

      </div>
    </section>
  )
}
