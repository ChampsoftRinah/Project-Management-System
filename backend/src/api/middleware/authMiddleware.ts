import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../services/TokenService';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = TokenService.verify(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
