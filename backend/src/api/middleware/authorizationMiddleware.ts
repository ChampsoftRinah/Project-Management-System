import { Request, Response, NextFunction } from 'express';

export function authorizationMiddleware(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.roles) return res.status(403).json({ error: 'No user roles found' });
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) return res.status(403).json({ error: 'Forbidden: insufficient role' });
    next();
  };
}
