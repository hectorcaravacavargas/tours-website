/**
 * Tour de Caballos El Trapiche — booking registry (Google Apps Script web app).
 *
 * The website POSTs each confirmed booking here. This script then:
 *   1. validates it again on the server and recomputes the price,
 *   2. appends a row to the "Reservas" sheet of the spreadsheet it is bound to,
 *   3. creates an event in the business calendar,
 *   4. emails the business a notification and the customer a booking receipt.
 *
 * Setup and deployment: see README.md in this folder.
 * Script properties (Project Settings → Script properties), kept out of the code:
 *   NOTIFY_EMAILS   business emails that get the notification, comma-separated (required)
 *   CALENDAR_ID     calendar for the events (optional; defaults to the account's main calendar)
 *   SPREADSHEET_ID  written by setup(); the web app opens the sheet by id (getActive* is not
 *                   guaranteed in web-app executions)
 */

const CONFIG = {
  BUSINESS_NAME: 'Tour de Caballos El Trapiche',
  TOUR_NAME: { es: 'Tour por Senderos Naturales a Caballo', en: 'Nature Trail Horseback Tour' },
  // Keep in sync with src/config/business.js
  ADULT_PRICE: 50, // USD, taxes included
  // Reduced rate for children under CHILD_AGE_LIMIT. Equals the adult price until the business confirms it.
  CHILD_PRICE: 50,
  CHILD_AGE_LIMIT: 12,
  MIN_PEOPLE: 2,
  MAX_PEOPLE: 20,
  TOUR_TIMES: ['8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm'],
  BOOKING_LEAD_MINUTES: 60,
  TOUR_DURATION_MINUTES: 120,
  TIMEZONE: 'America/Costa_Rica',
  UTC_OFFSET: '-06:00', // Costa Rica has no daylight saving time
  WHATSAPP: '50687711701',
  MAPS_URL: 'https://maps.google.com/?q=10.4266613,-84.5951054',
  MEETING_POINT: 'Finca El Trapiche — Abanico de Peñas Blancas, La Fortuna',
  SHEET_NAME: 'Reservas',
  // 'demo' until the payment gateway confirms charges server-side (see README → Pasarela de pago)
  PAYMENT_MODE: 'demo',
  // Per-address cap in fixed 10-minute windows. There is deliberately no global cap: one attacker
  // could use it to block every real booking. Gmail's daily quota is checked before each send instead.
  RATE_LIMIT: { MAX_PER_EMAIL: 3, EMAIL_WINDOW_SECONDS: 600 },
}

/* Reading order: when and who first, bookkeeping last. The script finds every column by its
   header name, so the business can reorder or add columns without breaking anything. */
const SHEET_HEADERS = [
  'Fecha del tour', 'Hora', 'Estado', 'Código', 'Nombre', 'Teléfono',
  'Adultos', 'Niños', 'Personas', 'Total (USD)', 'Correo', 'Comentarios',
  'Idioma', 'Pago', 'Precio adulto (USD)', 'Precio niño (USD)', 'Ref. pago', 'Registrada', 'Calendario',
]
const PANEL_NAME = 'Panel'
const BOOKING_STATES = ['Confirmada', 'Realizada', 'Cancelada', 'No se presentó']
/* [background, text] per state: the "Estado" cells are colored with conditional formatting */
const STATE_COLORS = {
  'Confirmada': ['#d8f3dc', '#1b4332'],
  'Realizada': ['#dbeafe', '#1e3a8a'],
  'Cancelada': ['#fde2e1', '#9b1c1c'],
  'No se presentó': ['#fef3c7', '#92400e'],
}
const BRAND = { dark: '#0d2818', band: '#f6f8f5', input: '#fffdf2', inputBorder: '#d9c98a', muted: '#6b7280' }

/* ── Web app entry point ─────────────────────────────────────── */

