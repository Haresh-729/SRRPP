const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const env = require('./config/env');
const logger = require('./config/logger');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const AppError = require('./utils/AppError');
const routes = require('./routes/index');

const app = express();

// ── Security ───────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────
const allowedOrigins = env.CORS_ALLOWED_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Rate Limiting ──────────────────────────────────────────
app.use(globalLimiter);

// ── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Compression ────────────────────────────────────────────
app.use(compression());

// ── Static Files ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── HTTP Request Logging ───────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// ── API Routes ─────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ────────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

module.exports = app;