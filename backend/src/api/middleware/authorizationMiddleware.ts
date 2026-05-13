import { Request, Response, NextFunction } from 'express';

export function authorizationMiddleware(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !user.roles) {
      res.status(403).json({ error: 'No user roles found' });
      return;
    }
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}
