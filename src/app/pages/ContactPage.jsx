import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

const WA_NUMBER    = import.meta.env.VITE_WA_NUMBER
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || import.meta.env.VITE_DEV_EMAIL

const WA_MSG = {
  es: 'Hola, estoy interesado en el tour a caballo. ¿Me pueden dar más información?',
  en: "Hello! I'm interested in the horseback riding tour. Can you give me more information?",
}

/* ── Formato visual del número de teléfono ─────────────────── */
function formatPhone(raw = '') {
  // raw: e.g. "50689893335" → "+506 8989 3335"
  if (raw.startsWith('506')) {
    const local = raw.slice(3)
    return `+506 ${local.slice(0, 4)} ${local.slice(4)}`
  }
  return `+${raw}`
}

/* ── Panel izquierdo — Formulario ───────────────────────────── */
function ContactForm() {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', people: 1, message: '' })

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const adjustPeople = (delta) =>
    setForm(prev => ({ ...prev, people: Math.max(1, prev.people + delta) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const lang = i18n.language
    const subject = encodeURIComponent(
      lang === 'es'
        ? `Solicitud de Tour de ${form.name}`
        : `Tour Request from ${form.name}`
    )
    const body = encodeURIComponent(
      lang === 'es'
        ? `Nombre: ${form.name}\nCorreo: ${form.email}\nTeléfono: ${form.phone}\nFecha preferida: ${form.date}\nPersonas: ${form.people}\n\nMensaje:\n${form.message}`
        : `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nPreferred date: ${form.date}\nPeople: ${form.people}\n\nMessage:\n${form.message}`
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
                    placeholder-gray-400 focus:outline-none focus:border-forest-400
                    focus:ring-2 focus:ring-forest-100 transition-all duration-200 bg-white`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.10)] p-8">
      {/* Header */}
      <p className="text-forest-600 text-xs tracking-[0.18em] uppercase font-semibold mb-1">
        {t('contactPage.badge')}
      </p>
      <h2
        className="font-heading font-bold text-gray-900 mb-1 leading-tight"
        style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)' }}
      >
        {t('contactPage.title')}
      </h2>
      <p className="text-gray-400 text-sm mb-7">{t('contactPage.subtitle')}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('contactPage.nameLbl')}
          </label>
          <input
            type="text" required value={form.name} onChange={set('name')}
            placeholder={t('contactPage.namePh')} className={inputCls}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('contactPage.emailLbl')}
          </label>
          <input
            type="email" required value={form.email} onChange={set('email')}
            placeholder={t('contactPage.emailPh')} className={inputCls}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('contactPage.phoneLbl')}
          </label>
          <input
            type="tel" value={form.phone} onChange={set('phone')}
            placeholder={t('contactPage.phonePh')} className={inputCls}
          />
        </div>

        {/* Date + People */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('contactPage.dateLbl')}
            </label>
            <input
              type="date" value={form.date} onChange={set('date')}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('contactPage.peopleLbl')}
            </label>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
              <button
                type="button"
                onClick={() => adjustPeople(-1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:border-forest-400 hover:text-forest-600
                           transition-colors duration-200 text-base leading-none"
              >
                −
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-gray-800">
                {form.people}
              </span>
              <button
                type="button"
                onClick={() => adjustPeople(1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:border-forest-400 hover:text-forest-600
                           transition-colors duration-200 text-base leading-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('contactPage.messageLbl')}
          </label>
          <textarea
            rows={4} value={form.message} onChange={set('message')}
            placeholder={t('contactPage.messagePh')}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl text-white font-semibold text-sm
                     transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                     active:scale-[0.98] shadow-lg shadow-forest-900/20"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #74c69d 0%, #1b4332 100%)',
          }}
        >
          {t('contactPage.send')}
        </button>
        <p className="text-center text-gray-400 text-xs -mt-2">
          {t('contactPage.response')}
        </p>
      </form>
    </div>
  )
}

/* ── Panel derecho — Información ────────────────────────────── */
function InfoPanel() {
  const { t, i18n } = useTranslation()
  const phone     = formatPhone(WA_NUMBER)
  const waUrl     = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MSG[i18n.language] ?? WA_MSG.en)}`
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
                       shadow-md shadow-forest-900/20 transition-all duration-200
                       hover:scale-[1.03] hover:shadow-lg"
            style={{ background: 'radial-gradient(circle at 30% 30%, #74c69d 0%, #1b4332 100%)' }}
          >
            {t('contactPage.waBtn')}
          </a>
          <a
            href={callUrl}
            className="flex-1 text-center py-2.5 rounded-full text-gray-700 text-sm font-semibold
                       border border-gray-300 bg-white transition-all duration-200
                       hover:border-forest-400 hover:text-forest-700"
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
        <div className="bg-forest-950 pt-32 pb-20" />
        <section
          className="bg-white relative z-30 rounded-t-[2.5rem] -mt-10
                     shadow-[0_-10px_30px_-4px_rgba(0,0,0,0.12)]
                     pt-16 pb-24 px-5 md:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <ContactForm />
              <InfoPanel />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  )
}
