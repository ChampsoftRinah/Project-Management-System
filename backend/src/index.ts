import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errorMiddleware } from './api/middleware/errorMiddleware';
import { getCorsOptions } from './config/cors';

// Import route handlers
import authRoutes from './api/routes/auth';
import projectRoutes from './api/routes/projects';
import taskRoutes from './api/routes/tasks';
import analyticsRoutes from './api/routes/analytics';
import userRoutes from './api/routes/users';
import auditRoutes from './api/routes/audit';

const app: Express = express();

// Body parser middleware
app.use(express.json());

// CORS middleware
app.use(cors(getCorsOptions()));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).id = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', (req as any).id);
  next();
});

// Mount routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', projectRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1', analyticsRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', auditRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

export default app;
