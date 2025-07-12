import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  image: { type: String, required: true, match: /^https?:\/\/.+$/ },
  status: {
    type: String,
    enum: ['In Stock', 'Stock Out'],
    default: 'In Stock'
  },
  productCode: { type: String, required: true, unique: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryName: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Product = mongoose.model('Product', productSchema)

export default Product
