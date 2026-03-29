const Joi = require('joi');

const createPropertyTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Property type name must be at least 2 characters.',
    'string.max': 'Property type name cannot exceed 100 characters.',
    'any.required': 'Property type name is required.',
  }),
  description: Joi.string().trim().max(500).optional().allow('', null).messages({
    'string.max': 'Description cannot exceed 500 characters.',
  }),
});

const updatePropertyTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Property type name must be at least 2 characters.',
    'string.max': 'Property type name cannot exceed 100 characters.',
  }),
  description: Joi.string().trim().max(500).optional().allow('', null).messages({
    'string.max': 'Description cannot exceed 500 characters.',
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

module.exports = { createPropertyTypeSchema, updatePropertyTypeSchema };