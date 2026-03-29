const winston = require('winston');
const path = require('path');
const env = require('./env');

const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
  return `[${ts}] ${level.toUpperCase()}: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [
    // Console — development only
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        align(),
        logFormat
      ),
      silent: env.NODE_ENV === 'test',
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: combine(timestamp(), json()),
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: combine(timestamp(), json()),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
    }),
  ],
});

module.exports = logger;