const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB } = require('./config/database');
const { verifyMailer } = require('./config/nodemailer');
const { startSchedulers } = require('./jobs/queue');

const startServer = async () => {
  // Connect to DB
  await connectDB();

  // Verify mailer
  await verifyMailer();

  // Start cron schedulers for notifications
  startSchedulers();

  // Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📡 API Base URL: ${env.APP_URL}/api/v1`);
  });

  // ── Graceful Shutdown ──────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
  });
};

startServer();