const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

const verifyMailer = async () => {
  try {
    await transporter.verify();
    logger.info('✅ Nodemailer connected successfully');
  } catch (error) {
    logger.warn(`⚠️  Nodemailer connection failed: ${error.message}`);
  }
};

module.exports = { transporter, verifyMailer };