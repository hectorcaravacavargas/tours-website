import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/* Dates are handled as local calendar days ("YYYY-MM-DD"), never as UTC instants */
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const startOfToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()) }
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function Chevron({ dir }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )
}

const navBtnCls = `w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                   border border-gray-200 text-gray-500 transition-colors duration-150
                   hover:border-forest-400 hover:text-forest-600
                   disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-300`

/*
 * Popover calendar. value / onChange / minDate use "YYYY-MM-DD"; days before minDate (default today) are disabled.
 * Keyboard: arrows move by day/week, PageUp/PageDown by month, Home/End to week edges, Esc closes.
 */
export function DatePicker({ id, value, onChange, minDate, invalid = false }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const weekStart = lang.startsWith('es') ? 1 : 0 // Monday for Spanish, Sunday for English

  const today = startOfToday()
  const min = minDate ? fromISO(minDate) : today
  const selected = value ? fromISO(value) : null

  const [open, setOpen] = useState(false)
  const [focusDate, setFocusDate] = useState(selected ?? min)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const gridRef = useRef(null)
  const focusDay = useRef(false) // move DOM focus only on open or keyboard navigation, not on month-button clicks

  const viewYear = focusDate.getFullYear()
  const viewMonth = focusDate.getMonth()
  const canGoPrev = viewYear > min.getFullYear() || viewMonth > min.getMonth()

  const clamp = (d) => (d < min ? min : d)
  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  /* Move DOM focus to the roving day after opening or keyboard navigation */
  useEffect(() => {
    if (!open || !focusDay.current) return
    focusDay.current = false
    gridRef.current?.querySelector(`[data-date="${toISO(focusDate)}"]`)?.focus()
  }, [open, focusDate])

  const toggle = () => {
    if (!open) {
      setFocusDate(clamp(selected ?? min))
      focusDay.current = true
    }
    setOpen((o) => !o)
  }

  const pick = (d) => {
    onChange(toISO(d))
    close()
  }

  const moveMonth = (delta) =>
    setFocusDate((d) => clamp(new Date(d.getFullYear(), d.getMonth() + delta, Math.min(d.getDate(), 28))))

  const onDayKey = (e) => {
    const moves = {
      ArrowLeft: () => addDays(focusDate, -1),
      ArrowRight: () => addDays(focusDate, 1),
      ArrowUp: () => addDays(focusDate, -7),
      ArrowDown: () => addDays(focusDate, 7),
      Home: () => addDays(focusDate, -((focusDate.getDay() - weekStart + 7) % 7)),
      End: () => addDays(focusDate, 6 - ((focusDate.getDay() - weekStart + 7) % 7)),
    }
    if (moves[e.key]) {
      e.preventDefault()
      focusDay.current = true
      setFocusDate(clamp(moves[e.key]()))
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      focusDay.current = true
      moveMonth(e.key === 'PageUp' ? -1 : 1)
    }
  }

  /* Month grid: leading blanks, then the days of the month */
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const leading = (firstOfMonth.getDay() - weekStart + 7) % 7
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]

  /* Jan 1 2024 was a Monday — build localized weekday labels from it */
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    capitalize(
      new Intl.DateTimeFormat(lang, { weekday: 'short' })
        .format(new Date(2024, 0, 1 + ((i + weekStart + 6) % 7)))
        .replace('.', '')
        .slice(0, 2)
    )
  )

  const monthTitle = capitalize(new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(firstOfMonth))
  const fullDate = (d) => new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  const display = selected
    ? capitalize(new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'long' }).format(selected))
    : null

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(e) => { if (open && e.key === 'Escape') { e.stopPropagation(); close() } }}
      onBlur={(e) => { if (open && e.relatedTarget && !rootRef.current.contains(e.relatedTarget)) setOpen(false) }}
    >
      {/* Trigger */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t('booking.dateLbl')}: ${display ?? t('booking.datePlaceholder')}`}
        className={`w-full flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm text-left bg-white cursor-pointer
                    border transition-all duration-200 focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1
                    ${invalid ? 'border-red-300' : open ? 'border-forest-400 ring-2 ring-forest-100' : 'border-gray-200 hover:border-forest-300'}`}
      >
        <span className={display ? 'text-gray-800 truncate' : 'text-gray-400'}>
          {display ?? t('booking.datePlaceholder')}
        </span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className="flex-shrink-0 text-forest-600">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Popover — enters from the trigger (origin top-left), 200ms strong ease-out */}
      {open && (
        <div
          role="dialog"
          aria-label={t('booking.dateDialog')}
          className="absolute left-0 right-0 sm:right-auto top-full mt-2 z-30 sm:w-[19rem]
                     rounded-2xl border border-gray-100 bg-white p-4
                     shadow-[0_24px_60px_-16px_rgba(13,40,24,0.35)]
                     origin-top-left transition-[opacity,scale,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
                     starting:opacity-0 starting:scale-[0.96] starting:-translate-y-1
                     motion-reduce:transition-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => moveMonth(-1)} disabled={!canGoPrev}
              aria-label={t('booking.prevMonth')} className={navBtnCls}>
              <Chevron dir="left" />
            </button>
            <p className="font-heading font-bold text-gray-900 text-base" aria-live="polite">{monthTitle}</p>
            <button type="button" onClick={() => moveMonth(1)}
              aria-label={t('booking.nextMonth')} className={navBtnCls}>
              <Chevron dir="right" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-1" aria-hidden="true">
            {weekdays.map((w, i) => (
              <span key={i} className="text-center text-[0.7rem] font-semibold text-gray-400 py-1.5">{w}</span>
            ))}
          </div>

          {/* Days */}
          <div ref={gridRef} className="grid grid-cols-7 gap-y-1" onKeyDown={onDayKey}>
            {cells.map((d, i) => {
              if (!d) return <span key={`blank-${i}`} />
              const iso = toISO(d)
              const isPast = d < min
              const isSelected = value === iso
              const isToday = iso === toISO(today)
              return (
                <button
                  key={iso}
                  type="button"
                  data-date={iso}
                  tabIndex={iso === toISO(focusDate) ? 0 : -1}
                  disabled={isPast}
                  onClick={() => pick(d)}
                  aria-label={fullDate(d)}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  className={`mx-auto w-full max-w-10 aspect-square rounded-full text-sm flex items-center justify-center
                              transition-colors duration-150 focus:outline-none
                              focus-visible:ring-2 focus-visible:ring-forest-300 focus-visible:ring-offset-1
                              ${isSelected
                                ? 'bg-forest-500 text-white font-semibold shadow-md shadow-forest-900/25'
                                : isPast
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : `text-gray-700 cursor-pointer hover:bg-forest-50 hover:text-forest-700
                                     ${isToday ? 'ring-1 ring-inset ring-forest-400 font-semibold text-forest-700' : ''}`}`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
