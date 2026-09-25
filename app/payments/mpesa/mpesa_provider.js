function createPaymentRequest({ amount, phoneNumber, reference }) {
  if (!amount || !phoneNumber || !reference) {
    throw new Error('amount, phoneNumber, and reference are required');
  }

  return {
    provider: 'mpesa',
    status: 'pending',
    amount,
    phoneNumber,
    reference,
    message: 'M-Pesa integration is ready for provider credentials and callback wiring',
  };
}

module.exports = { createPaymentRequest };