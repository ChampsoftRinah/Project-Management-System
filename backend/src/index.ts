import express, { Express, Request, Response, NextFunction } from 'express';
import { errorMiddleware } from './api/middleware/errorMiddleware';
import { authMiddleware } from './api/middleware/authMiddleware';
import { tenantMiddleware } from './api/middleware/tenantMiddleware';

const app: Express = express();

// Body parser middleware
app.use(express.json());

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).id = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', (req as any).id);
  next();
});

// Mount routes (to be imported)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/projects', projectRoutes);
// app.use('/api/v1/tasks', taskRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);
// app.use('/api/v1/users', userRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

export default app;
