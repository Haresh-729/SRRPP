const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name cannot exceed 255 characters.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
      'any.required': 'Password is required.',
    }),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional().messages({
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name cannot exceed 255 characters.',
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

const assignPropertyAccessSchema = Joi.object({
  propertyId: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid property ID.',
    'any.required': 'Property ID is required.',
  }),
  validFrom: Joi.date().iso().required().messages({
    'date.iso': 'Valid from date must be a valid ISO date.',
    'any.required': 'Valid from date is required.',
  }),
  validTo: Joi.date().iso().greater(Joi.ref('validFrom')).required().messages({
    'date.iso': 'Valid to date must be a valid ISO date.',
    'date.greater': 'Valid to date must be after valid from date.',
    'any.required': 'Valid to date is required.',
  }),
});

const updatePropertyAccessSchema = Joi.object({
  validFrom: Joi.date().iso().optional().messages({
    'date.iso': 'Valid from date must be a valid ISO date.',
  }),
  validTo: Joi.date().iso().optional().messages({
    'date.iso': 'Valid to date must be a valid ISO date.',
  }),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
      'any.required': 'New password is required.',
    }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  assignPropertyAccessSchema,
  updatePropertyAccessSchema,
  resetPasswordSchema,
};