import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { dev } from '../config'
import User from '../models/userSchema'
import { createHttpError } from '../utils/createHttpError'
import { CustomRequest } from '../types/usersType'

// Unified auth guard. Reads the JWT from either an `Authorization: Bearer …`
// header or the httpOnly `access_token` cookie, loads the user, rejects
// inactive accounts (403), and attaches both `req.user` and `req.userId` for
// downstream handlers. Any failure is a 401 except for the inactive-account
// case.
//
// The header path exists for cross-domain SPA deployments where the browser
// won't retain SameSite=None cookies across PSL siblings (e.g. two different
// *.vercel.app subdomains). The cookie path is preferred for same-site
// setups since it's not exfiltratable by XSS.
export const requireAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const accessToken = bearerToken || req.cookies.access_token
    if (!accessToken) {
      throw createHttpError(401, req.t('Auth.middleware.not_logged_in'))
    }

    let decoded: JwtPayload
    try {
      decoded = jwt.verify(accessToken, dev.app.jwtUserAccessKey) as JwtPayload
    } catch (e) {
      throw createHttpError(401, req.t('Auth.middleware.invalid_token'))
    }

    const user = await User.findById(decoded._id)
    if (!user) {
      throw createHttpError(401, req.t('Auth.middleware.not_logged_in'))
    }

    if (!user.active) {
      throw createHttpError(403, req.t('Auth.middleware.account_inactive'))
    }

    req.user = user
    req.userId = user._id.toString()
    return next()
  } catch (error) {
    return next(error)
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
        sameSite: dev.app.isProd ? 'none' : 'lax',
        secure: dev.app.isProd,
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}
