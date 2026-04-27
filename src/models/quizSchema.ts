import mongoose, { Schema } from 'mongoose'
import { IQuiz } from '../types/quizzesTypes'

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, 'يجب أن يكون للامتحان عنوان'],
    },
    description: {
      type: String,
      required: [true, 'يجب أن يكون للامتحان وصف'],
    },
    time: {
      type: Number,
      required: [true, 'يجب أن يتم تحديد مدة الامتحان'],
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: [true, 'يجب توفير الأسئلة'],
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
  },
  { timestamps: true }
)

// Hot-path support:
//   { user: 1 }       — getUserQuizzes, deleteAccount cascade, aggregate $match by author
//   { visibility: 1 } — getQuizzes (public list), listPublicUsers aggregate
quizSchema.index({ user: 1 })
quizSchema.index({ visibility: 1 })

export default mongoose.model<IQuiz>('Quiz', quizSchema)
