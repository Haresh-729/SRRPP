const { BrevoClient } = require('@getbrevo/brevo');
const env = require('./env');
const logger = require('./logger');

const brevoClient = env.BREVO_API_KEY
  ? new BrevoClient({ apiKey: env.BREVO_API_KEY })
  : null;

const sendEmail = async ({ to, subject, html, text }) => {
  if (!brevoClient) {
    throw new Error('BREVO_API_KEY is not configured.');
  }

  return brevoClient.transactionalEmails.sendTransacEmail({
    sender: { name: env.BREVO_FROM_NAME, email: env.BREVO_FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  });
};

const verifyMailer = async () => {
  if (!env.BREVO_API_KEY) {
    logger.warn('⚠️  BREVO_API_KEY not set — emails will not send.');
    return;
  }
  logger.info('✅ Brevo email client configured');
};

module.exports = { sendEmail, verifyMailer };