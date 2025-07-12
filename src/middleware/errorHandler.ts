import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'


export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public code?: string

  constructor(message: string, statusCode: number, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}


export enum ErrorTypes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}


interface ErrorResponse {
  success: boolean
  error: {
    type: string
    message: string
    code?: string
    details?: any[]
    stack?: string
  }
  timestamp: string
  path: string
  method: string
}

const shouldLogError = (statusCode: number): boolean => {
  return statusCode >= 500
}


const formatZodError = (error: ZodError): { message: string; details: any[] } => {
  const details = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }))

  return {
    message: 'Validation failed',
    details
  }
}

const formatMongooseValidationError = (error: mongoose.Error.ValidationError): { message: string; details: any[] } => {
  const details = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: (err as any).value
  }))

  return {
    message: 'Database validation failed',
    details
  }
}

const formatMongooseCastError = (error: mongoose.Error.CastError): { message: string; details: any[] } => {
  return {
    message: `Invalid ${error.path}`,
    details: [{
      field: error.path,
      message: `Invalid ${error.kind}`,
      value: error.value
    }]
  }
}


const formatDuplicateKeyError = (error: any): { message: string; details: any[] } => {
  const field = Object.keys(error.keyValue)[0]
  const value = error.keyValue[field]

  return {
    message: `Duplicate value for ${field}`,
    details: [{
      field,
      message: `${field} '${value}' already exists`,
      value
    }]
  }
}


export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let errorType = ErrorTypes.INTERNAL_SERVER_ERROR
  let details: any[] = []
  let code = err.code


  if (err instanceof ZodError) {
    statusCode = 400
    errorType = ErrorTypes.VALIDATION_ERROR
    const formatted = formatZodError(err)
    message = formatted.message
    details = formatted.details
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    errorType = ErrorTypes.VALIDATION_ERROR
    const formatted = formatMongooseValidationError(err)
    message = formatted.message
    details = formatted.details
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    errorType = ErrorTypes.VALIDATION_ERROR
    const formatted = formatMongooseCastError(err)
    message = formatted.message
    details = formatted.details
  } else if (err.code === 11000) {
    statusCode = 409
    errorType = ErrorTypes.DUPLICATE_ERROR
    const formatted = formatDuplicateKeyError(err)
    message = formatted.message
    details = formatted.details
  } else if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    code = err.code
    errorType = determineErrorType(statusCode)
  }  else if (err.name === 'MongoNetworkError') {
    statusCode = 503
    errorType = ErrorTypes.DATABASE_ERROR
    message = 'Database connection failed'
  }

  if (shouldLogError(statusCode)) {
    console.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      type: errorType,
      message,
      ...(code && { code }),
      ...(details.length > 0 && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  }

  res.status(statusCode).json(errorResponse)
}

const determineErrorType = (statusCode: number): ErrorTypes => {
  switch (true) {
    case statusCode === 400:
      return ErrorTypes.VALIDATION_ERROR
    case statusCode === 401:
      return ErrorTypes.AUTHENTICATION_ERROR
    case statusCode === 403:
      return ErrorTypes.AUTHORIZATION_ERROR
    case statusCode === 404:
      return ErrorTypes.NOT_FOUND_ERROR
    case statusCode === 409:
      return ErrorTypes.DUPLICATE_ERROR
    case statusCode >= 500:
      return ErrorTypes.INTERNAL_SERVER_ERROR
    default:
      return ErrorTypes.INTERNAL_SERVER_ERROR
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    ErrorTypes.NOT_FOUND_ERROR
  )
  next(error)
}


export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
    process.exit(1)
  })


  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('UNHANDLED REJECTION! Shutting down...', {
      reason,
      promise,
      timestamp: new Date().toISOString()
    })
    process.exit(1)
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...')
    process.exit(0)
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...')
    process.exit(0)
  })
}

export const createValidationError = (message: string, details?: any[]) => 
  new AppError(message, 400, ErrorTypes.VALIDATION_ERROR)

export const createNotFoundError = (resource: string) => 
  new AppError(`${resource} not found`, 404, ErrorTypes.NOT_FOUND_ERROR)

export const createDuplicateError = (field: string, value: string) => 
  new AppError(`${field} '${value}' already exists`, 409, ErrorTypes.DUPLICATE_ERROR)

export const createInternalError = (message: string = 'Internal server error') => 
  new AppError(message, 500, ErrorTypes.INTERNAL_SERVER_ERROR)