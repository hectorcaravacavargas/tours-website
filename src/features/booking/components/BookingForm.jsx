import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PRICE_PER_PERSON, CHILD_PRICE, MIN_PEOPLE, MAX_PEOPLE, TOUR_TIMES, BOOKING_LEAD_MINUTES, BUSINESS_TIMEZONE,
} from '../../../config/business'
import { processPayment } from '../services/payment'
import { registerBooking } from '../services/bookingRegistry'
import { DatePicker } from './DatePicker'

/* `website` is a honeypot: hidden from people, filled by bots, rejected by the registry */
const EMPTY = { date: '', time: TOUR_TIMES[0], adults: MIN_PEOPLE, children: 0, name: '', email: '', phone: '', notes: '', website: '' }

/* Today's date and minutes since midnight in Costa Rica, whatever the visitor's timezone */
function businessNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: BUSINESS_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).map(({ type, value }) => [type, value])
  )
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) }
}

/* "1:00 pm" → 780 */
function toMinutes(label) {
  const [, h, m, ap] = label.match(/(\d+):(\d+) (am|pm)/)
  return ((Number(h) % 12) + (ap === 'pm' ? 12 : 0)) * 60 + Number(m)
}

/* "2026-12-31" → "2027-01-01" (date-only math in UTC, no DST surprises) */
function nextDay(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
}

const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
                  placeholder-gray-400 focus:outline-none focus:border-forest-400
                  focus:ring-2 focus:ring-forest-100 transition-all duration-200 bg-white`

const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

function formatDate(isoDate, lang) {
  return new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${isoDate}T12:00:00`))
}

const money = (n) => `$${n.toLocaleString('en-US')}`

const icons = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  people: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
}

function Icon({ name }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 text-forest-600">
      {icons[name]}
    </svg>
  )
}

/* − value + with a caption under the box ("12 años o más" / "Menores de 12 años") */
function Stepper({ id, label, caption, value, canDec, canInc, onDec, onInc, decLabel, incLabel }) {
  const btn = `w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-lg leading-none
               text-gray-500 hover:border-forest-400 hover:text-forest-600 cursor-pointer
               aria-disabled:opacity-40 aria-disabled:cursor-not-allowed transition-colors duration-200`
  return (
    <div>
      <span id={`${id}-lbl`} className={labelCls}>{label}</span>
      <div role="group" aria-labelledby={`${id}-lbl`} aria-describedby={`${id}-cap`}
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1 bg-white">
        {/* aria-disabled (not disabled) keeps keyboard focus on the button at the limits */}
        <button type="button" onClick={onDec} aria-disabled={!canDec} aria-label={decLabel} className={btn}>−</button>
        <span className="flex-1 text-center text-sm font-semibold text-gray-800 tabular-nums" aria-live="polite">{value}</span>
        <button type="button" onClick={onInc} aria-disabled={!canInc} aria-label={incLabel} className={btn}>+</button>
      </div>
      <p id={`${id}-cap`} className="text-xs text-gray-500 mt-1.5">{caption}</p>
    </div>
  )
}

function SectionTitle({ step, children }) {
  return (
    <h3 className="flex items-center gap-2.5 font-heading font-bold text-gray-900 text-lg">
      <span className="w-7 h-7 rounded-full bg-forest-50 border border-forest-200 text-forest-700
                       text-xs font-body font-semibold flex items-center justify-center">
        {step}
      </span>
      {children}
    </h3>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ── Confirmación ───────────────────────────────────────────── */
function Confirmation({ booking, reference, emailed, onReset }) {
  const { t, i18n } = useTranslation()
  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [])
  return (
    <div className="text-center py-6" role="status">
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-forest-50 border border-forest-200
                      flex items-center justify-center text-forest-600">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-heading font-bold text-gray-900 mb-2 focus:outline-none"
        style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)' }}
      >
        {t('booking.successTitle')}
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
        {t('booking.successDesc', { date: formatDate(booking.date, i18n.language), time: booking.time })}
      </p>
      <div className="inline-flex flex-col items-center rounded-xl bg-forest-50 border border-forest-100 px-6 py-3 mb-6">
        <span className="text-xs text-forest-700/80">{t('booking.reference')}</span>
        <span className="font-heading font-bold text-forest-800 text-xl tracking-wide">{reference}</span>
      </div>
      {emailed && (
        <p className="text-sm text-gray-600 mb-3">{t('booking.emailSent', { email: booking.email })}</p>
      )}
      <p className="text-xs text-gray-400 mb-6">{t('booking.demoNote')}</p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-semibold text-forest-600 hover:text-forest-500 transition-colors duration-200 cursor-pointer"
      >
        {t('booking.newBooking')}
      </button>
    </div>
  )
}

