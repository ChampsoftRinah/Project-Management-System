import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../services/TokenService';

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = TokenService.verify(token);
    if (!decoded.tenant_id) return res.status(403).json({ error: 'No tenant_id in token' });
    (req as any).tenant_id = decoded.tenant_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
