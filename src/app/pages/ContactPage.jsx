import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { BookingForm } from '../../features/booking/components/BookingForm'
import { WA_NUMBER, waUrl as buildWaUrl } from '../../config/business'

/* ── Formato visual del número de teléfono ─────────────────── */
function formatPhone(raw = '') {
  // raw: e.g. "50689893335" → "+506 8989 3335"
  if (raw.startsWith('506')) {
    const local = raw.slice(3)
    return `+506 ${local.slice(0, 4)} ${local.slice(4)}`
  }
  return `+${raw}`
}

/* ── Panel derecho — Información ────────────────────────────── */
function InfoPanel() {
  const { t, i18n } = useTranslation()
  const phone     = formatPhone(WA_NUMBER)
  const waUrl     = buildWaUrl(i18n.language)
  const callUrl   = `tel:+${WA_NUMBER}`

  return (
    <div className="flex flex-col gap-5">

      {/* Direct line card */}
      <div
        className="rounded-2xl p-7 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.10)]"
        style={{ background: 'radial-gradient(circle at 20% 20%, #d8f3dc 0%, #b7e4c7 100%)' }}
      >
        <p className="text-forest-700 text-xs tracking-[0.18em] uppercase font-semibold mb-3">
          {t('contactPage.directLine')}
        </p>
        <p className="font-heading font-bold text-gray-900 text-lg mb-1">
          {t('contactPage.directTitle')}
        </p>
        <p className="text-gray-600 text-sm mb-5">{t('contactPage.directDesc')}</p>
        <p
          className="font-heading font-bold text-gray-900 mb-5"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)' }}
        >
          {phone}
        </p>
        <div className="flex gap-3">
          <a
            href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 rounded-full text-white text-sm font-semibold
                       bg-forest-500 hover:bg-forest-400
                       shadow-md shadow-forest-900/20 transition-all duration-200
                       hover:scale-[1.03] hover:shadow-lg"
          >
            {t('contactPage.waBtn')}
          </a>
          <a
            href={callUrl}
            className="flex-1 text-center py-2.5 rounded-full text-white text-sm font-semibold
                       bg-forest-500 hover:bg-forest-400
                       shadow-md shadow-forest-900/20 transition-all duration-200
                       hover:scale-[1.03] hover:shadow-lg"
          >
            {t('contactPage.callBtn')}
          </a>
        </div>
      </div>

      {/* Important info card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-7 flex flex-col gap-6 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.10)]">
        <p className="font-heading font-bold text-gray-900 text-base">
          {t('contactPage.infoTitle')}
        </p>

        {/* Already booked */}
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-1">{t('contactPage.info1Title')}</p>
          <p className="text-gray-500 text-sm leading-relaxed">{t('contactPage.info1Desc')}</p>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Cancellation */}
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-2">{t('contactPage.info2Title')}</p>
          <ul className="flex flex-col gap-1.5">
            <li className="text-gray-500 text-sm flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-forest-400/60 flex-shrink-0" />
              {t('contactPage.info2a')}
            </li>
            <li className="text-gray-500 text-sm flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-forest-400/60 flex-shrink-0" />
              {t('contactPage.info2b')}
            </li>
          </ul>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Pricing */}
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'radial-gradient(circle at 20% 20%, #f0faf4 0%, #d8f3dc 100%)' }}
        >
          <p className="font-semibold text-forest-800 text-sm mb-1">{t('contactPage.info3Title')}</p>
          <p className="text-forest-700/80 text-sm leading-relaxed">{t('contactPage.info3Desc')}</p>
        </div>
      </div>

    </div>
  )
}

/* ── Página principal ───────────────────────────────────────── */
export function ContactPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <Navbar />
      <div
        className="bg-[#e8ebe5] min-h-screen"
        style={{ animation: 'fadeSlideUp 0.55s ease-out forwards', opacity: 0 }}
      >
        <div className="bg-forest-950 pt-24 pb-12 md:pt-32 md:pb-20" />
        <section
          className="bg-white relative z-30 rounded-t-[2.5rem] -mt-10
                     shadow-[0_-10px_30px_-4px_rgba(0,0,0,0.12)]
                     pt-8 md:pt-16 pb-24 px-4 sm:px-5 md:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <BookingForm />
              <InfoPanel />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  )
}
