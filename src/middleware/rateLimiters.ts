import rateLimit from 'express-rate-limit'
import type { Request, Response } from 'express'

// Shared 429 responder. Uses req.t() so the message respects Accept-Language,
// and returns the standard `{ message }` envelope so the frontend's readError()
// picks it up like any other error.
const tooManyRequestsHandler = (req: Request, res: Response) => {
  res.status(429).json({
    message: req.t('Auth.middleware.too_many_requests'),
  })
}

// Brute-force guard on credential check. Successful logins don't count
// toward the budget — a typo on attempt 5 followed by a correct password
// on attempt 6 should not lock a legitimate user out.
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: tooManyRequestsHandler,
})

// Registration spam guard.
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooManyRequestsHandler,
})

// Email-spam guard for password reset. Keyed by the email address being
// requested (the *victim*), not by IP — otherwise an attacker behind one
// IP could pummel many victims, or many attackers behind separate IPs
// could pummel a single victim. Falls back to IP if email is missing
// (malformed body).
export const forgetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 1,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) =>
    (typeof req.body?.email === 'string' && req.body.email.toLowerCase()) ||
    req.ip ||
    'unknown',
  handler: tooManyRequestsHandler,
})

// Same threat model as forget-password — keyed by email.
export const resendActivationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 1,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) =>
    (typeof req.body?.email === 'string' && req.body.email.toLowerCase()) ||
    req.ip ||
    'unknown',
  handler: tooManyRequestsHandler,
})
