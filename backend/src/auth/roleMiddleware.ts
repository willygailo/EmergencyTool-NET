import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!userRole) {
      return res.status(403).json({ error: 'Access denied. No role found.' });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
};

export default roleMiddleware;