function doPost(e) {
  const lock = LockService.getScriptLock()
  try {
    const input = JSON.parse((e && e.postData && e.postData.contents) || '{}')

    // Honeypot: real people never fill the hidden "website" field. Pretend success, do nothing.
    if (input.website) return jsonOut({ ok: true, code: newCode(new Date()), emailed: true })

    const now = businessNow(new Date())
    const result = validateBooking(input, now)
    if (!result.ok) return jsonOut({ ok: false, error: result.error })
    const booking = result.booking

    lock.waitLock(10000)
    if (isRateLimited(booking.email)) return jsonOut({ ok: false, error: 'rate_limited' })

    booking.createdAt = new Date()
    booking.code = newCode(booking.createdAt)

    // The sheet row is the source of truth: written first, so a calendar or email
    // failure never loses the booking (and a retry never duplicates it).
    const { sheet, row } = appendBookingRow(booking)
    try {
      const event = createCalendarEvent(booking)
      booking.eventId = event.id
      setCalendarLink(sheet, row, event.url)
    } catch (err) {
      console.error('Calendar event failed', err)
    }
    let emailed = true
    try {
      sendBookingEmails(booking)
    } catch (err) {
      emailed = false
      console.error('Emails failed', err)
    }

    return jsonOut({ ok: true, code: booking.code, emailed })
  } catch (err) {
    console.error(err && err.stack ? err.stack : err)
    return jsonOut({ ok: false, error: 'server_error' })
  } finally {
    lock.releaseLock()
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

/* ── Validation (pure: no Google services, unit-tested in Code.test.mjs) ── */

/* Today's date and minutes since midnight in Costa Rica */
function businessNow(date) {
  const day = Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy-MM-dd')
  const [h, m] = Utilities.formatDate(date, CONFIG.TIMEZONE, 'HH:mm').split(':').map(Number)
  return { date: day, minutes: h * 60 + m }
}

/* "1:00 pm" → 780 */
function toMinutes(label) {
  const match = /^(\d{1,2}):(\d{2}) (am|pm)$/.exec(label)
  return ((Number(match[1]) % 12) + (match[3] === 'pm' ? 12 : 0)) * 60 + Number(match[2])
}

function cleanText(value, maxLength) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function isRealDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/**
 * Re-checks everything the browser already checked: the browser is not trusted.
 * Returns { ok: true, booking } or { ok: false, error }.
 */
function validateBooking(input, now) {
  const name = cleanText(input.name, 60)
  const email = cleanText(input.email, 120).toLowerCase()
  const phone = cleanText(input.phone, 30)
  const notes = String(input.notes == null ? '' : input.notes).trim().slice(0, 500)
  const date = cleanText(input.date, 10)
  const time = cleanText(input.time, 8)
  const adults = Number(input.adults)
  const children = Number(input.children == null ? 0 : input.children)
  const people = adults + children
  const lang = input.lang === 'en' ? 'en' : 'es'

  // Letters, spaces, apostrophes and hyphens only: the receipt greeting can't carry a URL
  if (!/^\p{L}[\p{L} '-]{1,59}$/u.test(name)) return { ok: false, error: 'invalid_name' }
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) return { ok: false, error: 'invalid_email' }
  if (!/^[+()\d\s.-]{6,30}$/.test(phone)) return { ok: false, error: 'invalid_phone' }
  if (!isRealDate(date)) return { ok: false, error: 'invalid_date' }
  if (CONFIG.TOUR_TIMES.indexOf(time) === -1) return { ok: false, error: 'invalid_time' }
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 0 || children < 0) {
    return { ok: false, error: 'invalid_people' }
  }
  if (adults < 1) return { ok: false, error: 'adult_required' } // children ride with an adult
  if (people < CONFIG.MIN_PEOPLE || people > CONFIG.MAX_PEOPLE) {
    return { ok: false, error: 'invalid_people' }
  }
  if (date < now.date) return { ok: false, error: 'date_in_past' }
  if (date === now.date && toMinutes(time) - now.minutes < CONFIG.BOOKING_LEAD_MINUTES) {
    return { ok: false, error: 'departure_closed' }
  }

  const payment = input.payment || {}
  return {
    ok: true,
    booking: {
      name, email, phone, notes, date, time, adults, children, people, lang,
      adultPrice: CONFIG.ADULT_PRICE,
      childPrice: CONFIG.CHILD_PRICE,
      // priced here, never taken from the browser
      total: adults * CONFIG.ADULT_PRICE + children * CONFIG.CHILD_PRICE,
      paymentMethod: 'card',
      paymentReference: cleanText(payment.reference, 40),
      paymentStatus: CONFIG.PAYMENT_MODE === 'demo' ? 'simulated' : 'pending_verification',
    },
  }
}

/* Short, readable, unambiguous code: TRP-261124-K7QM */
function newCode(date) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  return `TRP-${Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyMMdd')}-${suffix}`
}

/* Store visitor strings as plain text: no formulas (=, +, -, @) and no number parsing
   (phones keep a leading 0 or +). Sheets hides the apostrophe. */
function safeCell(value) {
  return typeof value === 'string' && value !== '' ? `'${value}` : value
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/* "Ana.Mora+promo@gmail.com" and "anamora@gmail.com" count as the same address */
function normalizeEmail(email) {
  const [local, domain] = email.split('@')
  const base = local.split('+')[0]
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com'
  return `${isGmail ? base.split('.').join('') : base}@${domain}`
}

/* Fixed window: the bucket number is part of the key, so a put never extends the window */
function isRateLimited(email) {
  const cache = CacheService.getScriptCache()
  const windowSeconds = CONFIG.RATE_LIMIT.EMAIL_WINDOW_SECONDS
  const key = `rl:${normalizeEmail(email)}:${Math.floor(Date.now() / (windowSeconds * 1000))}`
  const count = Number(cache.get(key) || 0)
  if (count >= CONFIG.RATE_LIMIT.MAX_PER_EMAIL) return true
  cache.put(key, String(count + 1), windowSeconds)
  return false
}

/* ── Calendar ───────────────────────────────────────────────── */

function tourStart(booking) {
  const minutes = toMinutes(booking.time)
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return new Date(`${booking.date}T${hh}:${mm}:00${CONFIG.UTC_OFFSET}`)
}

function createCalendarEvent(booking) {
  const id = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID')
  const calendar = (id && CalendarApp.getCalendarById(id)) || CalendarApp.getDefaultCalendar()
  const start = tourStart(booking)
  const end = new Date(start.getTime() + CONFIG.TOUR_DURATION_MINUTES * 60000)
  const event = calendar.createEvent(`🐴 ${booking.people} pers · ${booking.name}`, start, end, {
    // Google Calendar renders the description as HTML, so visitor values are escaped
    description: [
      `Código: ${booking.code}`,
      `Personas: ${peopleSummary(booking, 'es')} · Total: $${booking.total} USD`,
      `Teléfono: ${escapeHtml(booking.phone)}`,
      `Correo: ${escapeHtml(booking.email)}`,
      booking.notes ? `Comentarios: ${escapeHtml(booking.notes)}` : '',
      `Idioma: ${booking.lang.toUpperCase()}`,
      `Pago: ${paymentLabel(booking, 'es')}`,
    ].filter(Boolean).join('<br>'),
  })
  // A link that opens the event: eid = base64("<event id without @google.com> <calendar id>")
  const eid = Utilities.base64Encode(`${event.getId().split('@')[0]} ${calendar.getId()}`).replace(/=+$/, '')
  return { id: event.getId(), url: `https://www.google.com/calendar/event?eid=${encodeURIComponent(eid)}` }
}

/* ── Sheet ──────────────────────────────────────────────────── */

function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet()
}

/* "A", "B", … "S" for a 1-based column number */
function columnLetter(n) {
  let letters = ''
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) letters = String.fromCharCode(65 + ((x - 1) % 26)) + letters
  return letters
}

