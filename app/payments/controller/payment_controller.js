const { paymentSchema } = require('../model/payment_schema');
const { createPayment, listPayments, getPaymentReceipt } = require('../model/payment_repo');

async function create(req, res) {
  const { error, value } = paymentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const payment = await createPayment({ ...value, tenantUserId: req.user.sub });
    return payment ? res.status(201).json({ payment }) : res.status(404).json({ message: 'Bill is not assigned to you' });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Unable to record payment' });
  }
}

async function list(req, res) {
  try {
    return res.json({ payments: await listPayments(req.user) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load payments' });
  }
}

async function receipt(req, res) {
  try {
    const payment = await getPaymentReceipt(req.params.id, req.user);
    return payment ? res.json({ receipt: payment }) : res.status(404).json({ message: 'Receipt not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load receipt' });
  }
}

module.exports = { create, list, receipt };