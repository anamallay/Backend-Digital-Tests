import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { verifyUserData } from '../services/authService'
import { CustomRequest } from '../types/usersType'
import { createHttpError } from '../utils/createHttpError'
import { handleResponse } from '../utils/responseHandlers'
import User from '../models/userSchema'
// EMAIL_DISABLED: Uncomment when a real email provider is configured
// import { handleSendEmail } from '../helper/sendEmail'
import { dev } from '../config'

// Login
export const login = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await verifyUserData(req)

    const accessToken = jwt.sign({ _id: user._id }, dev.app.jwtUserAccessKey, {
      expiresIn: '7d',
    })

    res.cookie('access_token', accessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: dev.app.isProd ? 'none' : 'lax',
      secure: dev.app.isProd,
    })

    // Token is also returned in the body so cross-domain SPA deployments
    // (frontend on a different *.vercel.app subdomain than the API) can
    // store it client-side and send it as `Authorization: Bearer …`. Some
    // browsers refuse to retain SameSite=None cookies across PSL siblings.
    res
      .status(200)
      .send({ message: req.t('Auth.login_success'), data: user, token: accessToken })
  } catch (error) {
    next(error)
  }
}

// Logout
export const logout = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: dev.app.isProd ? 'none' : 'lax',
      secure: dev.app.isProd,
    })
    handleResponse(res, 200, req.t('Auth.logout_success'))
  } catch (error) {
    next(error)
  }
}

// Forget Password
export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // EMAIL_DISABLED: password-reset emails cannot be sent without an email
    // provider. Returns a friendly disabled message. Uncomment the original
    // logic when a real email provider is configured.
    return handleResponse(res, 200, req.t('Auth.email_features_disabled'))

    // EMAIL_DISABLED: Uncomment when a real email provider is configured
    // const { email } = req.body
    // if (!email) {
    //   throw createHttpError(400, req.t('Auth.email_required'))
    // }
    //
    // // Anti-enumeration: a non-existent or inactive email returns the same
    // // 200 + message as the success path. Only actually send the email when
    // // the account exists and is active. (Emailless accounts are likewise
    // // unfindable here — `findOne({ email })` won't match a user whose
    // // email field is unset, which falls through to the same 200 response.
    // // If this endpoint is ever extended to look up by username too, surface
    // // `Auth.no_email_on_file` when the matched user has no email.)
    // const user = await User.findOne({ email })
    //
    // if (user && user.active) {
    //   const token = jwt.sign({ email }, dev.app.jwtresetPassword, { expiresIn: '1h' })
    //
    //   const lang = ['ar', 'en'].includes(req.language) ? req.language : 'en'
    //   const templateFile =
    //     lang === 'ar' ? 'forgetEmailTemplate_ar.ejs' : 'forgetEmailTemplate_en.ejs'
    //
    //   const frontendUrl = dev.app.frontendUrl
    //
    //   const emailTemplate = await new Promise<string>((resolve, reject) => {
    //     res.render(templateFile, { name: user.name, token, frontendUrl }, (err, html) => {
    //       if (err) {
    //         return reject(err)
    //       }
    //       resolve(html)
    //     })
    //   })
    //
    //   const emailData = {
    //     email,
    //     subject: req.t('Auth.reset_password_subject'),
    //     html: emailTemplate,
    //   }
    //
    //   await handleSendEmail(emailData)
    // }
    //
    // handleResponse(res, 200, req.t('Auth.check_email_reset_password'))
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

    const hashedPassword = await bcrypt.hash(password, dev.app.bcryptCost)

    const updatedUser = await User.findOneAndUpdate(
      { email: decoded.email },
      { $set: { password: hashedPassword } },
      { new: true }
    )

    if (!updatedUser) {
      throw createHttpError(400, req.t('Auth.invalid_token_or_user_not_found'))
    }

    // EMAIL_DISABLED: Uncomment when a real email provider is configured
    // const lang = ['ar', 'en'].includes(req.language) ? req.language : 'en'
    //
    // const templateFile =
    //   lang === 'ar' ? 'resetPasswordSuccess_ar.ejs' : 'resetPasswordSuccess_en.ejs'
    //
    // const frontendUrl = dev.app.frontendUrl
    //
    // const emailTemplate = await new Promise<string>((resolve, reject) => {
    //   res.render(templateFile, { name: updatedUser.name, frontendUrl }, (err, html) => {
    //     if (err) {
    //       return reject(err)
    //     }
    //     resolve(html)
    //   })
    // })
    //
    // const emailData = {
    //   email: updatedUser.email,
    //   subject: req.t('Auth.password_reset_success'),
    //   html: emailTemplate,
    // }
    //
    // await handleSendEmail(emailData)

    handleResponse(res, 200, req.t('Auth.password_reset_success'))
  } catch (error) {
    next(error)
  }
}
