import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.js';
import ipHasher from './middleware/ipHasher.js';
import confessionsRouter from './routes/confessions.js';
import repliesRouter from './routes/replies.js';
import reactionsRouter from './routes/reactions.js';

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Body parsing with strict size limit
app.use(express.json({ limit: '10kb' }));

// Privacy — hash IP before any route handler
app.use(ipHasher);

// No request logging — intentional for privacy
app.set('trust proxy', 1);

import { fileURLToPath } from 'url';
import path from 'path';

// API routes
app.use('/api/confessions', confessionsRouter);
app.use('/api/confessions', repliesRouter);
app.use('/api/confessions', reactionsRouter);

app.get('/api/categories', (req, res) => {
  res.json(config.CATEGORIES);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve Frontend in Production ────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

// Serve static files from the React app
app.use(express.static(distPath));

// The "catchall" handler: for any request that doesn't
// match an api route, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.PORT, () => {
  console.log(`🔐 Confession API running on port ${config.PORT}`);
  console.log(`   Privacy mode: ACTIVE — no IPs logged, no tracking`);
});
