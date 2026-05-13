import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || null,
    },
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || null,
  });
}
