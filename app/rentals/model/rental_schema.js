const Joi = require('joi');

const propertySchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  address: Joi.string().trim().min(3).max(1000).required(),
});

const assignmentSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  unitId: Joi.number().integer().positive().required(),
});

module.exports = { propertySchema, assignmentSchema };