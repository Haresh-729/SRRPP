require('dotenv').config();

const parseCsv = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  CORS_ALLOWED_ORIGINS: parseCsv(process.env.CORS_ALLOWED_ORIGINS, [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://76cf-2402-3a80-6c5-e33a-9db0-d038-d98e-a681.ngrok-free.app'
  ]),

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  BREVO_API_KEY:    process.env.BREVO_API_KEY,
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
  BREVO_FROM_NAME:  process.env.BREVO_FROM_NAME || 'Raut Rentals',

  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_FROM_NUMBER: process.env.WHATSAPP_FROM_NUMBER,

  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  UPLOAD_BASE_PATH: process.env.UPLOAD_BASE_PATH || 'uploads',

  S3_ENDPOINT:          process.env.RAILWAY_S3_ENDPOINT,
  S3_REGION:            process.env.RAILWAY_S3_REGION || 'auto',
  S3_BUCKET:            process.env.RAILWAY_S3_BUCKET,
  S3_ACCESS_KEY_ID:     process.env.RAILWAY_S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.RAILWAY_S3_SECRET_ACCESS_KEY,
};

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'S3_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
];

required.forEach((key) => {
  if (!env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
});

module.exports = env;