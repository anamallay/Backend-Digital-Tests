import { check } from 'express-validator'
import mongoose from 'mongoose'

const QUESTION_MIN = 5
const QUESTION_MAX = 500
const OPTION_MIN = 1
const OPTION_MAX = 200
const OPTIONS_COUNT_MIN = 2
const OPTIONS_COUNT_MAX = 6

// POST /api/questions/add — `quizId` is in the body (not a URL param).
export const addQuestionValidation = [
  check('quizId')
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.quiz_id_required'))
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.invalid_quiz_id')),

  check('question')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.question_required'))
    .isLength({ min: QUESTION_MIN, max: QUESTION_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.question_length')),

  check('options')
    .exists({ checkNull: true })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.options_required'))
    .bail()
    .isArray({ min: OPTIONS_COUNT_MIN, max: OPTIONS_COUNT_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.options_count')),

  check('options.*')
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.option_text_required'))
    .isLength({ min: OPTION_MIN, max: OPTION_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.option_text_required')),

  check('correctOption')
    // `correctOption: 0` is valid — `notEmpty()` would reject it because 0
    // is falsy. Use `exists({ checkNull: true })` instead so 0 passes.
    .exists({ checkNull: true })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.correct_option_required'))
    .bail()
    .toInt()
    .isInt({ min: 0 })
    .withMessage((_, { req }) =>
      req.t('Validation.QuestionValidation.correct_option_must_be_integer')
    )
    // Cross-field check: must point at a real option in the array.
    .custom((value, { req }) => {
      const opts = req.body?.options
      if (!Array.isArray(opts)) return true // earlier rule already errored
      return value < opts.length
    })
    .withMessage((_, { req }) =>
      req.t('Validation.QuestionValidation.correct_option_out_of_range')
    ),
]

// PUT /api/questions/:questionId — every field optional. The cross-field
// `correctOption < options.length` check on update is deferred to the
// mongoose schema validator (questionSchema) since the body may carry
// only `correctOption` without `options`. Schema's ValidationError maps
// to HTTP 400 via errorHandler.
export const updateQuestionValidation = [
  check('question')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: QUESTION_MIN, max: QUESTION_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.question_length')),

  check('options')
    .optional()
    .isArray({ min: OPTIONS_COUNT_MIN, max: OPTIONS_COUNT_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.options_count')),

  check('options.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.option_text_required'))
    .isLength({ min: OPTION_MIN, max: OPTION_MAX })
    .withMessage((_, { req }) => req.t('Validation.QuestionValidation.option_text_required')),

  check('correctOption')
    .optional({ checkFalsy: false }) // 0 is a real value — don't treat as absent
    .toInt()
    .isInt({ min: 0 })
    .withMessage((_, { req }) =>
      req.t('Validation.QuestionValidation.correct_option_must_be_integer')
    ),
]
