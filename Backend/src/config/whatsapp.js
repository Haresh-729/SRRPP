const axios = require('axios');
const env = require('./env');
const logger = require('./logger');

const whatsappClient = axios.create({
  baseURL: `${env.WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

whatsappClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error?.message || error.message;
    logger.error(`WhatsApp API Error: ${msg}`);
    return Promise.reject(error);
  }
);

module.exports = whatsappClient;