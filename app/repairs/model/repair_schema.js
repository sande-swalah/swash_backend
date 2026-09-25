const Joi = require('joi');

const createRepairSchema = Joi.object({
  unitId: Joi.number().integer().positive().required(),
  description: Joi.string().trim().min(5).max(2000).required(),
  photos: Joi.array().items(Joi.string().uri()).max(10).default([]),
});

const updateRepairSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'resolved', 'completed', 'cancelled').required(),
  assignedEmployeeId: Joi.number().integer().positive().allow(null),
  cost: Joi.number().min(0).allow(null),
});

const employeeRepairSchema = Joi.object({
  status: Joi.string().valid('in_progress', 'resolved', 'completed').required(),
});

module.exports = { createRepairSchema, updateRepairSchema, employeeRepairSchema };