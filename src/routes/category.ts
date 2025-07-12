import { Router } from 'express'
import {
  validateCreateCategory,
  validateUpdateCategory,
  validatePagination
} from '../middleware/validation'
import {
  createCategory,
  getCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById
} from '../controllers/category'

const categoryRouter = Router()

categoryRouter.post('/', validateCreateCategory, createCategory)
categoryRouter.get('/', validatePagination, getCategory)
categoryRouter.get('/:id', getCategoryById)
categoryRouter.put('/:id', validateUpdateCategory, updateCategoryById)
categoryRouter.delete('/:id', deleteCategoryById)

export default categoryRouter
