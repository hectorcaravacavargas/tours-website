/*
 * Tests for Code.gs, run with: npm run test:apps-script
 * Code.gs is loaded into a VM with small, data-backed fakes for the Google services it calls.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const SOURCE = readFileSync(new URL('./Code.gs', import.meta.url), 'utf8')

/* Values created inside the VM have that realm's prototypes; compare them as plain data */
const plain = (value) => JSON.parse(JSON.stringify(value))

/* Utilities.formatDate subset used by Code.gs, backed by Intl */
function formatDate(date, timeZone, pattern) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(date).map(({ type, value }) => [type, value])
  )
  return pattern
    .replace('yyyy', p.year).replace('yy', p.year.slice(2))
    .replace('MM', p.month).replace('dd', p.day)
    .replace('HH', p.hour).replace('mm', p.minute)
}

/* "A4:E4" → [row, col, rows, cols] */
function fromA1(a1) {
  const cell = (ref) => {
    const [, letters, digits] = /^([A-Z]+)(\d+)$/.exec(ref)
    return [Number(digits), [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0)]
  }
  const [from, to = from] = a1.split(':')
  const [r1, c1] = cell(from)
  const [r2, c2] = cell(to)
  return [r1, c1, r2 - r1 + 1, c2 - c1 + 1]
}

/* A sheet that stores its cells; formatting calls are chainable no-ops */
function fakeSheet(name) {
  const sheet = {
    name, data: [], links: {}, rules: [], filter: false, dropdowns: new Set(),
    getName: () => sheet.name,
    setName: (n) => { sheet.name = n },
    getLastRow: () => sheet.data.length,
    getLastColumn: () => (sheet.data[0] || []).length,
    getMaxRows: () => 1000,
    appendRow: (values) => { sheet.data.push([...values]) },
    getRange: (row, col, nr = 1, nc = 1) => (typeof row === 'string' ? fakeRange(sheet, ...fromA1(row)) : fakeRange(sheet, row, col, nr, nc)),
    getDataRange: () => fakeRange(sheet, 1, 1, sheet.data.length, (sheet.data[0] || []).length),
    setConditionalFormatRules: (rules) => { sheet.rules = rules },
    // Like Sheets: a second filter or overlapping banding is an error unless the old one is removed
    getFilter: () => (sheet.filter ? { remove: () => { sheet.filter = false } } : null),
    getBandings: () => (sheet.banded ? [{ remove: () => { sheet.banded = false } }] : []),
  }
  return new Proxy(sheet, { get: (target, prop) => (prop in target ? target[prop] : () => {}) })
}

function fakeRange(sheet, row, col, nr, nc) {
  const write = (r, c, v) => {
    while (sheet.data.length < r) sheet.data.push([])
    sheet.data[r - 1][c - 1] = v
  }
  const range = new Proxy({}, {
    get: (target, prop) => {
      if (prop === 'getValues') return () => sheet.data.slice(row - 1, row - 1 + nr).map((r) => (r || []).slice(col - 1, col - 1 + nc))
      if (prop === 'setValues') return (vals) => { vals.forEach((r, i) => r.forEach((v, j) => write(row + i, col + j, v))); return range }
      if (prop === 'setValue') return (v) => { write(row, col, v); return range }
      if (prop === 'setFormula') return (f) => { write(row, col, f); return range }
      if (prop === 'setRichTextValue') return (rt) => { sheet.links[`${row},${col}`] = rt; write(row, col, rt.text); return range }
      const cells = () => Array.from({ length: nr }, (_, i) => `${row + i},${col}`)
      if (prop === 'setDataValidation') return () => { cells().forEach((k) => sheet.dropdowns.add(k)); return range }
      if (prop === 'clearDataValidations') return () => { cells().forEach((k) => sheet.dropdowns.delete(k)); return range }
      if (prop === 'createFilter') return () => {
        if (sheet.filter) throw new Error('You can\'t create a filter in a sheet that already has a filter.')
        sheet.filter = true
        return range
      }
      if (prop === 'applyRowBanding') return () => {
        if (sheet.banded) throw new Error('You cannot add alternating background colors to a range that already has them.')
        sheet.banded = true
        return range
      }
      return () => range // merge, setBackground, applyRowBanding, setFirstRowColor, …
    },
  })
  return range
}

