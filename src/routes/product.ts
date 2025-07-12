import { Router } from 'express'
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProductById,
  validatePagination
} from '../middleware/validation'

const productRouter: Router = Router()

import {
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct
} from '../controllers/product'

productRouter.post('/', validateCreateProduct, createProduct)
productRouter.get('/', validatePagination, getProducts)
productRouter.get('/:id', validateGetProductById, getProductById)

// Update routes
productRouter.put('/:id', validateUpdateProduct, updateProduct)
// Delete route
productRouter.delete('/:id', validateGetProductById, deleteProduct)

export default productRouter
