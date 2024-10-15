import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { dev } from '../config'
import User from '../models/userSchema'
import { createHttpError } from '../utils/createHttpError'
import { CustomRequest, UserRole } from '../types/usersType'

// Middleware to set req.userId from the token
export const userId = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.access_token

    if (accessToken) {
      const decode = jwt.verify(accessToken, dev.app.jwtUserAccessKey) as JwtPayload
      if (!decode) {
        throw createHttpError(401, req.t('Auth.middleware.invalid_or_expired_token'))
      }
      req.userId = decode._id
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

// Middleware to check if user is logged in
export const isLoggedIn = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.access_token

    if (!accessToken) {
      throw createHttpError(401, req.t('Auth.middleware.not_logged_in'))
    }
    const decodedAccessToken = jwt.verify(accessToken, dev.app.jwtUserAccessKey) as JwtPayload
    if (!decodedAccessToken) {
      throw createHttpError(401, req.t('Auth.middleware.invalid_token'))
    }
    req.userId = decodedAccessToken._id
    next()
  } catch (error) {
    next(error)
  }
}

// Middleware to check if user is logged out
export const isLoggedOut = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.access_token

    if (accessToken) {
      throw createHttpError(401, req.t('Auth.middleware.already_logged_in'))
    }
    next()
  } catch (error) {
    next(error)
  }
}

// Middleware to allow admin-only access
export const adminOnly = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== UserRole.Admin) {
      throw createHttpError(403, req.t('Auth.middleware.admin_only'))
    }
    next()
  } catch (error) {
    next(error)
  }
}

// Middleware to check if user account is active
export const isActive = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Auth.middleware.login_required'))
    }

    const user = await User.findById(userId)

    if (!user) {
      throw createHttpError(404, req.t('Auth.middleware.user_not_found'))
    }

    if (!user.active) {
      throw createHttpError(403, req.t('Auth.middleware.account_inactive'))
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Clear the access token in a middleware before checking logged-out status
export const clearPreviousLoginCookie = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (req.cookies.access_token) {
      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}