/* Booking values keyed by header name */
function bookingRecord(booking) {
  const [y, m, d] = booking.date.split('-').map(Number)
  return {
    'Fecha del tour': new Date(y, m - 1, d),
    'Hora': toMinutes(booking.time) / 1440, // a real time value, so sorting by hour works
    'Estado': BOOKING_STATES[0],
    'Código': booking.code,
    'Nombre': safeCell(booking.name),
    'Teléfono': safeCell(booking.phone),
    'Adultos': booking.adults,
    'Niños': booking.children,
    'Personas': booking.people,
    'Total (USD)': booking.total,
    'Correo': safeCell(booking.email),
    'Comentarios': safeCell(booking.notes),
    'Idioma': booking.lang.toUpperCase(),
    'Pago': paymentLabel(booking, 'es'),
    'Precio adulto (USD)': booking.adultPrice,
    'Precio niño (USD)': booking.childPrice,
    'Ref. pago': safeCell(booking.paymentReference),
    'Registrada': booking.createdAt,
    'Calendario': '', // the link is written once the calendar event exists
  }
}

/* The record laid out in the sheet's own column order; headers it doesn't know stay empty */
function bookingRow(booking, headers) {
  const record = bookingRecord(booking)
  return (headers || SHEET_HEADERS).map((header) => (header in record ? record[header] : ''))
}

function getBookingSheet() {
  const spreadsheet = getSpreadsheet()
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME)
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME)
  if (sheet.getLastRow() === 0) formatBookingSheet(sheet)
  return sheet
}

function headersOf(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
}

/* Appends the booking under the matching headers. Returns { sheet, row }. */
function appendBookingRow(booking) {
  const sheet = getBookingSheet()
  sheet.appendRow(bookingRow(booking, headersOf(sheet)))
  const row = sheet.getLastRow()
  setStateDropdown(sheet, row, 1)
  return { sheet, row }
}

/* "Estado" dropdown on booking rows only, so empty rows don't show arrows */
function setStateDropdown(sheet, row, count) {
  const col = headersOf(sheet).indexOf('Estado') + 1
  if (!col) return
  sheet.getRange(row, col, count, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(BOOKING_STATES, true).build())
}

function setCalendarLink(sheet, row, url) {
  const col = headersOf(sheet).indexOf('Calendario') + 1
  if (!col) return
  sheet.getRange(row, col).setRichTextValue(
    SpreadsheetApp.newRichTextValue().setText('Ver en calendario').setLinkUrl(url).build()
  )
}

/* Colors for the "Estado" cells, one conditional-format rule per state */
function stateColorRules(range) {
  return BOOKING_STATES.map((state) => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(state)
    .setBackground(STATE_COLORS[state][0])
    .setFontColor(STATE_COLORS[state][1])
    .setBold(true)
    .setRanges([range])
    .build())
}

const COLUMN_WIDTHS = {
  'Fecha del tour': 125, 'Hora': 80, 'Estado': 135, 'Código': 145, 'Nombre': 180, 'Teléfono': 135,
  'Adultos': 96, 'Niños': 84, 'Personas': 104, 'Total (USD)': 120, 'Correo': 220, 'Comentarios': 280,
  'Idioma': 88, 'Pago': 190, 'Precio adulto (USD)': 120, 'Precio niño (USD)': 115, 'Ref. pago': 110,
  'Registrada': 130, 'Calendario': 140,
}

