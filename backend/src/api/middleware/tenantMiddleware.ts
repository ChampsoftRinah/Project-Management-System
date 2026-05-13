import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../services/TokenService';

export function tenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = TokenService.verify(token);
    if (!decoded.tenant_id) {
      res.status(403).json({ error: 'No tenant_id in token' });
      return;
    }
    (req as any).tenant_id = decoded.tenant_id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
