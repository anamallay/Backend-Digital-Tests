import { check } from 'express-validator'

export const registerValidation = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.name_missing'))
    .isLength({ min: 2, max: 50 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.name_length')),

  check('username')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_missing'))
    .isLength({ min: 3, max: 30 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_length'))
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_format')),

  check('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.invalid_email'))
    .normalizeEmail(),

  check('password')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.password_missing'))
    .isLength({ min: 6, max: 50 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.password_length')),
]

// PUT /api/users/update-user — every field is optional. Per-field rules
// mirror registerValidation so a supplied value is held to the same bar.
export const updateValidation = [
  check('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.name_length')),

  check('username')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_length'))
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.username_format')),

  check('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage((_, { req }) => req.t('Validation.RegisterValidation.invalid_email'))
    .normalizeEmail(),
]