/* Header, column formats, state colors and dropdown, banding, filter buttons, frozen panes */
function formatBookingSheet(sheet) {
  const width = SHEET_HEADERS.length
  // shortcut: formats cover the sheet's current rows (1,000 by default); rows Sheets adds later
  // inherit the formatting above them. Re-run setup() if a very long sheet ever loses it.
  const rows = sheet.getMaxRows() - 1
  const col = (name) => sheet.getRange(2, SHEET_HEADERS.indexOf(name) + 1, rows, 1)

  // Re-runnable: Sheets refuses a second filter or overlapping banding, so drop the old ones first
  const filter = sheet.getFilter()
  if (filter) filter.remove()
  sheet.getBandings().forEach((banding) => banding.remove())

  sheet.getRange(1, 1, 1, width).setValues([SHEET_HEADERS])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground(BRAND.dark)
    .setVerticalAlignment('middle').setWrap(true)
  sheet.setRowHeight(1, 36)
  sheet.setFrozenRows(1)
  sheet.setFrozenColumns(2) // date and time stay visible while scrolling sideways

  col('Fecha del tour').setNumberFormat('ddd d mmm yyyy')
  col('Hora').setNumberFormat('h:mm am/pm').setHorizontalAlignment('center')
  ;['Total (USD)', 'Precio adulto (USD)', 'Precio niño (USD)'].forEach((name) => col(name).setNumberFormat('"$"#,##0'))
  col('Registrada').setNumberFormat('d/m/yyyy h:mm')
  ;['Adultos', 'Niños', 'Personas', 'Idioma', 'Estado'].forEach((name) => col(name).setHorizontalAlignment('center'))
  col('Comentarios').setWrap(true)
  col('Estado').clearDataValidations()
  const booked = sheet.getLastRow() - 1
  if (booked > 0) setStateDropdown(sheet, 2, booked)
  sheet.setConditionalFormatRules(stateColorRules(col('Estado')))
  sheet.getRange(2, 1, rows, width).setVerticalAlignment('middle')
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
    .setFirstRowColor('#ffffff').setSecondRowColor(BRAND.band)
  SHEET_HEADERS.forEach((name, i) => sheet.setColumnWidth(i + 1, COLUMN_WIDTHS[name] || 120))
  sheet.getRange(1, 1, rows + 1, width).createFilter() // filter buttons on every header
}

/*
 * Moves rows written with an older column layout into the current one, matching by header name.
 * "Hora" used to be text ("9:00 am") and becomes a time value. Returns the rows to write.
 */
function migrateRows(oldHeaders, oldRows) {
  return oldRows
    .filter((r) => r.some((v) => v !== '' && v !== null))
    .map((r) => SHEET_HEADERS.map((header) => {
      const i = oldHeaders.indexOf(header)
      if (i === -1) return ''
      const v = r[i]
      if (header === 'Hora') {
        if (v instanceof Date) return (v.getHours() * 60 + v.getMinutes()) / 1440
        if (typeof v === 'string' && /^\d{1,2}:\d{2} (am|pm)$/.test(v)) return toMinutes(v) / 1440
      }
      return v
    }))
}

/*
 * setup(): an existing "Reservas" with another layout is kept as "Reservas (formato anterior)"
 * and its rows are copied into a fresh, formatted "Reservas". Nothing is deleted.
 */
function upgradeBookingSheet(spreadsheet) {
  const old = spreadsheet.getSheetByName(CONFIG.SHEET_NAME)
  if (!old || old.getLastRow() === 0) return getBookingSheet()
  const values = old.getDataRange().getValues()
  if (values[0].map(String).join('|') === SHEET_HEADERS.join('|')) {
    formatBookingSheet(old) // same layout: refresh the formatting only
    return old
  }
  old.setName(`${CONFIG.SHEET_NAME} (formato anterior)`)
  const sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME)
  const rows = migrateRows(values[0].map(String), values.slice(1))
  if (rows.length) sheet.getRange(2, 1, rows.length, SHEET_HEADERS.length).setValues(rows)
  formatBookingSheet(sheet) // after the rows, so their state dropdowns are set
  return sheet
}

/* The FILTER formula behind the Panel: every input left empty means "don't filter by this" */
function panelFormula() {
  const c = (name) => columnLetter(SHEET_HEADERS.indexOf(name) + 1)
  const r = (name) => `${CONFIG.SHEET_NAME}!${c(name)}2:${c(name)}`
  const shown = PANEL_COLUMNS.map((name) => SHEET_HEADERS.indexOf(name) + 1).join(',')
  return `=IFERROR(SORT(CHOOSECOLS(FILTER(${CONFIG.SHEET_NAME}!A2:${columnLetter(SHEET_HEADERS.length)},`
    + `${r('Código')}<>"",`
    + `(A5="")+(${r('Fecha del tour')}>=A5),`
    + `(B5="")+(${r('Fecha del tour')}<=B5),`
    + `(C5="Todos")+(C5="")+(${r('Estado')}=C5),`
    + `(D5="")+ISNUMBER(SEARCH(D5,${r('Código')})),`
    + `(E5="")+ISNUMBER(SEARCH(E5,${r('Nombre')}&" "&${r('Correo')}&" "&${r('Teléfono')}))`
    + `),${shown}),1,TRUE,2,TRUE),"No hay reservas con estos filtros")`
}

const PANEL_COLUMNS = [
  'Fecha del tour', 'Hora', 'Estado', 'Código', 'Nombre', 'Teléfono',
  'Adultos', 'Niños', 'Personas', 'Total (USD)', 'Comentarios',
]

