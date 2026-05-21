import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction): void {
  // Default internal response
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details: any = err.details || null;

  // Normalize common Postgres errors to avoid leaking DB internals
  if (err && err.code) {
    // Undefined column
    if (err.code === '42703') {
      status = 500;
      code = 'DB_SCHEMA_ERROR';
      message = 'Invalid database structure or missing column';
      details = null;
    }

    // Unique violation
    else if (err.code === '23505') {
      status = 409;
      code = 'CONFLICT';
      message = 'Resource conflict';
      // Provide minimal detail without exposing SQL
      details = err.detail ? 'Duplicate value violates unique constraint' : null;
    }

    // Foreign key violation
    else if (err.code === '23503') {
      status = 400;
      code = 'INVALID_REFERENCE';
      message = 'Referenced resource not found or invalid';
      details = null;
    }
  }

  // Log the original error server-side for debugging (no raw DB messages to clients)
  console.error('[ERROR]', { code: err?.code, message: err?.message, stack: err?.stack });

  res.status(status).json({
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || null,
  });
}
