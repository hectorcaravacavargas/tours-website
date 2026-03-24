import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../features/i18n/components/LanguageToggle'

const NAV_LINKS = [
  { key: 'nav.home',    href: '#home' },
  { key: 'nav.tours',   href: '/tours' },
  { key: 'nav.about',   href: '#about' },
  { key: 'nav.contact', href: '#contact' },
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

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-3">
      {/* ── Bar principal ──────────────────────────── */}
      <div className="bg-forest-950/70 backdrop-blur-md rounded-2xl flex items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <a href="#home" onClick={closeMenu} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-forest-400/50 bg-forest-800/60 flex items-center justify-center">
            <span className="text-xl leading-none select-none">🐴</span>
          </div>
          <span className="font-heading text-white font-semibold text-base hidden sm:block">
            El Abanico
          </span>
        </a>

        {/* Links — solo desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={key}>
              <a
                href={href}
                className="text-white/75 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        {/* Derecha */}
        <div className="flex items-center gap-4">
          <LanguageToggle variant="navbar" />

          {/* CTA desktop */}
          <a
            href="#contact"
            className="hidden md:block bg-forest-500 hover:bg-forest-400 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-200 shadow-lg shadow-forest-900/40"
          >
            {t('nav.reserve')}
          </a>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-white bg-forest-800/60 hover:bg-forest-700/60 border border-forest-600/40 rounded-xl p-2.5 transition-colors duration-200"
            aria-label="Menu"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* ── Dropdown mobile ────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden mt-2 bg-forest-950/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">
          <ul className="px-5 pt-5 pb-2 space-y-1">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <a
                  href={href}
                  onClick={closeMenu}
                  className="block text-white/80 hover:text-white text-base font-medium py-3 border-b border-white/8 transition-colors duration-200 last:border-0"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
          <div className="px-5 pb-5 pt-3 flex flex-col gap-4">
            {/* Toggle idioma en el menú mobile */}
            <div className="flex justify-center">
              <LanguageToggle />
            </div>
            <a
              href="#contact"
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
