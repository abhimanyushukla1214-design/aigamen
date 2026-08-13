import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { nexusRouter, errorHandler } from './src/server/routes.js';

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Request Logger Middleware (Development-only)
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api', (req, res, next) => {
      res.on('finish', () => {
        const contentType = res.get('Content-Type') || 'unknown';
        console.log(`[NEXUS Server] [DEV LOG] API Response: ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} | Content-Type: ${contentType}`);
      });
      next();
    });
  }

  // API Routes
  app.use('/api/nexus', nexusRouter);
  app.use('/api', nexusRouter);

  // Fallback 404 handler for any unhandled /api route to avoid serving HTML
  app.all('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Requested API endpoint was not found on NEXUS Engine Server.',
      },
    });
  });

  // Error handling middleware for API routes
  app.use(errorHandler);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEXUS] Engine Server online on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NEXUS] Failed to start server:', err);
  process.exit(1);
});
