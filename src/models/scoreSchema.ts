// models/scoreSchema.ts
import mongoose, { Schema } from 'mongoose'
import { IScore } from '../types/scoresTypes'

const scoreSchema = new Schema<IScore>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    answers: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOption: {
          type: Number,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
)

// Hot-path support:
//   { user: 1 }              — getAllScores, deleteAccount cascade by submitter
//   { quiz: 1, user: 1 }     — submitQuiz duplicate-check; left-prefix also serves
//                              quiz-only queries (getQuizScores, deleteAccount cascade
//                              by quizIds), so a standalone { quiz: 1 } is redundant.
//   `unique: true` on the compound enforces "one score per user per quiz" at the
//   DB level — closes the race window between findOne() and save() in submitQuiz.
//   E11000 violations are mapped to 409 by errorHandler.
scoreSchema.index({ user: 1 })
scoreSchema.index({ quiz: 1, user: 1 }, { unique: true })

export default mongoose.model<IScore>('Score', scoreSchema)
