import { check, body } from 'express-validator'

export const registerValidation = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.name_missing'))
    .isLength({ min: 2, max: 50 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.name_length')),

  check('username')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ min: 3, max: 30 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_length'))
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_format')),

  check('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.invalid_email'))
    .normalizeEmail(),

  check('password')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.password_missing'))
    .isLength({ min: 6, max: 50 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.password_length')),

  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.username) {
      throw new Error(req.t('Validation.RegisterValidation.email_or_username_required'))
    }
    return true
  }),
]
