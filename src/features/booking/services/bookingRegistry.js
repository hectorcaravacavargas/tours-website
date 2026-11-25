/*
 * Booking registry adapter: sends a confirmed booking to the Google Apps Script web app,
 * which writes the sheet row, creates the calendar event and emails the business and the customer.
 * Setup: integrations/google-apps-script/README.md
 */
const ENDPOINT = import.meta.env.VITE_BOOKINGS_URL

export async function registerBooking(booking) {
  if (!ENDPOINT) {
    // Local development without the integration: keep the flow usable
    if (import.meta.env.DEV) {
      console.info('[booking] VITE_BOOKINGS_URL is not set; registration skipped', booking)
      return { code: null, emailed: false }
    }
    // In production a missing endpoint must fail loudly, never lose a booking silently
    throw new Error('bookings_endpoint_missing')
  }

  // text/plain keeps this a "simple" CORS request: Apps Script cannot answer a preflight
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(booking),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'registration_failed')
  return { code: data.code, emailed: Boolean(data.emailed) }
}
