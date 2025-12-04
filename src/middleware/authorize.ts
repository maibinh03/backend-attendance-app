// middleware/authorize.ts
import { Response, NextFunction } from 'express';
import { UserRole } from '../types/roles';
import { AuthRequest } from './auth';

/**
 * Middleware để kiểm tra quyền truy cập dựa trên role
 * @param allowedRoles - Mảng các role được phép truy cập
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền truy cập tài nguyên này' 
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Middleware kiểm tra quyền admin hoặc manager
 */
export const requireAdminOrManager = authorize(UserRole.ADMIN, UserRole.MANAGER);