function fakeSpreadsheet() {
  const sheets = [fakeSheet('Hoja 1')]
  const ss = {
    sheets,
    sheet: (n) => sheets.find((s) => s.getName() === n),
    getSheetByName: (n) => sheets.find((s) => s.getName() === n) || null,
    insertSheet: (n, index) => { const s = fakeSheet(n); sheets.splice(index ?? sheets.length, 0, s); return s },
    deleteSheet: (s) => { sheets.splice(sheets.indexOf(s), 1) },
    getSheets: () => [...sheets],
    getUrl: () => 'https://sheet.example',
    getId: () => 'sheet-id',
    setSpreadsheetTimeZone: () => {},
    setActiveSheet: (s) => { ss.active = s },
    moveActiveSheet: (pos) => { sheets.splice(sheets.indexOf(ss.active), 1); sheets.splice(pos - 1, 0, ss.active) },
  }
  return ss
}

function chain(extra = {}) {
  const obj = new Proxy(extra, { get: (target, prop) => (prop in target ? target[prop] : () => obj) })
  return obj
}

function loadScript({ mailFails = false, notifyEmails = 'duenos@example.com', mailQuota = 100, childPrice, spreadsheet } = {}) {
  const calls = { events: [], mails: [] }
  const cache = new Map()
  const props = { NOTIFY_EMAILS: notifyEmails, SPREADSHEET_ID: 'sheet-id' }
  const ss = spreadsheet || fakeSpreadsheet()
  const context = {
    console: { log() {}, warn() {}, error() {} },
    Utilities: { formatDate, base64Encode: (s) => Buffer.from(s).toString('base64') },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text) => ({ setMimeType: () => ({ body: JSON.parse(text) }) }),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null, setProperty: (k, v) => { props[k] = v } }) },
    SpreadsheetApp: {
      openById: () => ss,
      getActiveSpreadsheet: () => ss,
      newDataValidation: () => chain({ build: () => ({}) }),
      newConditionalFormatRule: () => chain({ build: () => ({}) }),
      newRichTextValue: () => {
        const rt = { text: '', url: '' }
        const b = { setText: (t) => { rt.text = t; return b }, setLinkUrl: (u) => { rt.url = u; return b }, build: () => rt }
        return b
      },
      BandingTheme: { LIGHT_GREY: 'LIGHT_GREY' },
      BorderStyle: { SOLID: 'SOLID' },
    },
    CalendarApp: {
      getCalendarById: () => null,
      getDefaultCalendar: () => ({
        getId: () => 'duenos@example.com',
        createEvent: (title, start, end, opts) => {
          calls.events.push({ title, start, end, opts })
          return { getId: () => 'abc123xyz@google.com' }
        },
      }),
    },
    MailApp: {
      getRemainingDailyQuota: () => mailQuota,
      sendEmail: (msg) => {
        if (mailFails) throw new Error('Service invoked too many times: email')
        mailQuota -= msg.to.split(',').length
        calls.mails.push(msg)
      },
    },
  }
  vm.createContext(context)
  vm.runInContext(childPrice == null ? SOURCE : SOURCE.replace('CHILD_PRICE: 50,', `CHILD_PRICE: ${childPrice},`), context)
  const post = (payload) => plain(context.doPost({ postData: { contents: JSON.stringify(payload) } }).body)
  /* data rows of "Reservas" as objects keyed by header */
  const bookings = () => {
    const sheet = ss.sheet('Reservas')
    const [headers, ...rows] = sheet.data
    return rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])))
  }
  return { ctx: context, calls, post, ss, bookings }
}

