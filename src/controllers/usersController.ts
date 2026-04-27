import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import userSchema from '../models/userSchema'
import quizSchema from '../models/quizSchema'
import questionSchema from '../models/questionSchema'
import scoreSchema from '../models/scoreSchema'
import bcrypt from 'bcrypt'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { handleResponse } from '../utils/responseHandlers'
import { dev } from '../config'
// EMAIL_DISABLED: Uncomment when a real email provider is configured
// import { handleSendEmail } from '../helper/sendEmail'
import { CustomRequest, UserTokenPayload } from '../types/usersType'

// Register User
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, password } = req.body
    const email = req.body.email.trim().toLowerCase()

    const existingUserByUsername = await userSchema.findOne({ username })
    if (existingUserByUsername) {
      return handleResponse(res, 409, req.t('User.username_exists'))
    }

    const existingUserByEmail = await userSchema.findOne({ email })
    if (existingUserByEmail) {
      return handleResponse(res, 409, req.t('User.email_exists'))
    }

    const hashedPassword = await bcrypt.hash(password, dev.app.bcryptCost)

    const newUser = new userSchema({
      name,
      username,
      email,
      password: hashedPassword,
      // EMAIL_DISABLED: Uncomment when a real email provider is configured
      // active: false,
      active: true,
    })

    await newUser.save()

    // EMAIL_DISABLED: Uncomment when a real email provider is configured
    // const token = jwt.sign({ userId: newUser._id }, dev.app.jwtUserActivationKey, {
    //   expiresIn: '24h',
    // })
    //
    // const lang = req.language || 'en'
    //
    // const templateFile =
    //   lang === 'ar' ? 'activationEmailTemplate_ar.ejs' : 'activationEmailTemplate_en.ejs'
    // const frontendUrl = dev.app.frontendUrl
    //
    // const emailTemplate = await new Promise<string>((resolve, reject) => {
    //   res.render(templateFile, { name, token, frontendUrl }, (err, html) => {
    //     if (err) {
    //       return reject(err)
    //     }
    //     resolve(html)
    //   })
    // })
    //
    // const emailData = {
    //   email,
    //   subject: req.t('User.account_activation_subject'),
    //   html: emailTemplate,
    // }
    //
    // await handleSendEmail(emailData)
    //
    // return handleResponse(res, 201, req.t('User.registration_success_email'), newUser)

    return handleResponse(res, 201, req.t('User.registration_success_no_email'), newUser)
  } catch (error) {
    next(error)
  }
}

// Activate Account
export const activateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // EMAIL_DISABLED: accounts are activated automatically at registration, so
    // the activation route is a friendly no-op. Uncomment when a real email
    // provider is configured.
    return handleResponse(res, 200, req.t('User.email_features_disabled'))

    // EMAIL_DISABLED: Uncomment when a real email provider is configured
    // const token = req.query.token as string
    //
    // if (!token) {
    //   return handleResponse(res, 400, req.t('User.activation_token_required'))
    // }
    //
    // const decoded = jwt.verify(token, dev.app.jwtUserActivationKey) as { userId: string }
    //
    // const user = await userSchema.findById(decoded.userId)
    // if (!user) {
    //   return handleResponse(res, 404, req.t('User.user_not_found'))
    // }
    //
    // if (user.active) {
    //   return handleResponse(res, 409, req.t('User.account_already_active'))
    // }
    //
    // user.active = true
    // await user.save()
    //
    // const lang = ['ar', 'en'].includes(req.language) ? req.language : 'en'
    //
    // const templateFile = lang === 'ar' ? 'activationSuccess_ar.ejs' : 'activationSuccess_en.ejs'
    //
    // const frontendUrl = dev.app.frontendUrl
    //
    // const emailTemplate = await new Promise<string>((resolve, reject) => {
    //   res.render(templateFile, { name: user.name, frontendUrl }, (err, html) => {
    //     if (err) {
    //       return reject(err)
    //     }
    //     resolve(html)
    //   })
    // })
    //
    // const emailData = {
    //   email: user.email,
    //   subject: req.t('User.account_activation_success_subject'),
    //   html: emailTemplate,
    // }
    //
    // await handleSendEmail(emailData)
    //
    // return handleResponse(res, 200, req.t('User.account_activated_successfully'), user)
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
      const errorMessage =
        error instanceof TokenExpiredError
          ? req.t('User.token_expired')
          : req.t('User.token_invalid')
      return handleResponse(res, 400, errorMessage)
    } else {
      next(error)
    }
  }
}

