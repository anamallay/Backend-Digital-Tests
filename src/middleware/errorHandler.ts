import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { AppError } from '../types/errorsTypes'
import { dev } from '../config'

// Centralized error responder. Shape is `{ message, errors? }` per
// contract §2.2. Mongoose-thrown errors are translated to HTTP-shaped
// envelopes before falling through to the AppError default path.

type ErrorWithDetails = AppError & {
  errors?: Array<{ field: string; message: string }>
}

type MongoServerError = Error & {
  code?: number
  keyValue?: Record<string, unknown>
}

type BodyParserError = Error & {
  type?: string
  status?: number
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // ─── Mongoose translations ─────────────────────────────────────────

  // Invalid ObjectId (or other coercion failure on a typed schema field).
  // Reaches us when a controller passes raw `req.params.id` / `req.body.foo`
  // to `findById()` without validating the format first.
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: req.t('Errors.invalid_id'),
      errors: [{ field: error.path, message: req.t('Errors.invalid_id') }],
    })
  }

  // Schema-level validation rejected the document. Each entry in
  // `error.errors` corresponds to a field with its own validator message.
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((e) => ({
      field: 'path' in e ? e.path : 'unknown',
      message: e.message,
    }))
    return res.status(400).json({
      message: errors[0]?.message || req.t('Errors.validation_failed'),
      errors,
    })
  }

  // MongoDB duplicate-key (E11000). Happens when a unique index rejects an
  // insert/update — typically a race between two concurrent registers using
  // the same email/username (the controller's `findOne` check doesn't lock).
  // `keyValue` is shaped `{ fieldName: value }`; we surface both via i18n
  // interpolation so the user sees which field collided.
  const mongoErr = error as MongoServerError
  if (mongoErr?.code === 11000 && mongoErr.keyValue) {
    const entry = Object.entries(mongoErr.keyValue)[0]
    const field = entry?.[0] ?? ''
    const value = entry?.[1] !== undefined ? String(entry[1]) : ''
    const message = req.t('Errors.duplicate_value', { field, value })
    return res.status(409).json({
      message,
      errors: [{ field, message }],
    })
  }

  // body-parser PayloadTooLargeError when a request exceeds the size cap
  // configured in api/index.ts (express.json / express.urlencoded). Surface
  // a translated 413 instead of the raw "request entity too large" string.
  const bodyErr = error as BodyParserError
  if (bodyErr?.type === 'entity.too.large') {
    return res.status(413).json({
      message: req.t('Errors.payload_too_large'),
    })
  }

  // ─── Default path: AppError-shaped throw ──────────────────────────

  const appError = error as ErrorWithDetails
  const status = appError.status || 500

  if (status >= 500 && !dev.app.isProd) {
    // eslint-disable-next-line no-console
    console.error('[errorHandler] unhandled', error)
  }

  const body: { message: string; errors?: ErrorWithDetails['errors'] } = {
    message: appError.message || 'Server error',
  }
  if (appError.errors !== undefined) body.errors = appError.errors

  return res.status(status).json(body)
}
