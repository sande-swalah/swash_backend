const Joi = require('joi');

const unitSchema = Joi.object({
  propertyId: Joi.number().integer().positive().required(),
  unitNumber: Joi.string().trim().max(50).required(),
  rentAmount: Joi.number().positive().required(),
});

module.exports = { unitSchema };