/* "Panel": search box on top, totals, and the matching bookings sorted by date and time */
function buildPanel(spreadsheet) {
  const existing = spreadsheet.getSheetByName(PANEL_NAME)
  if (existing) spreadsheet.deleteSheet(existing) // holds no data, only inputs and formulas
  const panel = spreadsheet.insertSheet(PANEL_NAME, 0)
  const width = PANEL_COLUMNS.length
  const first = 11 // first result row
  const rows = panel.getMaxRows() - first + 1

  panel.setHiddenGridlines(true)
  panel.getRange(1, 1, 1, width).merge().setValue('Reservas · Tour de Caballos El Trapiche')
    .setFontSize(16).setFontWeight('bold').setFontColor('#ffffff').setBackground(BRAND.dark)
    .setVerticalAlignment('middle')
  panel.setRowHeight(1, 44)
  panel.getRange(2, 1, 1, width).merge()
    .setValue('Filtra con las celdas amarillas (deja vacío lo que no quieras filtrar). Las reservas se editan en la pestaña «Reservas».')
    .setFontColor(BRAND.muted).setFontStyle('italic')

  // Filters
  panel.getRange('A4:E4').setValues([['Desde', 'Hasta', 'Estado', 'Código', 'Cliente (nombre, correo o teléfono)']])
    .setFontWeight('bold').setFontColor(BRAND.muted).setFontSize(9)
  panel.getRange('E4:G4').merge()
  panel.getRange('E5:G5').merge()
  const inputs = panel.getRange('A5:G5')
  inputs.setBackground(BRAND.input).setBorder(true, true, true, true, true, false, BRAND.inputBorder, SpreadsheetApp.BorderStyle.SOLID)
  panel.setRowHeight(5, 30)
  inputs.setVerticalAlignment('middle')
  const dateRule = SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build()
  panel.getRange('A5:B5').setDataValidation(dateRule).setNumberFormat('ddd d mmm yyyy')
  panel.getRange('A5').setFormula('=TODAY()') // upcoming bookings by default; type a date or clear it
  panel.getRange('C5').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Todos'].concat(BOOKING_STATES), true).build()
  ).setValue('Todos')

  // Totals for what the filters show
  const res = (i) => `${columnLetter(PANEL_COLUMNS.indexOf(i) + 1)}${first}:${columnLetter(PANEL_COLUMNS.indexOf(i) + 1)}`
  panel.getRange('A7:F7').setValues([['Reservas', '', 'Personas', '', 'Total (USD)', '']])
    .setFontWeight('bold').setFontColor(BRAND.muted).setFontSize(9)
  panel.getRange('A8').setFormula(`=COUNTIF(${res('Código')},"TRP-*")`)
  panel.getRange('C8').setFormula(`=SUM(${res('Personas')})`)
  panel.getRange('E8').setFormula(`=SUM(${res('Total (USD)')})`).setNumberFormat('"$"#,##0')
  panel.getRange('A8:F8').setFontSize(18).setFontWeight('bold').setFontColor(BRAND.dark).setHorizontalAlignment('left')

  // Results
  panel.getRange(first - 1, 1, 1, width).setValues([PANEL_COLUMNS])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground(BRAND.dark).setVerticalAlignment('middle')
  panel.setRowHeight(first - 1, 30)
  panel.getRange(first, 1).setFormula(panelFormula())
  const out = (name) => panel.getRange(first, PANEL_COLUMNS.indexOf(name) + 1, rows, 1)
  out('Fecha del tour').setNumberFormat('ddd d mmm yyyy')
  out('Hora').setNumberFormat('h:mm am/pm').setHorizontalAlignment('center')
  out('Total (USD)').setNumberFormat('"$"#,##0')
  ;['Estado', 'Adultos', 'Niños', 'Personas'].forEach((name) => out(name).setHorizontalAlignment('center'))
  panel.setConditionalFormatRules(stateColorRules(out('Estado')))
  panel.getRange(first, 1, rows, width)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
    .setFirstRowColor('#ffffff').setSecondRowColor(BRAND.band)
  PANEL_COLUMNS.forEach((name, i) => panel.setColumnWidth(i + 1, COLUMN_WIDTHS[name] || 120))
  panel.setColumnWidth(PANEL_COLUMNS.indexOf('Fecha del tour') + 1, 140)
  panel.setFrozenRows(first - 1)
  return panel
}

/* ── Emails ─────────────────────────────────────────────────── */

