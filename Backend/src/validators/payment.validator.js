const Joi = require('joi');

const recordPaymentSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Payment amount must be a positive number.',
    'any.required': 'Payment amount is required.',
  }),
  paymentMode: Joi.string().valid('CASH', 'CHEQUE', 'UPI').required().messages({
    'any.only': 'Payment mode must be CASH, CHEQUE, or UPI.',
    'any.required': 'Payment mode is required.',
  }),
  receivedOn: Joi.date().iso().max('now').required().messages({
    'date.iso': 'Received on must be a valid ISO date.',
    'date.max': 'Received on date cannot be in the future.',
    'any.required': 'Received on date is required.',
  }),
  chequeNumber: Joi.when('paymentMode', {
    is: 'CHEQUE',
    then: Joi.string().trim().required().messages({
      'any.required': 'Cheque number is required for cheque payments.',
    }),
    otherwise: Joi.string().trim().optional().allow('', null),
  }),
  chequeDate: Joi.when('paymentMode', {
    is: 'CHEQUE',
    then: Joi.date().iso().required().messages({
      'any.required': 'Cheque date is required for cheque payments.',
    }),
    otherwise: Joi.date().iso().optional().allow('', null),
  }),
  bankName: Joi.when('paymentMode', {
    is: 'CHEQUE',
    then: Joi.string().trim().required().messages({
      'any.required': 'Bank name is required for cheque payments.',
    }),
    otherwise: Joi.string().trim().optional().allow('', null),
  }),
  upiTransactionId: Joi.when('paymentMode', {
    is: 'UPI',
    then: Joi.string().trim().required().messages({
      'any.required': 'UPI transaction ID is required for UPI payments.',
    }),
    otherwise: Joi.string().trim().optional().allow('', null),
  }),
  remarks: Joi.string().trim().max(500).optional().allow('', null),
});

const recordAdvancePaymentSchema = Joi.object({
  advanceForMonth: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({
      'string.pattern.base': 'Advance for month must be in YYYY-MM format.',
      'any.required': 'Advance for month is required.',
    }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Payment amount must be a positive number.',
    'any.required': 'Payment amount is required.',
  }),
  paymentMode: Joi.string().valid('CASH', 'CHEQUE', 'UPI').required().messages({
    'any.only': 'Payment mode must be CASH, CHEQUE, or UPI.',
    'any.required': 'Payment mode is required.',
  }),
  receivedOn: Joi.date().iso().max('now').required().messages({
    'date.iso': 'Received on must be a valid ISO date.',
    'date.max': 'Received on date cannot be in the future.',
    'any.required': 'Received on date is required.',
  }),
  chequeNumber: Joi.when('paymentMode', {
    is: 'CHEQUE',
    then: Joi.string().trim().required().messages({
      'any.required': 'Cheque number is required for cheque payments.',
    }),
    otherwise: Joi.string().trim().optional().allow('', null),
  }),
  chequeDate: Joi.when('paymentMode', {
    is: 'CHEQUE',
    then: Joi.date().iso().required().messages({
      'any.required': 'Cheque date is required for cheque payments.',
    }),
    otherwise: Joi.date().iso().optional().allow('', null),
  }),
  bankName: Joi.when('paymentMode', {
    is: 'CHEQUE',
    then: Joi.string().trim().required().messages({
      'any.required': 'Bank name is required for cheque payments.',
    }),
    otherwise: Joi.string().trim().optional().allow('', null),
  }),
  upiTransactionId: Joi.when('paymentMode', {
    is: 'UPI',
    then: Joi.string().trim().required().messages({
      'any.required': 'UPI transaction ID is required for UPI payments.',
    }),
    otherwise: Joi.string().trim().optional().allow('', null),
  }),
  remarks: Joi.string().trim().max(500).optional().allow('', null),
});

module.exports = { recordPaymentSchema, recordAdvancePaymentSchema };