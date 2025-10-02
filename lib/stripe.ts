import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia' as any,
    typescript: true,
});

export const STRIPE_CONFIG = {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: 'usd',
    paymentMethodTypes: ['card'],
};