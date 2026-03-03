import 'dotenv/config';
import express, { Express } from 'express';

import healthRoutes from './routes/health';
import indexRoutes from './routes/index';
import dbRoutes from './routes/db';
import cacheRoutes from './routes/cache';
import contactRoutes from './routes/contact';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(express.json());

// Routes
app.use(healthRoutes);
app.use(indexRoutes);
app.use(dbRoutes);
app.use(cacheRoutes);
app.use(contactRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] Server running on port ${PORT}`);
  console.log(`[Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
});
