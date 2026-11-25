import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { waUrl } from '../../config/business'

/* Desktop only: on phones MobileBookingBar carries WhatsApp. Hidden on /contacto, where it covered the Pay button. */
export function WhatsAppButton() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  if ((pathname.replace(/\/+$/, '') || '/') === '/contacto') return null

  return (
    <a
      href={waUrl(i18n.language)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('nav.whatsapp')}
      className="fixed bottom-6 right-6 z-50
                 w-14 h-14 rounded-full
                 hidden md:flex items-center justify-center
                 shadow-lg shadow-green-900/30
                 hover:scale-110 hover:shadow-xl hover:shadow-green-900/40
                 transition-all duration-200"
      style={{ background: 'linear-gradient(135deg, #25d366 0%, #1ebe5d 100%)' }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.524 5.855L.057 23.625a.75.75 0 0 0 .925.926l5.808-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.505-5.23-1.387l-.374-.217-3.882.977.992-3.818-.234-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </a>
  )
}

/* page: true  → navega a otra página (no transición blur)
   page: false → scroll suave con blur a sección del home */
const NAV_LINKS = [
  { key: 'nav.home',     href: '#home',      page: false },
  { key: 'nav.tours',    href: '/tours',     page: true  },
  { key: 'nav.gallery',  href: '/galeria',   page: true  },
  { key: 'nav.contact',  href: '/contacto',  page: true  },
  { key: 'nav.location', href: '#location',  page: false },
  { key: 'nav.faq',      href: '#faq',       page: false },
]

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { label: 'Facebook',  href: 'https://www.facebook.com/profile.php?id=61594633156749', icon: <FacebookIcon /> },
  { label: 'Instagram', href: 'https://www.instagram.com/toureltrapiche/',              icon: <InstagramIcon /> },
]

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const [overlay, setOverlay] = useState(false)

  const scrollTo = (id, e) => {
    e.preventDefault()
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`
      return
    }
    setOverlay(true)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => setOverlay(false), 700)
  }

  return (
    <>
      {/* ── Overlay blur de transición ────────────── */}
      {overlay && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none bg-white/5"
          style={{ animation: 'blurFade 0.7s ease forwards' }}
        />
      )}

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-forest-950 px-5 md:px-8 pt-12 pb-28 md:pb-8">
        <div className="max-w-5xl mx-auto">

          {/* Fila superior: logo + redes + nav */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">

            {/* Logo + tagline + redes sociales */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-forest-400/50 bg-forest-800/60
                                flex items-center justify-center">
                  <span className="text-xl leading-none select-none">🐴</span>
                </div>
                <span className="font-heading font-semibold text-white text-lg">
                  El Trapiche
                </span>
              </div>
              <p className="text-white/50 text-sm">{t('footer.tagline')}</p>

              <div className="mt-3">
                <p className="text-white/60 text-xs tracking-[0.18em] uppercase font-medium mb-3">
                  {t('footer.social')}
                </p>
                <ul className="flex gap-3">
                  {SOCIAL_LINKS.map(({ label, href, icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-10 h-10 rounded-full flex items-center justify-center
                                   border border-white/15 bg-white/5 text-white/75
                                   hover:bg-forest-500 hover:border-forest-500 hover:text-white
                                   transition-colors duration-200"
                      >
                        {icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Nav links */}
            <nav>
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {NAV_LINKS.map(({ key, href, page }) => (
                  <li key={key}>
                    {page ? (
                      <Link
                        to={href}
                        className="text-white/60 hover:text-forest-300 text-sm font-medium
                                   transition-colors duration-200"
                      >
                        {t(key)}
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => scrollTo(href.replace('#', ''), e)}
                        className="text-white/60 hover:text-forest-300 text-sm font-medium
                                   transition-colors duration-200 cursor-pointer"
                      >
                        {t(key)}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Divisor */}
          <div className="h-px bg-white/10 mb-8" />

          {/* Fila inferior: copyright + crédito */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {year} Tour de Caballos El Trapiche.
            </p>
            <div className="text-left md:text-right">
              <p className="text-white/60 text-sm">
                {t('footer.designedBy')}{' '}
                <strong className="text-white/75 font-semibold">
                  Hector Alonso Caravaca Vargas
                </strong>
              </p>
              <p className="text-white/60 text-xs mt-0.5">{import.meta.env.VITE_DEV_EMAIL}</p>
            </div>
          </div>

        </div>
      </footer>

    </>
  )
}