// Resend Activation Email
export const resendActivationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // EMAIL_DISABLED: accounts are activated automatically at registration, so
    // there's nothing to resend. Returns a friendly disabled message instead
    // of attempting to send. Uncomment the original logic when a real email
    // provider is configured.
    return handleResponse(res, 200, req.t('User.email_features_disabled'))

    // EMAIL_DISABLED: Uncomment when a real email provider is configured
    // const { email } = req.body
    //
    // const user = await userSchema.findOne({ email })
    // if (!user) {
    //   return handleResponse(res, 404, req.t('User.user_not_found_with_email'))
    // }
    //
    // if (user.active) {
    //   return handleResponse(res, 409, req.t('User.account_already_active'))
    // }
    //
    // const token = jwt.sign({ userId: user._id }, dev.app.jwtUserActivationKey, {
    //   expiresIn: '24h',
    // })
    //
    // const lang = req.language || 'en'
    //
    // const templateFile =
    //   lang === 'ar' ? 'activationEmailTemplate_ar.ejs' : 'activationEmailTemplate_en.ejs'
    //
    // const frontendUrl = dev.app.frontendUrl
    //
    // const emailTemplate = await new Promise<string>((resolve, reject) => {
    //   res.render(templateFile, { name: user.name, token, frontendUrl }, (err, html) => {
    //     if (err) {
    //       return reject(err)
    //     }
    //     resolve(html)
    //   })
    // })
    //
    // const emailData = {
    //   email: user.email,
    //   subject: req.t('User.account_activation_subject'),
    //   html: emailTemplate,
    // }
    //
    // await handleSendEmail(emailData)
    //
    // return handleResponse(res, 200, req.t('User.resend_activation_email_success'))
  } catch (error) {
    next(error)
  }
}

// Get User by ID
export const getUserById = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // TODO API_CONTRACT.md §6.10: populate library/quizzes refs once v2 quiz endpoints land.
    const user = await userSchema.findById(req.userId)

    if (!user) {
      return handleResponse(res, 404, req.t('User.user_not_found'))
    }

    return handleResponse(res, 200, req.t('User.user_retrieved_successfully'), user)
  } catch (error) {
    next(error)
  }
}

