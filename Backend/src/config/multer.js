const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');
const constants = require('./constants');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const buildStorage = (destination) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(destination);
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

// ── Tenant doc storage (routes aadhar & pan to separate folders) ──────────────
const tenantDocStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const dest =
      file.fieldname === 'panPhoto'
        ? constants.UPLOAD_PATHS.TENANT_PAN
        : constants.UPLOAD_PATHS.TENANT_AADHAR;
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ── Agreement creation storage (PDF + cheque photos) ─────────────────────────
const agreementCreationStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const dest =
      file.fieldname === 'agreementPdf'
        ? constants.UPLOAD_PATHS.AGREEMENTS
        : constants.UPLOAD_PATHS.PAYMENT_CHEQUES;
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ── File filters ──────────────────────────────────────────────────────────────

const pdfFilter = (_req, file, cb) => {
  if (constants.ALLOWED_PDF_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed.', 400), false);
  }
};

const imageFilter = (_req, file, cb) => {
  if (constants.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG and PNG images are allowed.', 400), false);
  }
};

const agreementCreationFilter = (_req, file, cb) => {
  if (file.fieldname === 'agreementPdf') {
    if (constants.ALLOWED_PDF_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Agreement file must be a PDF.', 400), false);
    }
  } else {
    if (constants.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Cheque photo must be a JPG or PNG image.', 400), false);
    }
  }
};

const MB = 1024 * 1024;

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  agreementUpload: multer({
    storage: buildStorage(constants.UPLOAD_PATHS.AGREEMENTS),
    fileFilter: pdfFilter,
    limits: { fileSize: constants.MAX_PDF_SIZE_MB * MB },
  }),

  agreementCreationUpload: multer({
    storage: agreementCreationStorage,
    fileFilter: agreementCreationFilter,
    limits: { fileSize: constants.MAX_PDF_SIZE_MB * MB },
  }),

  purchaseAgreementUpload: multer({
    storage: buildStorage(constants.UPLOAD_PATHS.PURCHASE_AGREEMENTS),
    fileFilter: pdfFilter,
    limits: { fileSize: constants.MAX_PDF_SIZE_MB * MB },
  }),

  tenantDocUpload: multer({
    storage: tenantDocStorage,
    fileFilter: imageFilter,
    limits: { fileSize: constants.MAX_IMAGE_SIZE_MB * MB },
  }),

  chequeUpload: multer({
    storage: buildStorage(constants.UPLOAD_PATHS.PAYMENT_CHEQUES),
    fileFilter: imageFilter,
    limits: { fileSize: constants.MAX_IMAGE_SIZE_MB * MB },
  }),
};