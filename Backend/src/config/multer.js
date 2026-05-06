const multer  = require('multer');
const AppError = require('../utils/AppError');
const constants = require('./constants');

const MB = 1024 * 1024;
const memory = multer.memoryStorage();

const pdfFilter = (_req, file, cb) => {
  constants.ALLOWED_PDF_TYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new AppError('Only PDF files are allowed.', 400), false);
};

const imageFilter = (_req, file, cb) => {
  constants.ALLOWED_IMAGE_TYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new AppError('Only JPG and PNG images are allowed.', 400), false);
};

const agreementCreationFilter = (_req, file, cb) => {
  if (file.fieldname === 'agreementPdf') {
    constants.ALLOWED_PDF_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError('Agreement file must be a PDF.', 400), false);
  } else {
    constants.ALLOWED_IMAGE_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError('Cheque photo must be a JPG or PNG image.', 400), false);
  }
};

module.exports = {
  agreementUpload: multer({
    storage: memory,
    fileFilter: pdfFilter,
    limits: { fileSize: constants.MAX_PDF_SIZE_MB * MB },
  }),

  agreementCreationUpload: multer({
    storage: memory,
    fileFilter: agreementCreationFilter,
    limits: { fileSize: constants.MAX_PDF_SIZE_MB * MB },
  }),

  purchaseAgreementUpload: multer({
    storage: memory,
    fileFilter: pdfFilter,
    limits: { fileSize: constants.MAX_PDF_SIZE_MB * MB },
  }),

  tenantDocUpload: multer({
    storage: memory,
    fileFilter: imageFilter,
    limits: { fileSize: constants.MAX_IMAGE_SIZE_MB * MB },
  }),

  chequeUpload: multer({
    storage: memory,
    fileFilter: imageFilter,
    limits: { fileSize: constants.MAX_IMAGE_SIZE_MB * MB },
  }),
};