/* An ISO date n days from today in Costa Rica */
function daysFromNow(n) {
  const today = formatDate(new Date(), 'America/Costa_Rica', 'yyyy-MM-dd')
  const [y, m, d] = today.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

const VALID = {
  name: 'Cliente Prueba', email: 'Prueba@Example.com', phone: '+506 8000 0000', notes: '',
  date: '2026-12-04', time: '10:00 am', adults: 2, children: 1, lang: 'es', total: 1,
  payment: { method: 'card', reference: 'PAY-123', status: 'paid' },
}
const NOW = { date: '2026-11-24', minutes: 14 * 60 }

test('valid booking is accepted and priced on the server, ignoring the browser total and status', () => {
  const { ctx } = loadScript()
  const result = ctx.validateBooking(VALID, NOW)
  assert.equal(result.ok, true)
  assert.equal(result.booking.total, 150)
  assert.equal(result.booking.email, 'prueba@example.com')
  assert.equal(result.booking.paymentStatus, 'simulated') // PAYMENT_MODE 'demo' never trusts "paid"
})

test('invalid bookings are rejected with a reason', () => {
  const { ctx } = loadScript()
  const cases = [
    [{ email: 'no-at-sign' }, 'invalid_email'],
    [{ name: 'A' }, 'invalid_name'],
    [{ name: 'Ganaste USD 500' }, 'invalid_name'],       // digits
    [{ name: 'Visite premio.example' }, 'invalid_name'], // a domain in the greeting
    [{ name: '=HYPERLINK("x")' }, 'invalid_name'],
    [{ email: 'a@b.com,c@d.com' }, 'invalid_email'],     // no extra recipients
    [{ phone: 'call me' }, 'invalid_phone'],
    [{ adults: 1, children: 0 }, 'invalid_people'],   // the group minimum is 2
    [{ adults: 15, children: 6 }, 'invalid_people'],  // 21 > 20
    [{ adults: 2.5 }, 'invalid_people'],
    [{ children: -1 }, 'invalid_people'],
    [{ adults: 0, children: 3 }, 'adult_required'],   // children ride with an adult
    [{ time: '3:00 pm' }, 'invalid_time'],
    [{ date: '2026-02-30' }, 'invalid_date'],
    [{ date: '2026-11-23' }, 'date_in_past'],
    [{ date: '2026-11-24', time: '1:00 pm' }, 'departure_closed'], // 14:00 now, 13:00 departure
  ]
  for (const [patch, error] of cases) {
    assert.deepEqual(plain(ctx.validateBooking({ ...VALID, ...patch }, NOW)), { ok: false, error }, JSON.stringify(patch))
  }
  // Same day is fine while the departure is at least an hour away
  assert.equal(ctx.validateBooking({ ...VALID, date: '2026-11-24', time: '1:00 pm' }, { date: '2026-11-24', minutes: 11 * 60 + 59 }).ok, true)
})

test('honeypot submissions get a fake success shaped like a real one and touch nothing', () => {
  const { post, calls, ss } = loadScript()
  const out = post({ ...VALID, date: daysFromNow(5), website: 'spam.example' })
  assert.equal(out.ok, true)
  assert.equal(out.emailed, true)
  assert.equal(ss.getSheetByName('Reservas'), null)
  assert.equal(calls.events.length + calls.mails.length, 0)
})

test('a booking writes a safe, formatted row, a calendar link and two escaped emails', () => {
  const { post, calls, ss, bookings } = loadScript()
  const date = daysFromNow(10)
  const out = post({ ...VALID, date, name: "María O'Neil-Rojas", phone: '0044 7700 900123', notes: '=HYPERLINK("http://evil")<script>x</script>' })
  assert.equal(out.ok, true)
  assert.equal(out.emailed, true)
  assert.match(out.code, /^TRP-\d{6}-[A-Z2-9]{4}$/)

  const sheet = ss.sheet('Reservas')
  assert.equal(sheet.data[0][0], 'Fecha del tour', 'columns start with when')
  assert.equal(sheet.rules.length, 4, 'one color rule per state')
  assert.equal(sheet.filter, true, 'filter buttons on the header')
  assert.ok(sheet.dropdowns.has('2,3'), 'the booking row gets the state dropdown')
  assert.ok(!sheet.dropdowns.has('3,3'), 'empty rows stay without dropdown arrows')

  const [row] = bookings()
  assert.equal(row['Código'], out.code)
  assert.equal(row['Estado'], 'Confirmada')
  assert.equal(row['Hora'], 600 / 1440, '10:00 am stored as a time value')
  assert.deepEqual([row['Adultos'], row['Niños'], row['Personas'], row['Total (USD)']], [2, 1, 3, 150])
  assert.equal(row['Nombre'], "'María O'Neil-Rojas")
  assert.equal(row['Teléfono'], "'0044 7700 900123", 'phone is stored as text, keeping its leading zeros')
  assert.ok(row['Comentarios'].startsWith("'="), 'notes cell must not be a formula')

  const link = Object.values(sheet.links)[0]
  assert.equal(link.text, 'Ver en calendario')
  const eid = Buffer.from('abc123xyz duenos@example.com').toString('base64').replace(/=+$/, '')
  assert.equal(link.url, `https://www.google.com/calendar/event?eid=${encodeURIComponent(eid)}`)
  assert.equal(row['Calendario'], 'Ver en calendario')

  const [event] = calls.events
  assert.equal(event.start.toISOString(), `${date}T16:00:00.000Z`) // 10:00 am in Costa Rica (UTC-6)
  assert.equal(event.end - event.start, 120 * 60000)
  assert.ok(event.opts.description.includes('&lt;script&gt;') && !event.opts.description.includes('<script>'))

  const [business, customer] = calls.mails
  assert.equal(business.to, 'duenos@example.com')
  assert.equal(business.replyTo, 'prueba@example.com')
  assert.equal(customer.to, 'prueba@example.com')
  assert.equal(customer.replyTo, 'duenos@example.com')
  for (const mail of calls.mails) {
    assert.ok(!mail.htmlBody.includes('<script>'), 'user input must be escaped in HTML')
    assert.ok(mail.htmlBody.includes('$150'))
  }
  assert.ok(business.htmlBody.includes('&lt;script&gt;'))
  assert.ok(business.htmlBody.includes('PAY-123'))
  assert.ok(!customer.htmlBody.includes('HYPERLINK') && !customer.body.includes('HYPERLINK'), 'no visitor free text to an unverified address')
  assert.ok(!customer.htmlBody.includes('PAY-123') && !customer.body.includes('PAY-123'))
  assert.ok(business.htmlBody.includes('https://wa.me/447700900123'), 'WhatsApp link drops the 00 prefix')
  assert.ok(customer.htmlBody.includes('Comprobante de reserva'))
  assert.ok(customer.htmlBody.includes('no constituye una factura electrónica'))
  assert.ok(business.htmlBody.includes('Nueva reserva'))
})

test('rows follow the sheet\'s own column order, so the business can reorder or add columns', () => {
  const ss = fakeSpreadsheet()
  const custom = ss.insertSheet('Reservas')
  custom.data.push(['Nombre', 'Notas internas', 'Fecha del tour', 'Código', 'Total (USD)'])
  const { post } = loadScript({ spreadsheet: ss })
  const out = post({ ...VALID, date: daysFromNow(9) })
  const row = custom.data[1]
  assert.equal(row[0], "'Cliente Prueba")
  assert.equal(row[1], '', 'unknown columns stay empty')
  assert.equal(row[3], out.code)
  assert.equal(row[4], 150)
})

test('setup moves an old layout into the new one, builds the Panel and drops the empty tab', () => {
  const ss = fakeSpreadsheet()
  const old = ss.insertSheet('Reservas')
  old.data.push(
    ['Registrada', 'Código', 'Estado', 'Fecha del tour', 'Hora', 'Adultos', 'Niños', 'Personas', 'Total (USD)', 'Nombre', 'ID evento'],
    [new Date('2026-11-24T23:05:00Z'), 'TRP-261124-A69R', 'Confirmada', new Date(2026, 10, 28), '9:00 am', 2, 1, 3, 150, 'Héctor Caravaca', 'x@google.com'],
  )
  const { ctx } = loadScript({ spreadsheet: ss })
  ctx.setup()

  assert.deepEqual(ss.sheets.map((s) => s.getName()), ['Panel', 'Reservas', 'Reservas (formato anterior)'])
  assert.equal(ss.active.getName(), 'Panel')
  const fresh = ss.sheet('Reservas')
  const [headers, row] = fresh.data
  const get = (h) => row[headers.indexOf(h)]
  assert.equal(get('Código'), 'TRP-261124-A69R')
  assert.equal(get('Hora'), 540 / 1440, '"9:00 am" text becomes a time value')
  assert.equal(get('Nombre'), 'Héctor Caravaca')
  assert.equal(get('Calendario'), '', 'the old raw event id is not carried over')
  assert.equal(ss.sheet('Reservas (formato anterior)').data.length, 2, 'the old tab is kept as it was')
  assert.deepEqual([...fresh.dropdowns], ['2,3'], 'state dropdown only on the migrated booking')

  const panel = ss.sheet('Panel')
  assert.equal(panel.data[9][0], 'Fecha del tour', 'results header')
  assert.ok(String(panel.data[10][0]).startsWith('=IFERROR(SORT(CHOOSECOLS(FILTER('))
  assert.equal(panel.rules.length, 4, 'state colors in the results too')

  // Running setup again (after updating the code) must not fail or duplicate anything
  ctx.setup()
  assert.deepEqual(ss.sheets.map((s) => s.getName()), ['Panel', 'Reservas', 'Reservas (formato anterior)'])
  assert.equal(ss.sheet('Reservas').data.length, 2)
  assert.deepEqual([...ss.sheet('Reservas').dropdowns], ['2,3'])
})

test('the Panel formula filters by date range, state, code and client, sorted by date and time', () => {
  const { ctx } = loadScript()
  const f = ctx.panelFormula()
  for (const part of [
    'FILTER(Reservas!A2:S,',
    'Reservas!D2:D<>""',
    '(A5="")+(Reservas!A2:A>=A5)',
    '(B5="")+(Reservas!A2:A<=B5)',
    '(C5="Todos")+(C5="")+(Reservas!C2:C=C5)',
    '(D5="")+ISNUMBER(SEARCH(D5,Reservas!D2:D))',
    'SEARCH(E5,Reservas!E2:E&" "&Reservas!K2:K&" "&Reservas!F2:F)',
    '),1,2,3,4,5,6,7,8,9,10,12),1,TRUE,2,TRUE)',
  ]) assert.ok(f.includes(part), part)
  assert.equal(ctx.columnLetter(1), 'A')
  assert.equal(ctx.columnLetter(19), 'S')
  assert.equal(ctx.columnLetter(27), 'AA')
})

test('the customer receipt follows the booking language', () => {
  const { post, calls } = loadScript()
  post({ ...VALID, date: daysFromNow(3), lang: 'en' })
  const customer = calls.mails.at(-1)
  assert.ok(customer.subject.startsWith('Your booking'))
  assert.ok(customer.htmlBody.includes('Booking receipt'))
  assert.ok(calls.mails[0].htmlBody.includes('Nueva reserva')) // business email stays in Spanish
})

test('when the mail quota runs out, the business is notified first and the site gets emailed: false', () => {
  const { post, calls, bookings } = loadScript({ mailQuota: 1 })
  const out = post({ ...VALID, date: daysFromNow(4) })
  assert.equal(out.ok, true)
  assert.equal(out.emailed, false)
  assert.deepEqual(calls.mails.map((m) => m.to), ['duenos@example.com'])
  assert.equal(bookings().length, 1) // booking still written
})

test('an email failure keeps the booking and reports emailed: false', () => {
  const { post, bookings } = loadScript({ mailFails: true })
  const out = post({ ...VALID, date: daysFromNow(4) })
  assert.equal(out.ok, true)
  assert.equal(out.emailed, false)
  assert.equal(bookings()[0]['Código'], out.code)
})

test('the same address is rate limited after 3 bookings, including plus and dot variants', () => {
  const { post } = loadScript()
  const date = daysFromNow(6)
  for (const email of ['victim@gmail.com', 'victim+1@gmail.com', 'vic.tim+2@gmail.com']) {
    assert.equal(post({ ...VALID, date, email }).ok, true, email)
  }
  assert.deepEqual(post({ ...VALID, date, email: 'v.i.c.t.i.m@gmail.com' }), { ok: false, error: 'rate_limited' })
  // A different person is not blocked (there is no global cap an attacker could use)
  assert.equal(post({ ...VALID, date, email: 'otra.persona@example.com' }).ok, true)
})

test('phone digits become a WhatsApp number only when they can be a full international number', () => {
  const { ctx } = loadScript()
  assert.equal(ctx.whatsappDigits('8888 0000'), '50688880000')
  assert.equal(ctx.whatsappDigits('+506 8888-0000'), '50688880000')
  assert.equal(ctx.whatsappDigits('0044 7700 900123'), '447700900123')
  assert.equal(ctx.whatsappDigits('12345'), null)
})

test('adults and children are priced separately and itemized on the receipt', () => {
  const { ctx, post, calls, bookings } = loadScript({ childPrice: 35 })
  const { booking } = ctx.validateBooking({ ...VALID, adults: 2, children: 2 }, NOW)
  assert.equal(booking.total, 2 * 50 + 2 * 35)

  post({ ...VALID, date: daysFromNow(7), adults: 2, children: 2 })
  const row = bookings().at(-1)
  assert.deepEqual([row['Precio adulto (USD)'], row['Precio niño (USD)'], row['Total (USD)']], [50, 35, 170])
  const customer = calls.mails.at(-1)
  for (const text of ['Adultos', '2 × $50', '$100', 'Niños (menores de 12)', '2 × $35', '$70', '$170']) {
    assert.ok(customer.htmlBody.includes(text), text)
  }
  assert.ok(customer.body.includes('Niños (menores de 12): 2 × $35 c/u = $70'))
  assert.ok(calls.mails[0].subject.endsWith('2 adultos, 2 niños'))
})

test('a receipt without children shows only the adult line', () => {
  const { post, calls } = loadScript()
  post({ ...VALID, date: daysFromNow(8), adults: 3, children: 0 })
  const customer = calls.mails.at(-1)
  assert.ok(customer.htmlBody.includes('3 × $50'))
  assert.ok(!customer.htmlBody.includes('Niños (menores'))
})

test('tour dates are written out in both languages', () => {
  const { ctx } = loadScript()
  assert.equal(ctx.formatTourDate({ date: '2026-12-04' }, 'es'), 'Viernes 4 de diciembre de 2026')
  assert.equal(ctx.formatTourDate({ date: '2026-12-04' }, 'en'), 'Friday, December 4, 2026')
})
