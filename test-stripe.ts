import { stripe } from './lib/payments/stripe';
stripe.products.retrieve('prod_UVQSatw61ksVah').then(p => console.log('DEFAULT PRICE:', p.default_price)).catch(e => console.error('ERROR:', e.message));
