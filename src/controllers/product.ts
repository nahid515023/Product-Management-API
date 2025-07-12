import { Request, Response, NextFunction } from 'express'
import Product from '../models/product'
import Category from '../models/category'
import generateProductCode from '../utils/generateProductCode'
import {
  CreateProductInput,
  UpdateProductInput,
  PaginationQuery
} from '../middleware/validation'
import {
  asyncHandler,
  createNotFoundError,
  createValidationError
} from '../middleware/errorHandler'

const calculatePricing = (product: any) => {
  const originalPrice = product.price
  const discountPercentage = product.discount || 0
  const discountAmount = (originalPrice * discountPercentage) / 100
  const finalPrice = originalPrice - discountAmount
  const savings = discountAmount

  return {
    ...product.toObject(),
    pricing: {
      originalPrice: parseFloat(originalPrice.toFixed(2)),
      discountPercentage,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      hasDiscount: discountPercentage > 0
    }
  }
}

export const createProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price, discount, categoryId, image, status } =
    req.body as CreateProductInput

  const categoryExists = await Category.findById(categoryId)
  if (!categoryExists) {
    throw createNotFoundError('Category')
  }


  const existingProduct = await Product.findOne({
    name,
    category: categoryId
  })
  if (existingProduct) {
    throw createValidationError('Product with this name already exists in this category')
  }

  const productCode = generateProductCode(name)

  const newProduct = await Product.create({
    name,
    description,
    price,
    discount,
    image,
    status,
    productCode,
    category: categoryId,
    categoryName: categoryExists.name
  })
  
  res.status(201).json({ 
    success: true,
    message: 'Product created successfully',
    data: calculatePricing(newProduct)
  })
})

export const getProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    search,
    category,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query as PaginationQuery

  const filter: any = {}
  // Search in product name and description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  // Filter by category
  if (category) {
    filter.category = category
  }

  // Filter by status
  if (status) {
    filter.status = status
  }

  const pageNum = page || 1
  const limitNum = limit || 10
  const skip = (pageNum - 1) * limitNum

  // Build sort object
  const sort: any = {}
  sort[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1

  const products = await Product.find(filter)
    .populate('category')
    .sort(sort)
    .limit(limitNum)
    .skip(skip)

  const productsWithPricing = products.map(product =>
    calculatePricing(product)
  )

  const totalProducts = await Product.countDocuments(filter)
  const totalPages = Math.ceil(totalProducts / limitNum)

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: productsWithPricing,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalProducts,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    },
    filters: { search, category, status },
    sort: { sortBy, sortOrder }
  })
})

export const getProductById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  const product = await Product.findById(id).populate('category')

  if (!product) {
    throw createNotFoundError('Product')
  }

  const productWithPricing = calculatePricing(product)

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: productWithPricing
  })
})

export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  let updateData: any = req.body as UpdateProductInput

  const existingProduct = await Product.findById(id)
  if (!existingProduct) {
    throw createNotFoundError('Product')
  }

  if (updateData.categoryId) {
    const categoryExists = await Category.findById(updateData.categoryId)
    if (!categoryExists) {
      throw createNotFoundError('Category')
    }
    updateData = {
      ...updateData,
      categoryName: categoryExists.name,
      category: updateData.categoryId
    }
  }


  updateData.updatedAt = new Date()

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('category')

  const updatedProductWithPricing = calculatePricing(updatedProduct)

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProductWithPricing
  })
})

export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  
  const deletedProduct = await Product.findByIdAndDelete(id)
  if (!deletedProduct) {
    throw createNotFoundError('Product')
  }
  
  res.status(200).json({ 
    success: true,
    message: 'Product deleted successfully' 
  })
})
