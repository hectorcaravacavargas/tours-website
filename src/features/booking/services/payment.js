/*
 * Payment port. The booking form only knows this function.
 * shortcut: simulated charge — replace the body with the payment gateway integration
 * (create the checkout session / charge and return its reference) before going live.
 * The real charge must be priced on the server from `people` and the date — never from
 * `booking.total`, which comes from the browser and can be edited by the visitor.
 */
export async function processPayment(booking) {
  void booking
  await new Promise((resolve) => setTimeout(resolve, 1400))
  return { reference: `PAY-${Date.now().toString(36).toUpperCase().slice(-6)}`, method: 'card', status: 'simulated' }
}
