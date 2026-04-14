const Joi = require('joi');
const { VALID_AGREEMENT_DURATIONS } = require('../config/constants');

const createAgreementSchema = Joi.object({
  // ── Core ───────────────────────────────────────────────────────────────────
  propertyId: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid property ID.',
    'any.required': 'Property is required.',
  }),
  tenantId: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid tenant ID.',
    'any.required': 'Tenant is required.',
  }),
  brokerId: Joi.string().uuid().optional().allow('', null).messages({
    'string.uuid': 'Invalid broker ID.',
  }),
  durationMonths: Joi.number()
    .integer()
    .valid(...VALID_AGREEMENT_DURATIONS)
    .required()
    .messages({
      'any.only': `Duration must be one of: ${VALID_AGREEMENT_DURATIONS.join(', ')} months.`,
      'any.required': 'Agreement duration is required.',
    }),
  startDate: Joi.date().iso().required().messages({
    'date.iso': 'Start date must be a valid ISO date.',
    'any.required': 'Start date is required.',
  }),
  monthlyRent: Joi.number().positive().required().messages({
    'number.positive': 'Monthly rent must be a positive number.',
    'any.required': 'Monthly rent is required.',
  }),
  rentEscalationPercent: Joi.when('durationMonths', {
    is: Joi.number().greater(11),
    then: Joi.number().min(0).max(100).required().messages({
      'any.required': 'Rent escalation percentage is required for agreements longer than 11 months.',
      'number.max': 'Rent escalation cannot exceed 100%.',
    }),
    otherwise: Joi.number().min(0).max(100).optional().allow(null, ''),
  }),
  rentDueDay: Joi.number().integer().min(1).max(28).required().messages({
    'number.min': 'Rent due day must be between 1 and 28.',
    'number.max': 'Rent due day must be between 1 and 28.',
    'any.required': 'Rent due day is required.',
  }),
  depositAmount: Joi.number().positive().required().messages({
    'number.positive': 'Deposit amount must be a positive number.',
    'any.required': 'Deposit amount is required.',
  }),

  // ── GST ────────────────────────────────────────────────────────────────────
  gstApplicable: Joi.boolean().optional().default(false),
  gstPercent: Joi.when('gstApplicable', {
    is: true,
    then: Joi.number().positive().max(100).required().messages({
      'any.required': 'GST percent is required when GST is applicable.',
      'number.positive': 'GST percent must be greater than 0.',
      'number.max': 'GST percent cannot exceed 100%.',
    }),
    otherwise: Joi.number().optional().allow(null, ''),
  }),
  gstBillingType: Joi.when('gstApplicable', {
    is: true,
    then: Joi.string().valid('EVERY_MONTH', 'ALTERNATE_MONTH').required().messages({
      'any.required': 'GST billing type is required when GST is applicable.',
      'any.only': 'GST billing type must be EVERY_MONTH or ALTERNATE_MONTH.',
    }),
    otherwise: Joi.string().optional().allow(null, ''),
  }),
  gstAlternateStartsOn: Joi.when('gstBillingType', {
    is: 'ALTERNATE_MONTH',
    then: Joi.number().integer().valid(1, 2).required().messages({
      'any.required': 'GST alternate start month is required for ALTERNATE_MONTH billing.',
      'any.only': 'GST alternate start month must be 1 or 2.',
    }),
    otherwise: Joi.number().integer().optional().allow(null, ''),
  }),
  gstInclusive: Joi.when('gstApplicable', {
    is: true,
    then: Joi.boolean().optional().default(false),
    otherwise: Joi.boolean().optional().allow(null, ''),
  }),

  // ── Deposit payment at creation (all optional — can be added later) ────────
  depositReceivedOn: Joi.date().iso().optional().allow('', null),
  depositPaymentMode: Joi.string().valid('CASH', 'CHEQUE', 'UPI').optional().allow('', null),
  depositChequeNumber: Joi.string().trim().optional().allow('', null),
  depositChequeDate: Joi.date().iso().optional().allow('', null),
  depositBankName: Joi.string().trim().optional().allow('', null),
  depositRemarks: Joi.string().trim().optional().allow('', null),

  // ── Brokerage (optional — only meaningful when brokerId is provided) ───────
  brokerageType: Joi.string().valid('PERCENTAGE', 'AMOUNT').optional().allow('', null),
  brokerageValue: Joi.number().positive().optional().allow(null, ''),
  brokerageIsPaid: Joi.boolean().optional(),
  brokeragePaidOn: Joi.date().iso().optional().allow('', null),
  brokeragePaymentMode: Joi.string().valid('CASH', 'CHEQUE').optional().allow('', null),
  brokerageChequeNumber: Joi.string().trim().optional().allow('', null),
  brokerageChequeDate: Joi.date().iso().optional().allow('', null),
  brokerageBankName: Joi.string().trim().optional().allow('', null),
  brokerageRemarks: Joi.string().trim().optional().allow('', null),
});

const terminateAgreementSchema = Joi.object({
  terminationReason: Joi.string().trim().min(5).max(1000).required().messages({
    'string.min': 'Termination reason must be at least 5 characters.',
    'string.max': 'Termination reason cannot exceed 1000 characters.',
    'any.required': 'Termination reason is required.',
  }),
});

const updateDepositSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number.',
    'any.required': 'Amount is required.',
  }),
  receivedOn: Joi.date().iso().required().messages({
    'date.iso': 'Received on must be a valid ISO date.',
    'any.required': 'Received on date is required.',
  }),
  paymentMode: Joi.string().valid('CASH', 'CHEQUE', 'UPI').required().messages({
    'any.only': 'Payment mode must be CASH, CHEQUE, or UPI.',
    'any.required': 'Payment mode is required.',
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
  remarks: Joi.string().trim().optional().allow('', null),
});

const updateBrokerageSchema = Joi.object({
  brokerageType: Joi.string().valid('PERCENTAGE', 'AMOUNT').required().messages({
    'any.only': 'Brokerage type must be PERCENTAGE or AMOUNT.',
    'any.required': 'Brokerage type is required.',
  }),
  brokerageValue: Joi.number().positive().required().messages({
    'number.positive': 'Brokerage value must be a positive number.',
    'any.required': 'Brokerage value is required.',
  }),
  isPaid: Joi.boolean().optional(),
  paidOn: Joi.date().iso().optional().allow('', null),
  paymentMode: Joi.string().valid('CASH', 'CHEQUE').optional().allow('', null).messages({
    'any.only': 'Payment mode must be CASH or CHEQUE.',
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
  remarks: Joi.string().trim().optional().allow('', null),
});

module.exports = {
  createAgreementSchema,
  terminateAgreementSchema,
  updateDepositSchema,
  updateBrokerageSchema,
};