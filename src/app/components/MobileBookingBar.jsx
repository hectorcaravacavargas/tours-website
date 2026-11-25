import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRICE_PER_PERSON, waUrl } from '../../config/business'

/*
 * Phone-only booking bar: keeps "Book" one tap away on every page (guests arrive from a QR code).
 * Hidden on /contacto (the booking form is the page) and over the home hero (it has its own CTA).
 * Replaces the floating WhatsApp button on phones so the two never stack.
 */
export function MobileBookingBar() {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const path = pathname.replace(/\/+$/, '') || '/'
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [path])

  if (path === '/contacto') return null
  const shown = path !== '/' || pastHero

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/95 backdrop-blur-md
                  px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]
                  flex items-center gap-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]
                  transition-[translate] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none
                  ${shown ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="leading-tight">
        <span className="block text-[11px] text-gray-500">{t('tours.card.from')}</span>
        <span className="font-heading font-bold text-forest-700 text-lg">${PRICE_PER_PERSON}</span>
        <span className="text-xs text-gray-500"> / {t('tours.card.perPerson')}</span>
      </div>

      <Link
        to="/contacto"
        className="flex-1 h-12 rounded-full bg-forest-500 active:bg-forest-600 text-white font-semibold text-[15px]
                   flex items-center justify-center shadow-md shadow-forest-900/20 select-none"
      >
        {t('hero.bookNow')}
      </Link>

      <a
        href={waUrl(i18n.language)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('nav.whatsapp')}
        className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-transform duration-150"
        style={{ background: '#25d366' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.524 5.855L.057 23.625a.75.75 0 0 0 .925.926l5.808-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.505-5.23-1.387l-.374-.217-3.882.977.992-3.818-.234-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </a>
    </div>
  )
}
