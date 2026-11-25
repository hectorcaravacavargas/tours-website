import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../features/i18n/components/LanguageToggle'

const NAV_LINKS = [
  { key: 'nav.home',    href: '/' },
  { key: 'nav.tours',   href: '/tours' },
  { key: 'nav.gallery', href: '/galeria' },
  { key: 'nav.contact', href: '/contacto' },
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
  const { pathname } = useLocation()
  const currentPath = pathname.replace(/\/+$/, '') || '/'
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
    <>
    {/* Tap outside closes the mobile menu (outside <nav>: its transform would trap a fixed child) */}
    {menuOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={closeMenu} aria-hidden="true" />}
    <nav
      className="fixed top-0 left-0 right-0 z-50 p-3 transition-transform duration-300 ease-in-out"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-110%)' }}
    >
      {/* ── Barra principal ────────────────────────── */}
      <div className="bg-forest-950/70 backdrop-blur-md rounded-2xl flex items-center justify-between px-5 py-3.5">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-forest-400/50 bg-forest-800/60 flex items-center justify-center">
            <span className="text-xl leading-none select-none">🐴</span>
          </div>
          <span className="font-heading text-white font-semibold text-base hidden sm:block">
            El Trapiche
          </span>
        </Link>

        {/* Links — desktop */}
        <ul className="hidden md:flex items-center justify-between w-[320px]">
          {NAV_LINKS.map(({ key, href }) => {
            const active = currentPath === href
            return (
              <li key={key}>
                <Link
                  to={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative text-sm font-medium transition-colors duration-200 whitespace-nowrap
                              after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-0.5
                              after:rounded-full after:bg-forest-400 after:transition-transform after:duration-200
                              ${active
                                ? 'text-white after:scale-x-100'
                                : 'text-white/70 hover:text-white after:scale-x-0'}`}
                >
                  {t(key)}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Derecha */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex">
            <LanguageToggle variant="navbar" />
          </div>

          <Link
            to="/contacto"
            className="hidden md:flex items-center justify-center min-w-[175px] ml-3 bg-forest-500 hover:bg-forest-400 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 shadow-lg shadow-forest-900/40 whitespace-nowrap"
          >
            {t('nav.reserve')}
          </Link>

          {/* Language — mobile, always visible (guests arrive from a QR code) */}
          <div className="md:hidden">
            <LanguageToggle variant="compact" />
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="md:hidden text-white bg-forest-800/60 hover:bg-forest-700/60 border border-forest-600/40 rounded-xl p-2.5 transition-colors duration-200"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* ── Dropdown mobile ─────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden mt-2 bg-forest-950/85 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10"
          style={{ animation: 'slideDown 0.22s ease-out forwards' }}
        >
          <ul className="px-5 pt-5 pb-3">
            {NAV_LINKS.map(({ key, href }) => {
              const active = currentPath === href
              return (
                <li key={key}>
                  <Link
                    to={href}
                    onClick={closeMenu}
                    aria-current={active ? 'page' : undefined}
                    className={`block text-base font-medium py-3.5 text-center border-b border-white/8 transition-colors duration-200 last:border-0
                                ${active ? 'text-forest-300 underline decoration-2 underline-offset-8 decoration-forest-400' : 'text-white/80 hover:text-white'}`}
                  >
                    {t(key)}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mx-5 h-px bg-white/12" />

          <div className="px-5 py-4">
            <Link
              to="/contacto"
              onClick={closeMenu}
              className="block w-full text-center bg-forest-500 hover:bg-forest-400 text-white font-semibold px-5 py-3.5 rounded-full transition-colors duration-200"
            >
              {t('nav.reserve')}
            </Link>
          </div>
        </div>
      )}
    </nav>
    </>
  )
}
