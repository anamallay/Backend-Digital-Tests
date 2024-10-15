import { Request } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/userSchema'
import { createHttpError } from '../utils/createHttpError'

// Service to verify user credentials
export const verifyUserData = async (req: Request) => {
  const { email, username, password } = req.body

  if (!password) {
    throw createHttpError(400, req.t('Auth.Service.password_required'))
  }

  if (!email && !username) {
    throw createHttpError(400, req.t('Auth.Service.email_or_username_required'))
  }

  let user
  if (email) {
    user = await User.findOne({ email })
    if (!user) {
      throw createHttpError(404, req.t('Auth.Service.invalid_email'))
    }
  } else if (username) {
    user = await User.findOne({ username })
    if (!user) {
      throw createHttpError(404, req.t('Auth.Service.invalid_username'))
    }
  }

  if (!user) {
    throw createHttpError(404, req.t('Auth.Service.invalid_credentials'))
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password)

  if (!isPasswordMatch) {
    throw createHttpError(401, req.t('Auth.Service.invalid_password'))
  }

  return user
}
