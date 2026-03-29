const Joi = require('joi');

const createTenantSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(255).required().messages({
    'string.min': 'Full name must be at least 2 characters.',
    'string.max': 'Full name cannot exceed 255 characters.',
    'any.required': 'Full name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  whatsAppNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian WhatsApp number.',
      'any.required': 'WhatsApp number is required.',
    }),
  dob: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.iso': 'Date of birth must be a valid ISO date.',
      'date.max': 'Date of birth cannot be in the future.',
      'any.required': 'Date of birth is required.',
    }),
  permanentAddress: Joi.string().trim().min(5).max(1000).required().messages({
    'string.min': 'Permanent address must be at least 5 characters.',
    'string.max': 'Permanent address cannot exceed 1000 characters.',
    'any.required': 'Permanent address is required.',
  }),
});

const updateTenantSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(255).optional().messages({
    'string.min': 'Full name must be at least 2 characters.',
    'string.max': 'Full name cannot exceed 255 characters.',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address.',
  }),
  whatsAppNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit Indian WhatsApp number.',
    }),
  dob: Joi.date().iso().max('now').optional().messages({
    'date.iso': 'Date of birth must be a valid ISO date.',
    'date.max': 'Date of birth cannot be in the future.',
  }),
  permanentAddress: Joi.string().trim().min(5).max(1000).optional().messages({
    'string.min': 'Permanent address must be at least 5 characters.',
    'string.max': 'Permanent address cannot exceed 1000 characters.',
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

module.exports = { createTenantSchema, updateTenantSchema };