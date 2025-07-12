import express from 'express'
import { config } from './config/index'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rootRouter from './routes/index'
import connectDB from './utils/connectDB'
import { 
  errorHandler, 
  notFoundHandler, 
  setupGlobalErrorHandlers 
} from './middleware/errorHandler'

const app = express()


setupGlobalErrorHandlers()

app.use(helmet())
app.use(cors())


app.use(morgan('combined'))

app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

app.use('/', rootRouter)


app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.PORT, () => {
  connectDB()
  console.log(`Server running on port ${config.PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
