require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const assistantRoutes = require('./routes/assistant');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 5000;

// ----- Security & parsing middleware -----
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

// CORS - CHANGE FRONTEND_URL in .env to your deployed frontend origin
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Basic rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ----- Routes -----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DevOpsAI backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 DevOpsAI backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
