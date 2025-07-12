import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'
import mongoose from 'mongoose'

// Custom Zod validator for MongoDB ObjectId
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format' }
)

// Product validation schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
    price: z.number().min(0, 'Price must be a positive number'),
    discount: z.number().min(0, 'Discount must be at least 0').max(100, 'Discount cannot exceed 100%').optional().default(0),
    image: z.string().url('Image must be a valid URL'),
    status: z.enum(['In Stock', 'Stock Out']).optional().default('In Stock'),
    categoryId: objectIdSchema
  })
})

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters').optional(),
    description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    discount: z.number().min(0, 'Discount must be at least 0').max(100, 'Discount cannot exceed 100%').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    status: z.enum(['In Stock', 'Stock Out']).optional(),
    categoryId: objectIdSchema.optional()
  })
})

export const getProductByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
})

// Category validation schemas
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
    description: z.string().max(200, 'Description must be less than 200 characters').optional()
  })
})


export const updateCategorySchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters').optional(),
    description: z.string().max(200, 'Description must be less than 200 characters').optional()
  })
})

export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
})

// Query validation schemas for pagination and filtering
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a positive number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').transform(Number).optional(),
    search: z.string().optional(),
    category: objectIdSchema.optional(),
    status: z.enum(['In Stock', 'Stock Out']).optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
})

// Validation middleware factory
export const validate = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: errorMessages
        })
      }
      next(error)
    }
  }
}

// Specific validation middleware for common use cases
export const validateCreateProduct = validate(createProductSchema)
export const validateUpdateProduct = validate(updateProductSchema)
export const validateGetProductById = validate(getProductByIdSchema)
export const validateCreateCategory = validate(createCategorySchema)
export const validateUpdateCategory = validate(updateCategorySchema)
export const validateGetCategoryById = validate(getCategoryByIdSchema)
export const validatePagination = validate(paginationSchema)

// Type exports for TypeScript type safety
export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']
export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body']
export type PaginationQuery = z.infer<typeof paginationSchema>['query']