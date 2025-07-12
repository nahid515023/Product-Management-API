import { Request, Response, NextFunction } from 'express'
import { asyncHandler } from '../middleware/errorHandler'

export const getHealth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'UP',
    message: 'Service is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

