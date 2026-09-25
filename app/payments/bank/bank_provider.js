function createPaymentRequest({ amount, accountNumber, reference }) {
  if (!amount || !accountNumber || !reference) {
    throw new Error('amount, accountNumber, and reference are required');
  }

  return {
    provider: 'bank',
    status: 'pending',
    amount,
    accountNumber,
    reference,
    message: 'Bank integration is ready for provider credentials and reconciliation wiring',
  };
}

module.exports = { createPaymentRequest };