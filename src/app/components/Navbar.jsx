import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../features/i18n/components/LanguageToggle'

const NAV_LINKS = [
  { key: 'nav.home',    href: '/' },
  { key: 'nav.tours',   href: '/tours' },
  { key: 'nav.about',   href: '/nosotros' },
  { key: 'nav.contact', href: '/#contact' },
]

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  )
}

export function Navbar() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current < 10) {
        setVisible(true)
      } else if (current < lastScrollY.current) {
        // Scrolling up → show
        setVisible(true)
      } else if (current > lastScrollY.current + 6) {
        // Scrolling down → hide
        setVisible(false)
        setMenuOpen(false)
      }
      lastScrollY.current = current
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 p-3 transition-transform duration-300 ease-in-out"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-110%)' }}
    >
      {/* ── Barra principal ────────────────────────── */}
      <div className="bg-forest-950/70 backdrop-blur-md rounded-2xl flex items-center justify-between px-5 py-3.5">

        {/* Logo */}
        <a href="/" onClick={closeMenu} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-forest-400/50 bg-forest-800/60 flex items-center justify-center">
            <span className="text-xl leading-none select-none">🐴</span>
          </div>
          <span className="font-heading text-white font-semibold text-base hidden sm:block">
            El Abanico
          </span>
        </a>

        {/* Links — desktop */}
        <ul className="hidden md:flex items-center justify-between w-[320px]">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={key}>
              <a
                href={href}
                className="text-white/75 hover:text-white text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              >
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        {/* Derecha */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex">
            <LanguageToggle variant="navbar" />
          </div>

          <a
            href="/#contact"
            className="hidden md:flex items-center justify-center min-w-[175px] ml-3 bg-forest-500 hover:bg-forest-400 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 shadow-lg shadow-forest-900/40 whitespace-nowrap"
          >
            {t('nav.reserve')}
          </a>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="md:hidden text-white bg-forest-800/60 hover:bg-forest-700/60 border border-forest-600/40 rounded-xl p-2.5 transition-colors duration-200"
            aria-label="Menu"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* ── Dropdown mobile ─────────────────────────── */}
      {menuOpen && (
        <div
          className="md:hidden mt-2 bg-forest-950/85 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10"
          style={{ animation: 'slideDown 0.22s ease-out forwards' }}
        >
          <ul className="px-5 pt-5 pb-3">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  onClick={closeMenu}
                  className="block text-white/80 hover:text-white text-base font-medium py-3.5 text-center border-b border-white/8 transition-colors duration-200 last:border-0"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="mx-5 h-px bg-white/12" />

          <div className="flex justify-center py-4">
            <LanguageToggle />
          </div>

          <div className="mx-5 h-px bg-white/12" />

          <div className="px-5 py-4">
            <a
              href="/#contact"
              onClick={closeMenu}
              className="block w-full text-center bg-forest-500 hover:bg-forest-400 text-white font-semibold px-5 py-3.5 rounded-full transition-colors duration-200"
            >
              {t('nav.reserve')}
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
