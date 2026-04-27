import { Request, Response, NextFunction } from 'express'
import QuizModel from '../models/quizSchema'
import UserModel from '../models/userSchema'
import { handleResponse } from '../utils/responseHandlers'
import { createHttpError } from '../utils/createHttpError'
import { CustomRequest } from '../types/usersType'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { dev } from '../config'
import { QuizShareTokenPayload } from '../types/sharesTypes'

// Shared populate config for the user's library. Every endpoint that
// returns a library array must use this so the frontend slice never
// sees an under-populated payload (e.g. ObjectId-only refs vs full
// QuizType objects). `getUserLibrary` plus all 4 mutations route
// through this.
const populateLibraryConfig = {
  path: 'library',
  populate: [{ path: 'user', select: 'name email' }],
}

// After a library write, refetch the user with the canonical populate so
// the response carries the same shape `getUserLibrary` would return.
async function fetchPopulatedLibrary(userId: mongoose.Types.ObjectId | string) {
  const user = await UserModel.findById(userId).populate(populateLibraryConfig)
  return user?.library ?? []
}

// Get User Library
export const getUserLibrary = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Library.user_id_required'))
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, req.t('Library.invalid_user_id_format'))
    }

    const user = await UserModel.findById(userId).populate(populateLibraryConfig)

    if (!user) {
      throw createHttpError(404, req.t('Library.user_not_found'))
    }

    user.library = user.library ?? []

    handleResponse(res, 200, req.t('Library.library_retrieved_successfully'), user.library)
  } catch (error) {
    next(error)
  }
}

// Remove Quiz from Library
export const removeQuizFromLibrary = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.params
    const userId = req.userId

    const user = await UserModel.findById(userId)

    if (!user) {
      return handleResponse(res, 404, req.t('Library.user_not_found'))
    }

    user.library = user.library ?? []

    const updatedLibrary = user.library.filter((userQuiz) => userQuiz.toString() !== quizId)

    if (updatedLibrary.length === user.library.length) {
      return handleResponse(res, 404, req.t('Library.quiz_not_found_in_library'))
    }

    user.library = updatedLibrary
    await user.save()

    const populatedLibrary = await fetchPopulatedLibrary(userId!)
    return handleResponse(
      res,
      200,
      req.t('Library.quiz_removed_successfully'),
      populatedLibrary
    )
  } catch (error) {
    next(error)
  }
}

// Share Quiz with User
export const shareQuizWithUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.body
    const userId = req.userId

    if (!quizId) {
      throw createHttpError(400, req.t('Library.quiz_id_required'))
    }

    const quiz = await QuizModel.findOne({ _id: quizId, user: userId })
    if (!quiz) {
      throw createHttpError(404, req.t('Library.quiz_not_found_or_unauthorized'))
    }

    const token = jwt.sign(
      { quizId: quiz._id, sharedByUserId: userId },
      dev.app.jwtQuizSecretKey,
      { expiresIn: '7d' }
    )

    const quizLink = `${dev.app.frontendUrl}/dashboard/add-quiz-via-token/${token}`

    handleResponse(res, 200, req.t('Library.quiz_link_generated_successfully'), { quizLink })
  } catch (error) {
    next(error)
  }
}

// Add Quiz to Library Using Token
export const addQuizToLibraryUsingToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body

    if (!token) {
      throw createHttpError(400, req.t('Library.token_required'))
    }

    const decodedToken = jwt.verify(
      token,
      dev.app.jwtQuizSecretKey
    ) as QuizShareTokenPayload
    const { quizId } = decodedToken

    const currentUserId = req.userId

    const user = await UserModel.findById(currentUserId)

    if (!user) {
      throw createHttpError(404, req.t('Library.user_not_found'))
    }

    const result = await UserModel.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { library: quizId } },
      { new: true }
    )

    if (!result) {
      return handleResponse(res, 400, req.t('Library.quiz_already_in_library'))
    }

    const populatedLibrary = await fetchPopulatedLibrary(currentUserId!)
    handleResponse(
      res,
      200,
      req.t('Library.quiz_added_successfully'),
      populatedLibrary
    )
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return handleResponse(res, 401, req.t('Library.invalid_or_expired_token'))
    }
    next(error)
  }
}

// Add Public Quiz to Library
export const addPublicQuizToLibrary = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.body
    const userId = req.userId

    if (!quizId) {
      throw createHttpError(400, req.t('Library.quiz_id_required'))
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      throw createHttpError(404, req.t('Library.user_not_found'))
    }

    const quiz = await QuizModel.findById(quizId)
    if (!quiz || quiz.visibility !== 'public') {
      throw createHttpError(404, req.t('Library.quiz_not_found_or_not_public'))
    }

    const result = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { library: quizId } },
      { new: true }
    )

    if (!result) {
      return handleResponse(res, 400, req.t('Library.quiz_already_in_library'))
    }

    const populatedLibrary = await fetchPopulatedLibrary(userId!)
    handleResponse(
      res,
      200,
      req.t('Library.public_quiz_added_successfully'),
      populatedLibrary
    )
  } catch (error) {
    next(error)
  }
}

// Get Quiz from Library
export const getQuizFromLibrary = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params
    const userId = req.userId

    if (!userId) {
      throw createHttpError(401, req.t('Library.user_id_required'))
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw createHttpError(400, req.t('Library.invalid_quiz_id_format'))
    }

    const user = await UserModel.findById(userId).populate({
      path: 'library',
      match: { _id: quizId },
      populate: {
        path: 'questions',
        model: 'Question',
        select: 'question options correctOption',
      },
    })
    if (!user) {
      throw createHttpError(404, req.t('Library.user_not_found'))
    }

    const quiz = (user.library ?? []).find((quiz) => quiz._id.toString() === quizId)

    if (!quiz) {
      return handleResponse(res, 404, req.t('Library.quiz_not_found_in_library'))
    }

    return handleResponse(res, 200, req.t('Library.quiz_retrieved_successfully'), quiz)
  } catch (error) {
    next(error)
  }
}
