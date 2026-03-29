const Joi = require('joi');

const createBrokerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required().messages({
    'string.min': 'Broker name must be at least 2 characters.',
    'string.max': 'Broker name cannot exceed 255 characters.',
    'any.required': 'Broker name is required.',
  }),
  contactNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian contact number.',
      'any.required': 'Contact number is required.',
    }),
  email: Joi.string().email().optional().allow('', null).messages({
    'string.email': 'Please provide a valid email address.',
  }),
  address: Joi.string().trim().min(5).max(1000).optional().allow('', null).messages({
    'string.min': 'Address must be at least 5 characters.',
    'string.max': 'Address cannot exceed 1000 characters.',
  }),
});

const updateBrokerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional().messages({
    'string.min': 'Broker name must be at least 2 characters.',
    'string.max': 'Broker name cannot exceed 255 characters.',
  }),
  contactNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian contact number.',
    }),
  email: Joi.string().email().optional().allow('', null).messages({
    'string.email': 'Please provide a valid email address.',
  }),
  address: Joi.string().trim().min(5).max(1000).optional().allow('', null).messages({
    'string.min': 'Address must be at least 5 characters.',
    'string.max': 'Address cannot exceed 1000 characters.',
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

module.exports = { createBrokerSchema, updateBrokerSchema };