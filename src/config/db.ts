import mongoose from 'mongoose'
import { dev } from '.'

export const connectDB = async () => {
  try {
    if (!dev.db.url) {
      throw new Error('Database URL not provided in environment variables')
    }

    await mongoose.connect(dev.db.url, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    })
    console.log('Database connected successfully')
  } catch (error) {
    console.error('MongoDB connection error: ', error)
    process.exit(1) // Exit process with failure
  }
}
