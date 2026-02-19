import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      details: err.details,
      timestamp: new Date(),
    };

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Unknown error
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
      timestamp: new Date(),
    };

    res.status(500).json(errorResponse);
  }
};
