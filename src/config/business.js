/*
 * Public business data shown on the site.
 * Not secrets: anything here (or in a VITE_* env var) ends up in the public JS bundle.
 */
export const WA_NUMBER = '50687711701'

/* Finca El Trapiche pin — previously VITE_MAP_LAT / VITE_MAP_LNG in Vercel */
export const MAP_COORDS = '10.4266613,-84.5951054'

export const WA_MSG = {
  es: 'Hola, estoy interesado en el tour a caballo. ¿Me pueden dar más información?',
  en: "Hello! I'm interested in the horseback riding tour. Can you give me more information?",
}

export const waUrl = (lang) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MSG[lang] ?? WA_MSG.en)}`

/* Tour pricing and booking options (shown on the tour card and the booking form) */
export const PRICE_PER_PERSON = 50 // adult price, shown as "Desde $50 / persona"
/* Reduced rate for children under CHILD_AGE_LIMIT (see the FAQ). It equals the adult price
   until the business confirms the amount — keep in sync with CONFIG in Code.gs */
export const CHILD_PRICE = 50
export const CHILD_AGE_LIMIT = 12
export const MIN_PEOPLE = 2   // matches "Grupo 2–20 personas" on the tour card
export const MAX_PEOPLE = 20
/* Departure times inside the 8:00 am – 3:00 pm schedule (2-hour tour) — confirm with the business */
export const TOUR_TIMES = ['8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm']
/* Online booking for a departure closes this many minutes before it — confirm with the business */
export const BOOKING_LEAD_MINUTES = 60
export const BUSINESS_TIMEZONE = 'America/Costa_Rica'
