import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle known error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Dữ liệu không hợp lệ'
    });
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Đã xảy ra lỗi hệ thống' 
      : err.message || 'Internal Server Error'
  });
};

