const Joi = require('joi');

const paymentSchema = Joi.object({
  billId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  provider: Joi.string().valid('manual', 'mpesa', 'bank').default('manual'),
  reference: Joi.string().trim().max(120).optional(),
});

module.exports = { paymentSchema };