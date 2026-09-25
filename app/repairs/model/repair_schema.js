const Joi = require('joi');

const createRepairSchema = Joi.object({
  unitId: Joi.number().integer().positive().required(),
  description: Joi.string().trim().min(5).max(2000).required(),
});

const updateRepairSchema = Joi.object({
  status: Joi.string().valid('open', 'assigned', 'in_progress', 'resolved', 'cancelled').required(),
  assignedEmployeeId: Joi.number().integer().positive().allow(null),
});

module.exports = { createRepairSchema, updateRepairSchema };