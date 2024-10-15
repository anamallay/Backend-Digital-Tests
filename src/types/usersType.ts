import { Document, Types } from 'mongoose'
import { Request } from 'express'

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  username: string
  password: string
  role: UserRole
  active: boolean
  library: Types.ObjectId[]
  quizzes: Types.ObjectId[]
}

// Define a type for the JWT payload
export type UserTokenPayload = {
  userId(userId: any): unknown
  name: string
  email: string
  password: string
}

export interface CustomRequest extends Request {
  user?: any
  cookies: any
  userId?: string
}
