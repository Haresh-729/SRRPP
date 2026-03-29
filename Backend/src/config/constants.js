module.exports = {
  // Agreement
  AGREEMENT_CYCLE_MONTHS: 11,
  VALID_AGREEMENT_DURATIONS: [11, 22, 33, 55, 110],

  // Rent
  RENT_REMINDER_DAYS_BEFORE: 5,
  AGREEMENT_EXPIRY_REMINDER_DAYS: 30,

  // File sizes
  MAX_PDF_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 5,

  // Allowed MIME types
  ALLOWED_PDF_TYPES: ['application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],

  // Upload paths
  UPLOAD_PATHS: {
    AGREEMENTS: 'uploads/agreements',
    PURCHASE_AGREEMENTS: 'uploads/purchase-agreements',
    TENANT_AADHAR: 'uploads/tenants/aadhar',
    TENANT_PAN: 'uploads/tenants/pan',
    PAYMENT_CHEQUES: 'uploads/payments/cheques',
    BROKERAGE_CHEQUES: 'uploads/payments/cheques',
  },

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Payment modes
  PAYMENT_MODES: {
    CASH: 'CASH',
    CHEQUE: 'CHEQUE',
    UPI: 'UPI',
  },

  // Roles
  ROLES: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },
};