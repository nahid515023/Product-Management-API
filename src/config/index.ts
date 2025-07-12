import dotenv from 'dotenv'
dotenv.config()

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database',
  JWT_SECRET: process.env.JWT_SECRET || 'HiMyNameIsNahid'
}