const TEXT = {
  es: {
    receiptTitle: 'Comprobante de reserva',
    receiptSubject: (b) => `Tu reserva ${b.code} · ${CONFIG.BUSINESS_NAME}`,
    greeting: (b) => `¡Hola, ${b.name}! Tu tour está reservado. Aquí tienes todos los detalles.`,
    issued: 'Emitido',
    tour: 'Tour', date: 'Fecha', departure: 'Hora de salida', people: 'Personas', meeting: 'Punto de encuentro',
    customer: 'Cliente', name: 'Nombre', email: 'Correo', phone: 'Teléfono', notes: 'Comentarios',
    payment: 'Pago', adults: 'Adultos', children: `Niños (menores de ${CONFIG.CHILD_AGE_LIMIT})`,
    subtotal: 'Subtotal', qtyAt: (n, price) => `${n} × $${price}`,
    each: 'c/u', total: 'Total', taxes: 'Impuestos incluidos', method: 'Método', card: 'Tarjeta',
    bookingCode: 'Código de reserva', reference: 'Referencia de pago', status: 'Estado',
    beforeTitle: 'Antes de tu tour',
    bring: 'Lleva zapatos cerrados, pantalón largo, protector solar, repelente, agua y una muda de ropa extra.',
    policy: 'Políticas: si no te presentas no hay reembolso, y no se aceptan cancelaciones por condiciones climáticas.',
    questions: '¿Preguntas o cambios? Escríbenos por WhatsApp',
    mapLink: 'Ver en Google Maps',
    legal: 'Este correo es un comprobante de reserva y no constituye una factura electrónica.',
  },
  en: {
    receiptTitle: 'Booking receipt',
    receiptSubject: (b) => `Your booking ${b.code} · ${CONFIG.BUSINESS_NAME}`,
    greeting: (b) => `Hi ${b.name}! Your tour is booked. Here are all the details.`,
    issued: 'Issued',
    tour: 'Tour', date: 'Date', departure: 'Departure time', people: 'People', meeting: 'Meeting point',
    customer: 'Customer', name: 'Name', email: 'Email', phone: 'Phone', notes: 'Comments',
    payment: 'Payment', adults: 'Adults', children: `Children (under ${CONFIG.CHILD_AGE_LIMIT})`,
    subtotal: 'Subtotal', qtyAt: (n, price) => `${n} × $${price}`,
    each: 'each', total: 'Total', taxes: 'Taxes included', method: 'Method', card: 'Card',
    bookingCode: 'Booking code', reference: 'Payment reference', status: 'Status',
    beforeTitle: 'Before your tour',
    bring: 'Bring closed-toe shoes, long pants, sunscreen, insect repellent, water, and a change of clothes.',
    policy: 'Policies: no refunds for no-shows, and no cancellations due to weather conditions.',
    questions: 'Questions or changes? Message us on WhatsApp',
    mapLink: 'Open in Google Maps',
    legal: 'This email is a booking receipt and is not an electronic invoice.',
  },
}

function peopleSummary(booking, lang) {
  const words = lang === 'en'
    ? [['adult', 'adults'], ['child', 'children']]
    : [['adulto', 'adultos'], ['niño', 'niños']]
  const part = (n, [one, many]) => `${n} ${n === 1 ? one : many}`
  return booking.children ? `${part(booking.adults, words[0])}, ${part(booking.children, words[1])}` : part(booking.adults, words[0])
}

/* Invoice lines: adults always, children only when there are any */
function priceLines(booking, t) {
  const lines = [{ label: t.adults, qty: booking.adults, price: booking.adultPrice }]
  if (booking.children) lines.push({ label: t.children, qty: booking.children, price: booking.childPrice })
  return lines.map((line) => ({ ...line, amount: line.qty * line.price }))
}

function paymentLabel(booking, lang) {
  const labels = {
    simulated: { es: 'Simulado (demo) — sin cobro', en: 'Simulated (demo) — not charged' },
    pending_verification: { es: 'Pendiente de verificación', en: 'Pending verification' },
    paid: { es: 'Pagado', en: 'Paid' },
  }
  return (labels[booking.paymentStatus] || labels.pending_verification)[lang]
}

/* Fixed names instead of Intl: same output in Apps Script and in the Node tests */
const DATE_NAMES = {
  es: {
    days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  },
  en: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
}

