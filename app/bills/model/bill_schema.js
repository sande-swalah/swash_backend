const Joi = require('joi');

const createBillSchema = Joi.object({
  unitId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().trim().max(20).required(),
  dueDate: Joi.date().iso().required(),
});

module.exports = { createBillSchema };