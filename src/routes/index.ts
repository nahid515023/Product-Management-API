import { Router } from 'express'
import categoryRouter from './category'
import productRouter from './product'
import healthRouter from './health'

const rootRouter: Router = Router()

rootRouter.use('/category', categoryRouter)
rootRouter.use('/product', productRouter)
rootRouter.use('/health', healthRouter)

export default rootRouter
