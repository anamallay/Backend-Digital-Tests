import { Request, Response, NextFunction } from 'express'
import mongoose, { ObjectId, Types } from 'mongoose'
import QuizModel from '../models/quizSchema'
import QuestionModel from '../models/questionSchema'
import { handleResponse } from '../utils/responseHandlers'
import { createHttpError } from '../utils/createHttpError'
import { CustomRequest } from '../types/usersType'

// Get Questions by Quiz ID
export const getQuestionsByQuizId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params

    if (!quizId) {
      throw createHttpError(400, req.t('Question.quiz_id_required'))
    }

    const quiz = await QuizModel.findById(quizId).populate('questions')

    if (!quiz) {
      return handleResponse(res, 404, req.t('Question.quiz_not_found'))
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return handleResponse(res, 201, req.t('Question.no_questions_found'))
    }

    handleResponse(res, 200, req.t('Question.questions_found'), quiz.questions)
  } catch (error) {
    next(error)
  }
}

// Add Question to Quiz
export const addQuestionToQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId, question, options, correctOption } = req.body
    const userId = req.userId

    if (!quizId || !question || !options || correctOption === undefined) {
      throw createHttpError(400, req.t('Question.required_fields_missing'))
    }

    const quiz = await QuizModel.findById(quizId)
    if (!quiz) {
      return handleResponse(res, 404, req.t('Question.quiz_not_found'))
    }

    if (quiz.user.toString() !== userId) {
      return handleResponse(res, 403, req.t('Question.not_authorized_to_add'))
    }

    const newQuestion = new QuestionModel({
      _id: new Types.ObjectId(),
      question,
      options,
      correctOption,
      quiz: quiz._id,
    })

    const savedQuestion = await newQuestion.save()

    quiz.questions.push(savedQuestion._id)
    await quiz.save()

    handleResponse(res, 200, req.t('Question.question_added_successfully'), savedQuestion)
  } catch (error) {
    next(error)
  }
}

// Delete Question from Quiz
export const deleteQuestionFromQuiz = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId, questionId } = req.params
    const userId = req.userId

    if (!quizId || !questionId) {
      throw createHttpError(400, req.t('Question.quiz_and_question_id_required'))
    }

    const quiz = await QuizModel.findById(quizId)
    if (!quiz) {
      return handleResponse(res, 404, req.t('Question.quiz_not_found'))
    }

    if (quiz.user.toString() !== userId) {
      return handleResponse(res, 403, req.t('Question.not_authorized_to_delete'))
    }

    const questionObjectId = new mongoose.Types.ObjectId(questionId)
    const questionIndex = quiz.questions.indexOf(questionObjectId)

    if (questionIndex === -1) {
      return handleResponse(res, 404, req.t('Question.question_not_found_in_quiz'))
    }

    await QuestionModel.findByIdAndDelete(questionObjectId)
    quiz.questions.splice(questionIndex, 1)
    await quiz.save()

    handleResponse(res, 200, req.t('Question.question_deleted_successfully'))
  } catch (error) {
    next(error)
  }
}

// Update Question in Quiz
export const updateQuestionInQuiz = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { questionId } = req.params
    const { question, options, correctOption } = req.body
    const userId = req.userId

    const questionData = await QuestionModel.findById(questionId).populate('quiz')
    if (!questionData) {
      return handleResponse(res, 404, req.t('Question.question_not_found'))
    }

    const quiz = questionData.quiz as unknown as { user: ObjectId }
    if (!quiz || quiz.user.toString() !== userId) {
      return handleResponse(res, 403, req.t('Question.not_authorized_to_update'))
    }

    if (question) questionData.question = question
    if (options && Array.isArray(options)) questionData.options = options
    if (correctOption !== undefined) questionData.correctOption = correctOption

    await questionData.save()

    handleResponse(res, 200, req.t('Question.question_updated_successfully'), questionData)
  } catch (error) {
    next(error)
  }
}

// Get Question by ID
export const getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { questionId } = req.params

    if (!questionId) {
      throw createHttpError(400, req.t('Question.question_id_required'))
    }

    const question = await QuestionModel.findById(questionId).populate('quiz')

    if (!question) {
      return handleResponse(res, 404, req.t('Question.question_not_found'))
    }

    handleResponse(res, 200, req.t('Question.question_found'), question)
  } catch (error) {
    next(error)
  }
}