/* ── Formulario de compra directa ───────────────────────────── */
export function BookingForm() {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | processing | error
  const [dateMissing, setDateMissing] = useState(false)
  const [reference, setReference] = useState(null)
  const [emailed, setEmailed] = useState(false)
  const cardRef = useRef(null)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  /* At least one adult (children ride with one) and a group of MIN_PEOPLE–MAX_PEOPLE */
  const people = form.adults + form.children
  const canDec = { adults: form.adults > 1 && people > MIN_PEOPLE, children: form.children > 0 && people > MIN_PEOPLE }
  const canInc = people < MAX_PEOPLE
  const adjust = (field, delta) => {
    if (delta < 0 ? !canDec[field] : !canInc) return
    setForm(prev => ({ ...prev, [field]: prev[field] + delta }))
  }

  /* Display only: the registry prices the booking again on its side */
  const lines = [
    { key: 'adults', qty: form.adults, price: PRICE_PER_PERSON },
    { key: 'children', qty: form.children, price: CHILD_PRICE },
  ].map((line) => ({ ...line, amount: line.qty * line.price }))
  const total = lines.reduce((sum, line) => sum + line.amount, 0)

  /* Departures that start within BOOKING_LEAD_MINUTES (Costa Rica time) can't be booked;
     once today has none left, the calendar starts tomorrow */
  const now = businessNow()
  const openToday = TOUR_TIMES.filter((slot) => toMinutes(slot) - now.minutes >= BOOKING_LEAD_MINUTES)
  const minDate = openToday.length ? now.date : nextDay(now.date)
  const openTimes = form.date === now.date ? openToday : TOUR_TIMES
  const time = openTimes.includes(form.time) ? form.time : openTimes[0] // derived, never stale
  const dateValid = Boolean(form.date) && form.date >= minDate

  /* The custom date picker has no native `required`. Checked on the submit click
     (Enter in a field also fires it), before the browser validates the other fields,
     so the first field on screen is the first one flagged. */
  const requireDate = (e) => {
    if (dateValid) return
    e.preventDefault()
    setDateMissing(true)
    document.getElementById('booking-date')?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('processing')
    try {
      const lang = i18n.language
      const payment = await processPayment({ ...form, time, total, lang })
      // The registry prices and validates again on its side; the browser total is display-only
      const { name, email, phone, notes, date, adults, children, website } = form
      const registered = await registerBooking({ name, email, phone, notes, date, time, adults, children, lang, website, payment })
      setReference(registered.code ?? payment.reference)
      setEmailed(registered.emailed)
      setStatus('idle')
      // the card shrinks to the confirmation; bring it into view
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setForm(EMPTY)
    setReference(null)
    requestAnimationFrame(() => document.getElementById('booking-date')?.focus())
  }

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.10)] p-5 sm:p-8 scroll-mt-28"
    >
      {reference ? (
        <Confirmation booking={{ ...form, time }} reference={reference} emailed={emailed} onReset={reset} />
      ) : (
        <>
          {/* Header */}
          <p className="text-forest-600 text-xs tracking-[0.18em] uppercase font-semibold mb-1">
            {t('booking.badge')}
          </p>
          <h2
            className="font-heading font-bold text-gray-900 mb-1 leading-tight"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)' }}
          >
            {t('booking.title')}
          </h2>
          <p className="text-gray-500 text-sm mb-7">{t('booking.subtitle')}</p>

          <form onSubmit={handleSubmit} className="relative flex flex-col gap-7">
            {/* Honeypot — off-screen and skipped by keyboard and screen readers */}
            <input
              type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={form.website} onChange={set('website')}
              className="absolute -left-[10000px] top-0 w-px h-px opacity-0"
            />
            {/* 1 · Tu tour */}
            <fieldset className="flex flex-col gap-5" disabled={status === 'processing'}>
              <SectionTitle step={1}>{t('booking.tourSection')}</SectionTitle>

              <div>
                <label htmlFor="booking-date" className={labelCls}>{t('booking.dateLbl')}</label>
                <DatePicker
                  id="booking-date"
                  value={form.date}
                  minDate={minDate}
                  invalid={dateMissing}
                  onChange={(date) => {
                    setForm(prev => ({ ...prev, date }))
                    setDateMissing(false)
                  }}
                />
                {dateMissing && (
                  <p role="alert" className="text-xs text-red-600 mt-1.5">{t('booking.dateRequired')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stepper
                  id="booking-adults" label={t('booking.adultsLbl')} caption={t('booking.adultsHint')}
                  value={form.adults} canDec={canDec.adults} canInc={canInc}
                  onDec={() => adjust('adults', -1)} onInc={() => adjust('adults', 1)}
                  decLabel={t('booking.adultsDec')} incLabel={t('booking.adultsInc')}
                />
                <Stepper
                  id="booking-children" label={t('booking.childrenLbl')} caption={t('booking.childrenHint')}
                  value={form.children} canDec={canDec.children} canInc={canInc}
                  onDec={() => adjust('children', -1)} onInc={() => adjust('children', 1)}
                  decLabel={t('booking.childrenDec')} incLabel={t('booking.childrenInc')}
                />
              </div>

              {/* Hora — radios nativos con estilo de chip */}
              <div role="radiogroup" aria-labelledby="booking-time-lbl">
                <span id="booking-time-lbl" className={labelCls}>{t('booking.timeLbl')}</span>
                <div className="grid grid-cols-3 gap-2">
                  {TOUR_TIMES.map((slot) => (
                    <label key={slot} className="cursor-pointer">
                      <input
                        type="radio" name="booking-time" value={slot}
                        checked={time === slot} onChange={set('time')}
                        disabled={!openTimes.includes(slot)}
                        className="peer sr-only"
                      />
                      <span className="block text-center rounded-xl border border-gray-200 py-3 text-sm text-gray-600
                                       transition-colors duration-200 whitespace-nowrap
                                       hover:border-forest-300
                                       peer-checked:border-forest-500 peer-checked:bg-forest-500 peer-checked:text-white
                                       peer-focus-visible:ring-2 peer-focus-visible:ring-forest-500 peer-focus-visible:ring-offset-1
                                       peer-disabled:opacity-40 peer-disabled:line-through peer-disabled:cursor-not-allowed
                                       peer-disabled:hover:border-gray-200">
                        {slot}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            <div className="h-px bg-gray-100" />

            {/* 2 · Tus datos */}
            <fieldset className="flex flex-col gap-5" disabled={status === 'processing'}>
              <SectionTitle step={2}>{t('booking.detailsSection')}</SectionTitle>
              <div>
                <label htmlFor="booking-name" className={labelCls}>{t('booking.nameLbl')}</label>
                <input
                  id="booking-name" type="text" required autoComplete="name" maxLength={60}
                  pattern={"\\p{L}[\\p{L}' \\-]{1,59}"} title={t('booking.nameRule')}
                  value={form.name} onChange={set('name')}
                  placeholder={t('booking.namePh')} className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-email" className={labelCls}>{t('booking.emailLbl')}</label>
                  <input
                    id="booking-email" type="email" required autoComplete="email"
                    value={form.email} onChange={set('email')}
                    placeholder={t('booking.emailPh')} className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="booking-phone" className={labelCls}>{t('booking.phoneLbl')}</label>
                  <input
                    id="booking-phone" type="tel" required autoComplete="tel" maxLength={30}
                    pattern="[+\(\)0-9 .\-]{6,30}" title={t('booking.phoneRule')}
                    value={form.phone} onChange={set('phone')}
                    placeholder={t('booking.phonePh')} className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="booking-notes" className={labelCls}>{t('booking.notesLbl')}</label>
                <textarea
                  id="booking-notes" rows={3}
                  value={form.notes} onChange={set('notes')}
                  placeholder={t('booking.notesPh')} className={`${inputCls} resize-none`}
                />
              </div>
            </fieldset>

            <div className="h-px bg-gray-100" />

            {/* 3 · Pago */}
            <div className="flex flex-col gap-5">
              <SectionTitle step={3}>{t('booking.paymentSection')}</SectionTitle>

              {/* Método — la pasarela aporta sus propios campos de tarjeta; aquí no se capturan */}
              <div className="flex items-center gap-3 rounded-xl border-2 border-forest-500 bg-forest-50/50 px-4 py-3.5">
                <span className="w-4 h-4 rounded-full border-[5px] border-forest-500 bg-white flex-shrink-0" aria-hidden="true" />
                <span className="flex-1 text-sm font-medium text-gray-800">{t('booking.cardMethod')}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  className="text-forest-600">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>

              {/* Resumen — formato de factura: concepto · cant. · precio · importe */}
              <section aria-labelledby="booking-summary-title" className="rounded-2xl border border-gray-200 overflow-hidden text-sm">
                <div className="bg-[#f6f8f5] px-4 sm:px-5 py-4 border-b border-gray-200">
                  <p id="booking-summary-title" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700 mb-1">
                    {t('booking.summaryTitle')}
                  </p>
                  <p className="font-semibold text-gray-900">{t('tours.card.title')}</p>
                  <ul className="mt-2.5 flex flex-col gap-1.5 text-gray-600">
                    <li className="flex items-center gap-2">
                      <Icon name="calendar" />
                      {form.date
                        ? <span className="first-letter:uppercase">{formatDate(form.date, i18n.language)}</span>
                        : <span className="text-amber-700">{t('booking.datePending')}</span>}
                    </li>
                    <li className="flex items-center gap-2"><Icon name="clock" />{time}</li>
                    <li className="flex items-center gap-2"><Icon name="people" />{t('booking.peopleCount', { count: people })}</li>
                  </ul>
                </div>

                <div className="px-4 sm:px-5 py-3 bg-white">
                  <table className="w-full tabular-nums">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                        <th scope="col" className="text-left font-medium pb-2">{t('booking.colConcept')}</th>
                        <th scope="col" className="text-center font-medium pb-2 px-1">{t('booking.colQty')}</th>
                        <th scope="col" className="text-right font-medium pb-2 px-1">{t('booking.colPrice')}</th>
                        <th scope="col" className="text-right font-medium pb-2">{t('booking.colAmount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr key={line.key} className={`border-t border-gray-100 ${line.qty ? 'text-gray-800' : 'text-gray-400'}`}>
                          <th scope="row" className="text-left font-medium py-2.5 pr-2">
                            {t(`booking.${line.key}Lbl`)}
                            <span className="block text-xs font-normal text-gray-500">{t(`booking.${line.key}Hint`)}</span>
                          </th>
                          <td className="text-center py-2.5 px-1">{line.qty}</td>
                          <td className="text-right py-2.5 px-1">{money(line.price)}</td>
                          <td className="text-right py-2.5 font-medium">{money(line.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200 text-gray-600">
                        <th scope="row" colSpan={3} className="text-left font-normal pt-3 pb-1">{t('booking.subtotal')}</th>
                        <td className="text-right pt-3 pb-1">{money(total)}</td>
                      </tr>
                      <tr className="text-gray-600">
                        <th scope="row" colSpan={3} className="text-left font-normal pb-3">{t('booking.taxes')}</th>
                        <td className="text-right pb-3 text-forest-700">{t('booking.taxesIncluded')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex items-baseline justify-between px-4 sm:px-5 py-3.5 bg-forest-50/70 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">{t('booking.totalUsd')}</span>
                  <span className="font-heading font-bold text-forest-700 text-2xl tabular-nums">{money(total)}</span>
                </div>
              </section>

              {status === 'error' && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {t('booking.paymentError')}
                </p>
              )}

              <button
                type="submit"
                onClick={requireDate}
                disabled={status === 'processing'}
                className="w-full py-4 rounded-xl text-white font-semibold text-sm
                           bg-forest-500 hover:bg-forest-400 disabled:hover:bg-forest-500
                           flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait
                           transition-all duration-200 hover:shadow-xl active:scale-[0.98]
                           shadow-lg shadow-forest-900/20"
              >
                {status === 'processing'
                  ? <><Spinner />{t('booking.processing')}</>
                  : t('booking.pay', { total })}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-gray-500 text-[13px] sm:text-xs -mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {t('booking.secureNote')}
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
