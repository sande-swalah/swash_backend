const Joi = require('joi');

const validRoles = ['owner', 'employee', 'tenant'];

const registerSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(...validRoles).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().required(),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid(...validRoles).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateRoleSchema,
};
