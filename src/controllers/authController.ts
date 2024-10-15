import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { verifyUserData } from '../services/authService'
import { CustomRequest } from '../types/usersType'
import { createHttpError } from '../utils/createHttpError'
import { handleResponse } from '../utils/responseHandlers'
import User from '../models/userSchema'
import { handleSendEmail } from '../helper/sendEmail'
import { dev } from '../config'

// Login
export const login = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await verifyUserData(req)

    const accessToken = jwt.sign({ _id: user._id }, dev.app.jwtUserAccessKey)

    res.cookie('access_token', accessToken, {
      expires: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })

    handleResponse(res, 200, req.t('Auth.login_success'), user)
  } catch (error) {
    next(error)
  }
}

// Logout
export const logout = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })
    handleResponse(res, 200, req.t('Auth.logout_success'))
  } catch (error) {
    next(error)
  }
}

// Forget Password
export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    if (!email) {
      throw createHttpError(400, req.t('Auth.email_required'))
    }

    const user = await User.findOne({ email })

    if (!user) {
      throw createHttpError(409, req.t('Auth.user_not_found_register'))
    }

    if (!user.active) {
      throw createHttpError(403, req.t('Auth.user_inactive'))
    }

    const token = jwt.sign({ email }, dev.app.jwtresetPassword, { expiresIn: '20m' })

    const lang = ['ar', 'en'].includes(req.language) ? req.language : 'en'
    const templateFile = lang === 'ar' ? 'forgetEmailTemplate_ar.ejs' : 'forgetEmailTemplate_en.ejs'

    const frontendUrl = dev.app.frontendUrl

    const emailTemplate = await new Promise<string>((resolve, reject) => {
      res.render(templateFile, { name: user.name, token, frontendUrl }, (err, html) => {
        if (err) {
          return reject(err)
        }
        resolve(html)
      })
    })

    const emailData = {
      email,
      subject: req.t('Auth.reset_password_subject'),
      html: emailTemplate,
    }

    await handleSendEmail(emailData)

    handleResponse(res, 200, req.t('Auth.check_email_reset_password'))
  } catch (error) {
    next(error)
  }
}

// Reset Password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body

    if (!password || password.length < 6) {
      throw createHttpError(400, req.t('Auth.password_length'))
    }

    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, dev.app.jwtresetPassword) as JwtPayload
    } catch (err) {
      throw createHttpError(400, req.t('Auth.invalid_or_expired_token'))
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = await User.findOneAndUpdate(
      { email: decoded.email },
      { $set: { password: hashedPassword } },
      { new: true }
    )

    if (!updatedUser) {
      throw createHttpError(400, req.t('Auth.invalid_token_or_user_not_found'))
    }

    const lang = ['ar', 'en'].includes(req.language) ? req.language : 'en'

    const templateFile =
      lang === 'ar' ? 'resetPasswordSuccess_ar.ejs' : 'resetPasswordSuccess_en.ejs'

    const frontendUrl = dev.app.frontendUrl

    const emailTemplate = await new Promise<string>((resolve, reject) => {
      res.render(templateFile, { name: updatedUser.name, frontendUrl }, (err, html) => {
        if (err) {
          return reject(err)
        }
        resolve(html)
      })
    })

    const emailData = {
      email: updatedUser.email,
      subject: req.t('Auth.password_reset_success'),
      html: emailTemplate,
    }

    await handleSendEmail(emailData)

    handleResponse(res, 200, req.t('Auth.password_reset_success'))
  } catch (error) {
    next(error)
  }
}
