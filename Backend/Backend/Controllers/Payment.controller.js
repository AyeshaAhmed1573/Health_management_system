import Transaction from '../Models/Transaction.model.js';
import Appointment from '../Models/Appointment.model.js';
import LabBooking from '../Models/LabBooking.model.js';
import MedicineOrder from '../Models/MedicineOrder.model.js';
import { getUserId, isAdmin } from '../utils/access.js';
import { createCharge, mockConfirmAllowed, verifyWebhook, refundCharge } from '../Services/paymentService.js';
import { notify } from '../Services/notificationService.js';
import { createAuditLog } from '../Services/auditLogService.js';

const fail = (res, status, error) => res.status(status).json({ success: false, error });
const audit = (req, action, tx, extra = {}) =>
  createAuditLog({ userId: req ? getUserId(req) : tx.userId, action, entityType: 'Transaction', entityId: tx._id, ipAddress: req?.ip, userAgent: req?.get?.('user-agent'), ...extra });

// The payable amount ALWAYS comes from the database, never from the client.
const PAYABLES = {
  appointment: { model: Appointment, amount: (d) => d.fee, paid: (d) => d.paymentStatus === 'paid', mark: (d, s) => { d.paymentStatus = s; } },
  lab_booking: { model: LabBooking, amount: (d) => d.totalAmount, paid: (d) => d.paymentStatus === 'paid', mark: (d, s) => { d.paymentStatus = s; } },
  pharmacy_order: { model: MedicineOrder, amount: (d) => d.totalAmount, paid: (d) => d.paymentStatus === 'paid', mark: (d, s) => { d.paymentStatus = s; } },
};
const DESCRIPTIONS = { appointment: 'Doctor consultation', lab_booking: 'Laboratory booking', pharmacy_order: 'Pharmacy order' };

async function settle(tx, status, { providerRef, failureReason } = {}) {
  if (tx.status === status) return tx;
  tx.status = status;
  if (providerRef) tx.providerRef = providerRef;
  if (status === 'succeeded') tx.paidAt = new Date();
  if (status === 'failed') tx.failureReason = failureReason;
  if (status === 'refunded') tx.refundedAt = new Date();
  await tx.save();

  const spec = PAYABLES[tx.kind];
  const doc = await spec.model.findById(tx.refId);
  if (doc) {
    spec.mark(doc, status === 'succeeded' ? 'paid' : status === 'refunded' ? 'refunded' : 'pending');
    await doc.save();
  }
  if (status === 'succeeded') {
    await notify(tx.userId, { type: 'payment_received', title: 'Payment received', message: `${tx.currency} ${tx.amount} paid for ${DESCRIPTIONS[tx.kind].toLowerCase()}.`, refModel: 'Transaction', refId: tx._id });
  }
  return tx;
}

// POST /api/payments/intent  { kind, refId, method }
export async function createPaymentIntent(req, res) {
  try {
    const { kind, refId, method } = req.body;
    const spec = PAYABLES[kind];
    if (!spec || !refId) return fail(res, 400, `kind must be one of: ${Object.keys(PAYABLES).join(', ')}, and refId is required`);

    const doc = await spec.model.findById(refId);
    if (!doc || String(doc.userId) !== getUserId(req)) return fail(res, 404, 'Item not found');
    if (spec.paid(doc)) return fail(res, 409, 'Already paid');
    if (doc.status === 'cancelled') return fail(res, 400, 'Cancelled items cannot be paid');
    const amount = spec.amount(doc);
    if (!(amount > 0)) return fail(res, 400, 'Nothing to pay for this item');

    let tx = await Transaction.findOne({ kind, refId, status: 'pending' });
    if (!tx) {
      try {
        tx = await Transaction.create({ userId: getUserId(req), profileId: doc.profileId, kind, refId, amount, method, description: DESCRIPTIONS[kind] });
      } catch (err) {
        if (err.code === 11000) return fail(res, 409, 'A payment for this item already exists');
        throw err;
      }
    }
    const charge = await createCharge({ transactionId: tx._id, amount: tx.amount, currency: tx.currency });
    tx.provider = process.env.PAYMENT_PROVIDER || 'mock';
    tx.providerRef = charge.providerRef;
    await tx.save();
    await audit(req, 'payment_created', tx);
    res.status(201).json({ success: true, transaction: tx, checkout: charge.checkout });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// POST /api/payments/:id/confirm - sandbox only (mock provider, non-production)
export async function confirmMockPayment(req, res) {
  try {
    if (!mockConfirmAllowed()) return fail(res, 403, 'Manual confirmation is only available with the mock provider outside production');
    const tx = await Transaction.findById(req.params.id);
    if (!tx || String(tx.userId) !== getUserId(req)) return fail(res, 404, 'Transaction not found');
    if (tx.status !== 'pending') return fail(res, 409, `Transaction is already ${tx.status}`);
    await settle(tx, 'succeeded');
    await audit(req, 'payment_succeeded', tx);
    res.json({ success: true, transaction: tx });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// POST /api/payments/webhook - called by the gateway, authenticated by HMAC signature
export async function paymentWebhook(req, res) {
  try {
    if (!verifyWebhook(req.rawBody, req.get('x-signature'))) return fail(res, 401, 'Invalid signature');
    const { transactionId, status, providerRef, failureReason } = req.body;
    const tx = await Transaction.findById(transactionId);
    if (!tx) return fail(res, 404, 'Transaction not found');
    if (tx.status === 'pending' && ['succeeded', 'failed'].includes(status)) {
      await settle(tx, status, { providerRef, failureReason });
      await audit(null, status === 'succeeded' ? 'payment_succeeded' : 'payment_failed', tx);
    }
    res.json({ success: true }); // idempotent: repeats are acknowledged
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/payments/history?kind=&status=
export async function getTransactionHistory(req, res) {
  try {
    const filter = isAdmin(req.user) && req.query.all === 'true' ? {} : { userId: getUserId(req) };
    if (req.query.kind) filter.kind = req.query.kind;
    if (req.query.status) filter.status = req.query.status;
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, transactions });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// GET /api/payments/:id
export async function getTransaction(req, res) {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx || (String(tx.userId) !== getUserId(req) && !isAdmin(req.user))) return fail(res, 404, 'Transaction not found');
    res.json({ success: true, transaction: tx });
  } catch (err) {
    fail(res, 500, err.message);
  }
}

// POST /api/payments/:id/refund  (admin)
export async function refundTransaction(req, res) {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return fail(res, 404, 'Transaction not found');
    if (tx.status !== 'succeeded') return fail(res, 400, 'Only succeeded payments can be refunded');
    await refundCharge(tx);
    await settle(tx, 'refunded');
    await audit(req, 'payment_refunded', tx, { reason: req.body?.reason });
    res.json({ success: true, transaction: tx });
  } catch (err) {
    fail(res, 500, err.message);
  }
}
