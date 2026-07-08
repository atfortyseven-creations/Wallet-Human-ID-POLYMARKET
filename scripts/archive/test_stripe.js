const Stripe = require('stripe');
try {
  const stripe = new Stripe();
} catch (e) {
  console.log("Empty Stripe error:", e.message);
}
try {
  const stripe = new Stripe('');
} catch (e) {
  console.log("Empty string Stripe error:", e.message);
}
