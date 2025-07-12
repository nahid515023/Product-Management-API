import { Request, Response, NextFunction } from 'express'
import Category from '../models/category'
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  PaginationQuery
} from '../middleware/validation'
import { asyncHandler, createNotFoundError } from '../middleware/errorHandler'

export const getCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, search } = req.query as PaginationQuery

    const filter: any = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const pageNum = page || 1
    const limitNum = limit || 10
    const skip = (pageNum - 1) * limitNum

    const categories = await Category.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 })

    const totalCategories = await Category.countDocuments(filter)
    const totalPages = Math.ceil(totalCategories / limitNum)

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCategories,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    })
  }
)

export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body as CreateCategoryInput

    const newCategory = await Category.create({ name, description })
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    })
  }
)

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      })
    }

    const category = await Category.findById(id)
    if (!category) {
      throw createNotFoundError('Category')
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    })
  }
)

export const updateCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      })
    }
    const updateData = req.body as UpdateCategoryInput

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedCategory) {
      throw createNotFoundError('Category')
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    })
  }
)

export const deleteCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      })
    }

    const deletedCategory = await Category.findByIdAndDelete(id)
    if (!deletedCategory) {
      throw createNotFoundError('Category')
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    })
  }
)
