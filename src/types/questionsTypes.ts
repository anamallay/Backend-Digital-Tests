import { Types } from 'mongoose'

export interface IQuestion extends Document {
  _id: Types.ObjectId
  question: string
  options: string[]
  correctOption: number
  quiz: Types.ObjectId
}
