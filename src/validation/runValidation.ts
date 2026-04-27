import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

// Express-validator chain → contract envelope.
//
// On failure: HTTP 400 with `{ message, errors: [{ field, message }, ...] }`.
// `message` is the first error (so simple consumers that just read `message`
// keep working); `errors` lists every field-level failure for forms that
// want to render per-field hints.

export const runValidation = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const result = validationResult(req)
  if (result.isEmpty()) return next()

  const all = result.array()
  return res.status(400).json({
    message: all[0].msg,
    errors: all.map((e) => ({
      // express-validator v7: FieldValidationError has `path`; other variants
      // (alternative / unknown_fields) don't. Fall back to `type` so the
      // client always gets something non-empty.
      field: 'path' in e ? e.path : e.type,
      message: e.msg,
    })),
  })
}
