import { Request, Response, NextFunction } from 'express'
import QuizModel from '../models/quizSchema'
import ScoreModel from '../models/scoreSchema'
import UserModel from '../models/userSchema'
import { createHttpError } from '../utils/createHttpError'
import { IQuestion } from '../types/questionsTypes'
import { CustomRequest, UserRole } from '../types/usersType'
import mongoose from 'mongoose'
import { IAnswer } from '../types/scoresTypes'

// Submit Quiz
export const submitQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId, answers } = req.body
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Score.not_logged_in'))
    }

    const user = await UserModel.findById(userId).populate('library')
    if (!user) {
      throw createHttpError(404, req.t('Score.user_not_found'))
    }

    if (user.role !== UserRole.User) {
      throw createHttpError(403, req.t('Score.user_only_submission'))
    }

    if (!user.library || user.library.length === 0) {
      throw createHttpError(403, req.t('Score.quiz_not_in_library'))
    }

    const quizInLibrary = user.library.some((quiz) => quiz._id.toString() === quizId)
    if (!quizInLibrary) {
      throw createHttpError(403, req.t('Score.quiz_not_in_library'))
    }

    const existingScore = await ScoreModel.findOne({ quiz: quizId, user: userId })
    if (existingScore) {
      throw createHttpError(403, req.t('Score.already_submitted'))
    }

    const quiz = await QuizModel.findById(quizId).populate('questions')
    if (!quiz) {
      throw createHttpError(404, req.t('Score.quiz_not_found'))
    }

    const questions = quiz.questions as unknown as IQuestion[]

    let correctAnswers = 0
    const detailedAnswers: IAnswer[] = []

    questions.forEach((question, index) => {
      const selectedOption = answers[index]
      const isCorrect = question.correctOption === selectedOption

      if (isCorrect) {
        correctAnswers++
      }

      detailedAnswers.push({
        question: question._id,
        selectedOption,
        isCorrect,
      })
    })

    const scoreValue = (correctAnswers / questions.length) * 100

    const newScoreRecord = new ScoreModel({
      quiz: quizId,
      user: userId,
      score: scoreValue,
      totalQuestions: questions.length,
      correctAnswers,
      answers: detailedAnswers,
    })

    await newScoreRecord.save()

    return res
      .status(200)
      .json({ message: req.t('Score.quiz_submitted_successfully'), score: newScoreRecord })
  } catch (error) {
    next(error)
  }
}

// Get Single Score
export const getSingleScore = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { scoreId } = req.params
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Score.not_logged_in'))
    }

    const score = await ScoreModel.findOne({ _id: scoreId, user: userId })
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions',
          model: 'Question',
          select: 'question options correctOption',
        },
      })
      .populate({
        path: 'answers.question',
        model: 'Question',
        select: 'question options correctOption',
      })

    if (!score) {
      return res.status(404).json({ message: req.t('Score.score_not_found') })
    }

    return res.status(200).json({ score })
  } catch (error) {
    next(error)
  }
}

// Get All Scores for a User
export const getAllScores = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ message: req.t('Score.not_logged_in') })
    }

    const scores = await ScoreModel.find({ user: userId })
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions',
          model: 'Question',
          select: 'question options correctOption',
        },
      })
      .populate({
        path: 'answers.question',
        model: 'Question',
        select: 'question options correctOption',
      })

    if (!scores.length) {
      return res.status(404).json({ message: req.t('Score.no_scores_found') })
    }

    return res.status(200).json({ scores })
  } catch (error) {
    return res.status(500).json({ message: req.t('Score.server_error') })
  }
}

// Delete Score
export const deleteScore = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { scoreId } = req.body
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Score.not_logged_in'))
    }

    const scoreRecord = await ScoreModel.findById(scoreId).populate({
      path: 'quiz',
      model: QuizModel,
      select: 'user',
    })

    if (!scoreRecord) {
      throw createHttpError(404, req.t('Score.score_not_found'))
    }

    const quiz = scoreRecord.quiz as unknown as { user: mongoose.Types.ObjectId }

    if (quiz.user.toString() !== userId.toString()) {
      throw createHttpError(403, req.t('Score.only_quiz_owner_can_delete'))
    }

    await ScoreModel.deleteOne({ _id: scoreRecord._id })

    return res.status(200).json({ message: req.t('Score.score_deleted_successfully') })
  } catch (error) {
    next(error)
  }
}

// Get Scores for a User's Quizzes
export const getQuizScores = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Score.not_logged_in'))
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      throw createHttpError(404, req.t('Score.user_not_found'))
    }

    const quizzes = await QuizModel.find({ user: userId }).select('_id')
    const quizIds = quizzes.map((quiz) => quiz._id)

    if (!quizIds.length) {
      return res.status(404).json({ message: req.t('Score.no_owned_quizzes_found') })
    }

    const scores = await ScoreModel.find({ quiz: { $in: quizIds } })
      .populate({
        path: 'quiz',
        populate: {
          path: 'questions',
          model: 'Question',
          select: 'question options correctOption',
        },
      })
      .populate({
        path: 'answers.question',
        model: 'Question',
        select: 'question options correctOption',
      })
      .populate('user', 'username email')

    if (!scores.length) {
      return res.status(404).json({ message: req.t('Score.no_scores_found_for_owned_quizzes') })
    }

    return res.status(200).json({ scores })
  } catch (error) {
    next(error)
  }
}
