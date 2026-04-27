import mongoose, { Schema } from 'mongoose'
import { IUser } from '../types/usersType'

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          return value.length >= 3 && value.length <= 30
        },
        message: 'Username must be between 3 and 30 characters.',
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      set: function (value: string) {
        if (value && value.trim() === '') {
          return undefined
        }
        return value
      },
      validate: {
        validator: function (value: string) {
          return !value || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
        },
        message: 'Please enter a valid email address.',
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, 'Password must be at least 6 characters.'],
    },
    active: {
      type: Boolean,
      default: false,
    },
    library: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
      default: [],
    },
    quizzes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  }
)

export default mongoose.model<IUser>('User', userSchema)
