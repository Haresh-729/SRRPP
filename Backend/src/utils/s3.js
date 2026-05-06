const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const env = require('../config/env');
const logger = require('../config/logger');

const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const uploadToS3 = async (buffer, key, mimetype) => {
  await s3.send(new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));
  return key;
};

const deleteFromS3 = async (key) => {
  if (!key) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  } catch (err) {
    logger.error(`S3 delete failed for key ${key}: ${err.message}`);
  }
};

const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
};

// ── Key builders ──────────────────────────────────────────────────────────────

const buildPropertyKey = (propertyId, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `properties/${propertyId}/${uuidv4()}${ext}`;
};

const buildAgreementKey = (year, propertyName, originalName) => {
  const ext  = path.extname(originalName).toLowerCase();
  const safe = propertyName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `agreements/${year}/${safe}/${uuidv4()}${ext}`;
};

const buildTenantKey = (tenantId, docType, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `tenants/${tenantId}/${docType}/${uuidv4()}${ext}`;
};

const buildPaymentKey = (folder, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `payments/${folder}/${uuidv4()}${ext}`;
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
  buildPropertyKey,
  buildAgreementKey,
  buildTenantKey,
  buildPaymentKey,
};