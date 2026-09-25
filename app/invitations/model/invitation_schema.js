const Joi = require('joi');

const createInvitationSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  role: Joi.string().valid('employee', 'tenant').required(),
  propertyId: Joi.number().integer().positive().when('role', {
    is: 'employee', then: Joi.required(), otherwise: Joi.forbidden(),
  }),
  unitId: Joi.number().integer().positive().when('role', {
    is: 'tenant', then: Joi.required(), otherwise: Joi.forbidden(),
  }),
  expiresInDays: Joi.number().integer().min(1).max(30).default(7),
});

const acceptInvitationSchema = Joi.object({
  code: Joi.string().trim().min(12).max(64).required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(8).required(),
});

module.exports = { createInvitationSchema, acceptInvitationSchema };