/* "2026-12-04" → "Viernes 4 de diciembre de 2026" / "Friday, December 4, 2026" */
function formatTourDate(booking, lang) {
  const [y, m, d] = booking.date.split('-').map(Number)
  const n = DATE_NAMES[lang]
  const weekday = n.days[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  if (lang === 'en') return `${weekday}, ${n.months[m - 1]} ${d}, ${y}`
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${d} de ${n.months[m - 1]} de ${y}`
}

/* "8888 0000" → "50688880000", "0044 7700 900123" → "447700900123"; null when it can't be a full number */
function whatsappDigits(phone) {
  let digits = String(phone).replace(/\D/g, '').replace(/^00/, '')
  if (digits.length === 8) digits = `506${digits}` // a Costa Rican number typed without the country code
  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

/* One table row of label / value (value is already-escaped HTML) */
function row(label, valueHtml) {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:14px;width:40%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;vertical-align:top;word-break:break-word;overflow-wrap:anywhere;">${valueHtml}</td>
  </tr>`
}

function section(title, rowsHtml) {
  return `<tr><td style="padding:22px 32px 4px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2d6a4f;font-weight:700;">${escapeHtml(title)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rowsHtml}</table>
  </td></tr>`
}

/**
 * Receipt-style email. audience: 'customer' (in the booking language) or 'business' (Spanish).
 * Every user-provided value goes through escapeHtml.
 */
function renderEmail(booking, audience, extras) {
  const lang = audience === 'customer' ? booking.lang : 'es'
  const t = TEXT[lang]
  const isDemo = booking.paymentStatus === 'simulated'
  const waDigits = whatsappDigits(booking.phone)
  const issued = Utilities.formatDate(booking.createdAt, CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm')

  const heading = audience === 'customer'
    ? `<p style="margin:0;font-size:22px;font-weight:700;color:#111827;font-family:Georgia,'Times New Roman',serif;">${t.receiptTitle}</p>
       <p style="margin:6px 0 0;font-size:14px;color:#4b5563;">${escapeHtml(t.greeting(booking))}</p>`
    : `<p style="margin:0;font-size:22px;font-weight:700;color:#111827;font-family:Georgia,'Times New Roman',serif;">Nueva reserva</p>
       <p style="margin:6px 0 0;font-size:14px;color:#4b5563;">${escapeHtml(formatTourDate(booking, 'es'))} · ${escapeHtml(booking.time)} · ${peopleSummary(booking, 'es')}</p>`

  const tourRows =
    row(t.tour, escapeHtml(CONFIG.TOUR_NAME[lang])) +
    row(t.date, escapeHtml(formatTourDate(booking, lang))) +
    row(t.departure, escapeHtml(booking.time)) +
    row(t.people, `${booking.people} · ${peopleSummary(booking, lang)}`) +
    row(t.meeting, `${escapeHtml(CONFIG.MEETING_POINT)}<br><a href="${CONFIG.MAPS_URL}" style="color:#2d6a4f;font-weight:600;">${t.mapLink}</a>`)

  const isBusiness = audience === 'business'
  // The customer copy goes to an address nobody verified, so it never echoes free text the visitor
  // typed (comments, payment reference): otherwise the endpoint becomes a spam/phishing relay.
  const customerRows =
    row(t.name, escapeHtml(booking.name)) +
    row(t.email, escapeHtml(booking.email)) +
    row(t.phone, escapeHtml(booking.phone)) +
    (isBusiness && booking.notes ? row(t.notes, `<span style="white-space:pre-line;">${escapeHtml(booking.notes)}</span>`) : '') +
    (isBusiness ? row('Idioma', booking.lang === 'en' ? 'Inglés' : 'Español') : '')

  const lineRows = priceLines(booking, t).map((line) => `
    <tr>
      <td style="padding:8px 0;color:#111827;font-size:14px;">${escapeHtml(line.label)}<br>
        <span style="color:#6b7280;font-size:13px;">${t.qtyAt(line.qty, line.price)} ${t.each}</span></td>
      <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;vertical-align:top;white-space:nowrap;">$${line.amount}</td>
    </tr>`).join('')

  const paymentRows = `
    <tr><td colspan="2" style="padding:0 0 4px;color:#374151;font-size:14px;font-weight:600;">${escapeHtml(CONFIG.TOUR_NAME[lang])}</td></tr>
    ${lineRows}
    <tr><td colspan="2" style="border-top:1px solid #e5e7eb;padding:0;"></td></tr>
    <tr>
      <td style="padding:10px 0 2px;color:#111827;font-size:16px;font-weight:700;">${t.total}</td>
      <td style="padding:10px 0 2px;color:#1b4332;font-size:22px;font-weight:700;text-align:right;font-family:Georgia,'Times New Roman',serif;white-space:nowrap;">$${booking.total} <span style="font-size:13px;color:#6b7280;font-family:Helvetica,Arial,sans-serif;">USD</span></td>
    </tr>
    <tr><td colspan="2" style="padding:0 0 10px;color:#9ca3af;font-size:12px;">${t.taxes}</td></tr>
    ${row(t.method, t.card)}
    ${row(t.status, `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;${isDemo ? 'background:#fef3c7;color:#92400e;' : 'background:#d8f3dc;color:#1b4332;'}">${escapeHtml(paymentLabel(booking, lang))}</span>`)}
    ${isBusiness && booking.paymentReference ? row(t.reference, escapeHtml(booking.paymentReference)) : ''}`

  const customerExtras = audience === 'customer'
    ? `<tr><td style="padding:22px 32px 4px;">
         <div style="background:#f0faf4;border-radius:12px;padding:16px 18px;">
           <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1b4332;">${t.beforeTitle}</p>
           <p style="margin:0 0 6px;font-size:13px;color:#374151;line-height:1.5;">${t.bring}</p>
           <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">${t.policy}</p>
         </div>
       </td></tr>
       <tr><td style="padding:18px 32px 0;text-align:center;">
         <a href="https://wa.me/${CONFIG.WHATSAPP}" style="display:inline-block;background:#40916c;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${t.questions}</a>
       </td></tr>`
    : `<tr><td style="padding:22px 32px 0;">
         ${waDigits ? `<a href="https://wa.me/${waDigits}" style="display:inline-block;background:#40916c;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:999px;margin:0 8px 8px 0;">Escribir al cliente por WhatsApp</a>` : ''}
         ${extras && extras.sheetUrl ? `<a href="${extras.sheetUrl}" style="display:inline-block;border:1px solid #d1d5db;color:#1f2937;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:999px;margin:0 0 8px;">Abrir hoja de reservas</a>` : ''}
       </td></tr>`

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f5f1;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f1;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0d2818;padding:24px 32px;">
          <p style="margin:0;font-size:20px;color:#ffffff;font-weight:700;font-family:Georgia,'Times New Roman',serif;">🐴 ${CONFIG.BUSINESS_NAME}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#95d5b2;">La Fortuna, Costa Rica</p>
        </td></tr>
        <tr><td style="padding:26px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:top;">${heading}</td>
          </tr></table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#f9fafb;border-radius:10px;">
            <tr>
              <td style="padding:10px 14px;font-size:13px;color:#6b7280;">${t.bookingCode}<br>
                <span style="font-size:16px;color:#111827;font-weight:700;letter-spacing:.04em;white-space:nowrap;">${escapeHtml(booking.code)}</span></td>
              <td style="padding:10px 14px;font-size:13px;color:#6b7280;text-align:right;">${t.issued}<br>
                <span style="font-size:14px;color:#111827;font-weight:600;">${issued}</span></td>
            </tr>
          </table>
        </td></tr>
        ${section(t.tour, tourRows)}
        ${section(t.customer, customerRows)}
        ${section(t.payment, paymentRows)}
        ${customerExtras}
        <tr><td style="padding:26px 32px 28px;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">${[
            audience === 'customer' ? t.legal : '',
            isDemo ? (lang === 'en' ? 'Demo payment: no charge was made.' : 'Pago de demostración: no se realizó ningún cobro.') : '',
          ].filter(Boolean).join(' ')}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

/* Plain-text version for clients that block HTML (also helps deliverability) */
function renderPlainText(booking, audience) {
  const lang = audience === 'customer' ? booking.lang : 'es'
  const t = TEXT[lang]
  return [
    audience === 'customer' ? `${t.receiptTitle} — ${CONFIG.BUSINESS_NAME}` : `Nueva reserva — ${CONFIG.BUSINESS_NAME}`,
    `${t.bookingCode}: ${booking.code}`,
    '',
    `${t.tour}: ${CONFIG.TOUR_NAME[lang]}`,
    `${t.date}: ${formatTourDate(booking, lang)}`,
    `${t.departure}: ${booking.time}`,
    `${t.people}: ${booking.people} (${peopleSummary(booking, lang)})`,
    `${t.meeting}: ${CONFIG.MEETING_POINT} (${CONFIG.MAPS_URL})`,
    '',
    `${t.name}: ${booking.name}`,
    `${t.email}: ${booking.email}`,
    `${t.phone}: ${booking.phone}`,
    audience === 'business' && booking.notes ? `${t.notes}: ${booking.notes}` : null,
    '',
    ...priceLines(booking, t).map((line) => `${line.label}: ${t.qtyAt(line.qty, line.price)} ${t.each} = $${line.amount}`),
    `${t.total}: $${booking.total} USD (${t.taxes})`,
    `${t.status}: ${paymentLabel(booking, lang)}`,
    audience === 'business' && booking.paymentReference ? `${t.reference}: ${booking.paymentReference}` : null,
    '',
    audience === 'customer' ? t.legal : null,
  ].filter((line) => line !== null).join('\n')
}

function sendBookingEmails(booking) {
  const notify = (PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAILS') || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
  const sheetUrl = getSpreadsheet().getUrl()

  // Each recipient counts against Gmail's daily quota: the business notification goes first
  let quota = MailApp.getRemainingDailyQuota()
  if (notify.length && quota >= notify.length) {
    quota -= notify.length
    MailApp.sendEmail({
      to: notify.join(','),
      replyTo: booking.email,
      name: CONFIG.BUSINESS_NAME,
      subject: `Nueva reserva ${booking.code} · ${formatTourDate(booking, 'es')} ${booking.time} · ${peopleSummary(booking, 'es')}`,
      htmlBody: renderEmail(booking, 'business', { sheetUrl }),
      body: renderPlainText(booking, 'business'),
    })
  } else {
    console.warn(notify.length ? 'Mail quota exhausted: business notification not sent' : 'NOTIFY_EMAILS is not set')
  }
  if (quota < 1) throw new Error('mail_quota_exhausted') // reported to the site as emailed: false

  const receipt = {
    to: booking.email,
    name: CONFIG.BUSINESS_NAME,
    subject: TEXT[booking.lang].receiptSubject(booking),
    htmlBody: renderEmail(booking, 'customer'),
    body: renderPlainText(booking, 'customer'),
  }
  if (notify[0]) receipt.replyTo = notify[0] // customer replies reach the business
  MailApp.sendEmail(receipt)
}

/* Run from the editor after installing or updating the script. Safe to run again. */
function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  // Dates in the sheet are shown in the spreadsheet's own timezone: pin it to Costa Rica
  spreadsheet.setSpreadsheetTimeZone(CONFIG.TIMEZONE)
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheet.getId())
  spreadsheet.setActiveSheet(upgradeBookingSheet(spreadsheet))
  spreadsheet.moveActiveSheet(1) // "Reservas" first; the Panel is inserted in front of it next
  const panel = buildPanel(spreadsheet)
  // Drop the empty default tab ("Hoja 1") if it is still there
  spreadsheet.getSheets()
    .filter((sh) => sh.getLastRow() === 0 && sh.getName() !== CONFIG.SHEET_NAME && sh.getName() !== PANEL_NAME)
    .forEach((sh) => spreadsheet.deleteSheet(sh))
  spreadsheet.setActiveSheet(panel)
  console.log('Listo: pestañas "Panel" y "Reservas". Si cambiaste el código, publica una nueva versión de la app web.')
}
