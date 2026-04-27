import { Request, Response, NextFunction } from 'express'
import QuizModel from '../models/quizSchema'
import UserModel from '../models/userSchema'
import ScoreModel from '../models/scoreSchema'
import QuestionModel from '../models/questionSchema'
import { handleResponse } from '../utils/responseHandlers'
import { createHttpError } from '../utils/createHttpError'
import { CustomRequest } from '../types/usersType'
import mongoose from 'mongoose'

// Create Quiz
export const createQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, time, visibility = 'private' } = req.body
    const userId = req.userId

    if (!title) {
      throw createHttpError(400, req.t('Quiz.title_required'))
    }

    if (!description) {
      throw createHttpError(400, req.t('Quiz.description_required'))
    }

    if (!time || typeof time !== 'number' || time <= 0) {
      throw createHttpError(400, req.t('Quiz.time_required'))
    }

    if (visibility !== 'public' && visibility !== 'private') {
      throw createHttpError(400, req.t('Quiz.invalid_visibility'))
    }

    const newQuiz = new QuizModel({
      title,
      description,
      time,
      questions: [],
      user: userId,
      visibility,
    })

    await newQuiz.save()

    const user = await UserModel.findById(userId)
    if (!user) {
      throw createHttpError(404, req.t('Quiz.user_not_found'))
    }

    if (!user.quizzes) {
      user.quizzes = []
    }

    user.quizzes.push(newQuiz._id)
    await user.save()

    handleResponse(res, 201, req.t('Quiz.quiz_created_successfully'), newQuiz)
  } catch (error) {
    next(error)
  }
}

// Get All Public Quizzes
export const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const skip = (page - 1) * limit

    const publicQuizzes = await QuizModel.find({ visibility: 'public' })
      .populate('questions')
      .populate('user', 'name username email')
      .skip(skip)
      .limit(limit)

    const totalQuizzes = await QuizModel.countDocuments({ visibility: 'public' })
    const totalPages = Math.ceil(totalQuizzes / limit)

    const response = {
      totalQuizzes,
      totalPages,
      currentPage: page,
      quizzes: publicQuizzes,
    }

    handleResponse(res, 200, req.t('Quiz.public_quizzes_retrieved_successfully'), response)
  } catch (error) {
    next(error)
  }
}

// Get Quiz by ID
export const getQuizById = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const quiz = await QuizModel.findById(req.params.id)
      .populate('questions')
      .populate('user', 'name username email')
      .lean()

    if (!quiz) {
      return handleResponse(res, 404, req.t('Quiz.quiz_not_found'))
    }

    const isOwner = req.userId === quiz.user._id.toString()

    if (!isOwner && quiz.visibility === 'private') {
      return handleResponse(res, 403, req.t('Quiz.not_authorized_to_access'))
    }

    quiz.questionCount = quiz.questions.length

    const response = {
      ...quiz,
      visibilityMessage: isOwner
        ? req.t('Quiz.quiz_visibility_message', { visibility: quiz.visibility })
        : undefined,
      description: quiz.description,
      time: quiz.time,
    }

    handleResponse(res, 200, req.t('Quiz.quiz_retrieved_successfully'), response)
  } catch (error) {
    next(error)
  }
}

// Get User Quizzes
export const getUserQuizzes = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Quiz.login_required'))
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, req.t('Quiz.invalid_user_id'))
    }

    const userQuizzes = await QuizModel.find({ user: userId })
      .populate('questions')
      .populate('user', 'name username email')

    handleResponse(res, 200, req.t('Quiz.user_quizzes_retrieved_successfully'), userQuizzes)
  } catch (error) {
    next(error)
  }
}

// Update Quiz
export const updateQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, time, visibility, questions } = req.body
    const quizId = req.params.id
    const userId = req.userId

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw createHttpError(400, req.t('Quiz.invalid_quiz_id'))
    }

    const quiz = await QuizModel.findById(quizId)

    if (!quiz) {
      return res.status(404).json({ message: req.t('Quiz.quiz_not_found') })
    }

    if (quiz.user.toString() !== userId) {
      return res.status(403).json({ message: req.t('Quiz.not_authorized_to_update') })
    }

    if (title) quiz.title = title
    if (description) quiz.description = description
    if (time && typeof time === 'number') quiz.time = time
    if (visibility === 'public' || visibility === 'private') quiz.visibility = visibility
    if (questions && Array.isArray(questions)) quiz.questions = questions

    await quiz.save()

    res.status(200).json({ message: req.t('Quiz.quiz_updated_successfully'), quiz })
  } catch (error) {
    next(error)
  }
}

// Delete Quiz
export const deleteQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const quizId = req.params.id
    const userId = req.userId

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw createHttpError(400, req.t('Quiz.invalid_quiz_id'))
    }

    const quiz = await QuizModel.findById(quizId)

    if (!quiz) {
      return handleResponse(res, 404, req.t('Quiz.quiz_not_found'))
    }

    if (quiz.user.toString() !== userId) {
      return handleResponse(res, 403, req.t('Quiz.not_authorized_to_delete'))
    }

    await QuestionModel.deleteMany({ _id: { $in: quiz.questions } })

    await ScoreModel.deleteMany({ quiz: quizId })

    await QuizModel.deleteOne({ _id: quizId })

    await UserModel.updateMany(
      { $or: [{ quizzes: quizId }, { library: quizId }] },
      { $pull: { quizzes: quizId, library: quizId } }
    )

    handleResponse(res, 200, req.t('Quiz.quiz_deleted_successfully'))
  } catch (error) {
    next(error)
  }
}

// Toggle Quiz Visibility
export const toggleQuizVisibility = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizId = req.params.id
    const userId = req.userId

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw createHttpError(400, req.t('Quiz.invalid_quiz_id'))
    }

    const quiz = await QuizModel.findById(quizId)

    if (!quiz) {
      return handleResponse(res, 404, req.t('Quiz.quiz_not_found'))
    }

    if (quiz.user.toString() !== userId) {
      return handleResponse(res, 403, req.t('Quiz.not_authorized_to_toggle_visibility'))
    }

    quiz.visibility = quiz.visibility === 'private' ? 'public' : 'private'

    await quiz.save()

    handleResponse(res, 200, req.t('Quiz.visibility_toggled_successfully'), {
      visibility: quiz.visibility,
    })
  } catch (error) {
    next(error)
  }
}
