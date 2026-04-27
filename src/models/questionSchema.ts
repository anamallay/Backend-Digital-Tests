import mongoose, { Document, Schema } from 'mongoose'
import { IQuestion } from '../types/questionsTypes'

const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: [true, 'يجب أن يكون للسؤال محتوى'],
    },
    options: {
      type: [String],
      required: [true, 'يجب توفير خيارات الإجابة'],
      validate: {
        validator: function (value: string[]) {
          return value.length >= 2
        },
        message: 'يجب أن يكون هناك خياران على الأقل',
      },
    },
    correctOption: {
      type: Number,
      required: [true, 'يجب تحديد الخيار الصحيح'],
      validate: {
        validator: function (value: number) {
          return value >= 0 && value < this.options.length
        },
        message: 'الخيار الصحيح يجب أن يكون ضمن النطاق الصحيح',
      },
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IQuestion>('Question', questionSchema)
