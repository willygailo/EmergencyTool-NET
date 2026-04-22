import { Router, Request, Response } from 'express';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

export default roleMiddleware;