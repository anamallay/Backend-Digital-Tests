import { Types } from 'mongoose'

export interface IQuiz extends Document {
  _id: Types.ObjectId
  title: string
  description: string
  time: number
  questions: Types.ObjectId[]
  user: Types.ObjectId
  visibility: 'public' | 'private'
  questionCount?: number
}
