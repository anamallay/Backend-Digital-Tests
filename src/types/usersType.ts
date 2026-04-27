import { Document, Types } from 'mongoose'
import { Request } from 'express'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  username: string
  password: string
  active: boolean
  library: Types.ObjectId[]
  quizzes: Types.ObjectId[]
}

// JWT access-token payload. Activation and reset tokens have their own shapes.
export type UserTokenPayload = {
  _id: string
  iat?: number
  exp?: number
}

export interface CustomRequest extends Request {
  user?: any
  cookies: any
  userId?: string
}
