import mongoose, { ObjectId } from 'mongoose'
import { IUser } from './usersType'

export interface IAnswer {
  question: mongoose.Types.ObjectId
  selectedOption: number
  isCorrect: boolean
}

export interface IScore extends Document {
  _id: ObjectId
  quiz: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId | IUser
  score: number
  totalQuestions: number
  correctAnswers: number
  answers: IAnswer[]
  createdAt: Date
  updatedAt: Date
}
