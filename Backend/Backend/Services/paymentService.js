import crypto from 'crypto';

/**
 * Payment-gateway adapter (SRS 4.7). Everything outside this file talks to the
 * gateway only through createCharge()/verifyWebhook()/refund(), so swapping in
 * Stripe, JazzCash or Easypaisa means implementing the same three functions.
 *
 * PAYMENT_PROVIDER=mock (default) lets the whole flow work without a merchant account;
 * it is refused when NODE_ENV=production.
 */
const provider = () => process.env.PAYMENT_PROVIDER || 'mock';

export function assertProviderUsable() {
  if (provider() === 'mock' && process.env.NODE_ENV === 'production') {
    throw new Error('PAYMENT_PROVIDER=mock cannot be used in production');
  }
}

export async function createCharge({ transactionId, amount, currency }) {
  assertProviderUsable();
  if (provider() === 'mock') {
    return { providerRef: `mock_${crypto.randomBytes(8).toString('hex')}`, checkout: { transactionId, amount, currency } };
  }
  throw new Error(`Payment provider "${provider()}" is not implemented yet`);
}

export const mockConfirmAllowed = () => provider() === 'mock' && process.env.NODE_ENV !== 'production';

export function signPayload(rawBody) {
  return crypto.createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET || '').update(rawBody).digest('hex');
}

export function verifyWebhook(rawBody, signature) {
  if (!process.env.PAYMENT_WEBHOOK_SECRET || !signature || !rawBody) return false;
  const a = Buffer.from(signPayload(rawBody)), b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function refundCharge() {
  assertProviderUsable();
  if (provider() === 'mock') return { ok: true };
  throw new Error(`Payment provider "${provider()}" is not implemented yet`);
}
