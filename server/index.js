// TradePulse — Express Server Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import stockRoutes from './routes/stocks.js';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Security & CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://abhinaysingh7.github.io',
  'https://tradepulse-frontend.onrender.com'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ''));
}
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(o => {
    const trimmed = o.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.github.io') ||
      origin.endsWith('.onrender.com') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging (sanitized, zero secrets logged)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint (Zero secrets exposed)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TradePulse API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    hasFinnhubKey: Boolean(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY.trim()),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Stock API routes
app.use('/api/stocks', stockRoutes);

// Optional: In production, serve Vite static build if dist folder exists
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// 404 & SPA fallback middleware (Express 5 safe)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: `API route not found: ${req.originalUrl}`,
      status: 404
    });
  }
  if (fs.existsSync(distPath) && req.method === 'GET') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.status(404).send('Not Found');
});

// Centralized error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Do not expose stack traces or secrets
  console.error(`[Error] ${status} - ${message}`);

  res.status(status).json({
    error: message,
    status
  });
});

// Start server only when executed directly
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
let server;
if (isDirectRun) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ TradePulse Server running on http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Finnhub Configured: ${Boolean(process.env.FINNHUB_API_KEY)}`);
  });
  server.on('close', () => console.log('[Server] server close event fired'));
  server.on('error', (e) => console.error('[Server] server error event:', e));
}

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down TradePulse server gracefully...`);
  if (server) {
    server.close(() => {
      console.log('TradePulse server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
