import { check } from 'express-validator'
import mongoose from 'mongoose'

// Length / range bounds shared by create + update so a single edit moves
// both. Adjust here only.
const TITLE_MIN = 3
const TITLE_MAX = 100
const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 1000
const TIME_MIN = 1
const TIME_MAX = 600 // minutes — 10h upper bound

// POST /api/quizzes/create — body holds the new quiz fields. The controller
// hardcodes `questions: []` and ignores any `questions` value in the body,
// so we don't validate it here.
export const createQuizValidation = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.title_required'))
    .isLength({ min: TITLE_MIN, max: TITLE_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.title_length')),

  check('description')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.description_required'))
    .isLength({ min: DESCRIPTION_MIN, max: DESCRIPTION_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.description_length')),

  check('time')
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.time_required'))
    .bail()
    .toInt()
    .isInt({ min: TIME_MIN, max: TIME_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.time_range')),

  check('visibility')
    .optional({ checkFalsy: true })
    .isIn(['public', 'private'])
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.invalid_visibility')),
]

// PUT /api/quizzes/:id — every field optional. Per-field rules mirror the
// create chain so a supplied value is held to the same bar.
export const updateQuizValidation = [
  check('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: TITLE_MIN, max: TITLE_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.title_length')),

  check('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: DESCRIPTION_MIN, max: DESCRIPTION_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.description_length')),

  check('time')
    .optional({ checkFalsy: true })
    .toInt()
    .isInt({ min: TIME_MIN, max: TIME_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.time_range')),

  check('visibility')
    .optional({ checkFalsy: true })
    .isIn(['public', 'private'])
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.invalid_visibility')),

  check('questions')
    .optional()
    .isArray()
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.questions_must_be_array')),

  check('questions.*')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage((_, { req }) => req.t('Validation.QuizValidation.questions_must_be_objectids')),
]