// Update User
export const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { name, username, email } = req.body

    const user = await userSchema.findById(req.userId)
    if (!user) {
      return handleResponse(res, 404, req.t('User.user_not_found'))
    }

    if (name) user.name = name

    if (username) {
      const existingUserByUsername = await userSchema.findOne({ username })
      if (existingUserByUsername && existingUserByUsername._id.toString() !== req.userId) {
        return handleResponse(res, 409, req.t('User.username_exists'))
      }
      user.username = username
    }

    if (email && email !== user.email) {
      const existingUserByEmail = await userSchema.findOne({ email })
      if (existingUserByEmail && existingUserByEmail._id.toString() !== req.userId) {
        return handleResponse(res, 409, req.t('User.email_exists'))
      }
      user.email = email
      // EMAIL_DISABLED: with email features off, do not deactivate on email
      // change (the user would have no way to re-activate). Re-enable both the
      // deactivation and the re-verification email below when a real email
      // provider is configured.
      // user.active = false
      //
      // const token = jwt.sign({ userId: user._id }, dev.app.jwtUserActivationKey, {
      //   expiresIn: '1h',
      // })
      //
      // const lang = ['ar', 'en'].includes(req.language) ? req.language : 'en'
      // const templateFile =
      //   lang === 'ar' ? 'activationEmailTemplate_ar.ejs' : 'activationEmailTemplate_en.ejs'
      //
      // const frontendUrl = dev.app.frontendUrl
      //
      // const emailTemplate = await new Promise<string>((resolve, reject) => {
      //   res.render(templateFile, { name: user.name, token, frontendUrl }, (err, html) => {
      //     if (err) {
      //       return reject(err)
      //     }
      //     resolve(html)
      //   })
      // })
      //
      // const emailData = {
      //   email: user.email,
      //   subject: req.t('User.account_activation_subject'),
      //   html: emailTemplate,
      // }
      //
      // try {
      //   await handleSendEmail(emailData)
      // } catch (error) {
      //   return handleResponse(res, 500, req.t('User.email_sending_failed'))
      // }
    }

    await user.save()

    return handleResponse(res, 200, req.t('User.user_updated_successfully'), user)
  } catch (error) {
    next(error)
  }
}

// Delete Account
export const deleteAccount = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId

    const userQuizzes = await quizSchema.find({ user: userId })
    const quizIds = userQuizzes.map((quiz) => quiz._id)

    await questionSchema.deleteMany({ quiz: { $in: quizIds } })
    await scoreSchema.deleteMany({ quiz: { $in: quizIds } })
    await quizSchema.deleteMany({ user: userId })
    await scoreSchema.deleteMany({ user: userId })

    const user = await userSchema.findByIdAndDelete(userId)
    if (!user) {
      return handleResponse(res, 404, req.t('User.user_not_found'))
    }

    // EMAIL_DISABLED: Uncomment when a real email provider is configured
    // const lang = req.language || 'en'
    // const templateFile = lang === 'ar' ? 'DeleteAccount_ar.ejs' : 'DeleteAccount_en.ejs'
    //
    // const emailTemplate = await new Promise<string>((resolve, reject) => {
    //   res.render(templateFile, { name: user.name }, (err, html) => {
    //     if (err) {
    //       return reject(err)
    //     }
    //     resolve(html)
    //   })
    // })
    //
    // const emailData = {
    //   email: user.email,
    //   subject: req.t('User.goodbye_subject'),
    //   html: emailTemplate,
    // }
    //
    // await handleSendEmail(emailData)

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: dev.app.isProd,
    })

    return res.status(200).json({ message: req.t('User.account_deleted_successfully') })
  } catch (error) {
    next(error)
  }
}

// List Public Users
export const listPublicUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userSchema.find()
    // One aggregation gives the per-author public-quiz count, so the list
    // endpoint stays O(1) DB calls regardless of user count.
    const counts = await quizSchema.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { visibility: 'public' } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ])
    const countByUserId = new Map(counts.map((c) => [String(c._id), c.count]))
    const publicUsers = users.map((u) => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      library: [],
      quizzes: [],
      publicQuizzesCount: countByUserId.get(String(u._id)) ?? 0,
    }))
    return res.status(200).json({ data: publicUsers })
  } catch (error) {
    next(error)
  }
}

// Get Public User by ID
export const getPublicUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, req.t('User.invalid_user_id'))
    }
    const user = await userSchema.findById(id)
    if (!user) {
      return handleResponse(res, 404, req.t('User.user_not_found'))
    }
    const publicQuizzes = await quizSchema
      .find({ user: id, visibility: 'public' })
      .populate('questions')
      .populate('user', 'name username')
    const publicUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      library: [],
      quizzes: [],
      publicQuizzesCount: publicQuizzes.length,
    }
    return res.status(200).json({ data: { user: publicUser, publicQuizzes } })
  } catch (error) {
    next(error)
  }
}
