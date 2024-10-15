import mongoose, { Schema } from 'mongoose'
import { IUser, UserRole } from '../types/usersType'

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          return !value || (value.length >= 3 && value.length <= 30)
        },
        message: 'يجب أن يحتوي اسم المستخدم على 3 أحرف على الأقل ولا يزيد عن 30 حرفًا',
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
        message: 'يرجى إدخال عنوان بريد إلكتروني صالح',
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, 'يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
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
  { timestamps: true }
)

// Pre-validate middleware to enforce presence of username or email
userSchema.pre('validate', function (next) {
  if (!this.username && !this.email) {
    this.invalidate('username', 'يجب توفير إما اسم المستخدم أو البريد الإلكتروني.')
    this.invalidate('email', 'يجب توفير إما اسم المستخدم أو البريد الإلكتروني.')
  }
  next()
})

export default mongoose.model<IUser>('User', userSchema)
