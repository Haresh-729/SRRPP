const Joi = require('joi');

const createPropertySchema = Joi.object({
  propertyTypeId: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid property type ID.',
    'any.required': 'Property type is required.',
  }),
  name: Joi.string().trim().min(2).max(255).required().messages({
    'string.min': 'Property name must be at least 2 characters.',
    'string.max': 'Property name cannot exceed 255 characters.',
    'any.required': 'Property name is required.',
  }),
  address: Joi.string().trim().min(5).max(1000).required().messages({
    'string.min': 'Address must be at least 5 characters.',
    'string.max': 'Address cannot exceed 1000 characters.',
    'any.required': 'Address is required.',
  }),
  areaSqFt: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Area must be a number.',
    'number.positive': 'Area must be a positive number.',
    'any.required': 'Area in sq.ft. is required.',
  }),
  purchaseDate: Joi.date().iso().max('now').required().messages({
    'date.iso': 'Purchase date must be a valid ISO date.',
    'date.max': 'Purchase date cannot be in the future.',
    'any.required': 'Purchase date is required.',
  }),
  purchaseAmount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Purchase amount must be a number.',
    'number.positive': 'Purchase amount must be a positive number.',
    'any.required': 'Purchase amount is required.',
  }),
});

const updatePropertySchema = Joi.object({
  propertyTypeId: Joi.string().uuid().optional().messages({
    'string.uuid': 'Invalid property type ID.',
  }),
  name: Joi.string().trim().min(2).max(255).optional().messages({
    'string.min': 'Property name must be at least 2 characters.',
    'string.max': 'Property name cannot exceed 255 characters.',
  }),
  address: Joi.string().trim().min(5).max(1000).optional().messages({
    'string.min': 'Address must be at least 5 characters.',
    'string.max': 'Address cannot exceed 1000 characters.',
  }),
  areaSqFt: Joi.number().positive().precision(2).optional().messages({
    'number.base': 'Area must be a number.',
    'number.positive': 'Area must be a positive number.',
  }),
  purchaseDate: Joi.date().iso().max('now').optional().messages({
    'date.iso': 'Purchase date must be a valid ISO date.',
    'date.max': 'Purchase date cannot be in the future.',
  }),
  purchaseAmount: Joi.number().positive().precision(2).optional().messages({
    'number.base': 'Purchase amount must be a number.',
    'number.positive': 'Purchase amount must be a positive number.',
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

module.exports = { createPropertySchema, updatePropertySchema };