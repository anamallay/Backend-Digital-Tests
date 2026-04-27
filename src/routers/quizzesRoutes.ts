import { Router } from 'express'
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  getUserQuizzes,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quizzesController'
import { requireAuth } from '../middleware/auth'
import {
  addPublicQuizToLibrary,
  addQuizToLibraryUsingToken,
  getQuizFromLibrary,
  getUserLibrary,
  removeQuizFromLibrary,
  shareQuizWithUser,
} from '../controllers/librariesController'
import { handleResponse } from '../utils/responseHandlers'
import {
  createQuizValidation,
  updateQuizValidation,
} from '../validation/quizzesValidation'
import { runValidation } from '../validation/runValidation'

const router: Router = Router()
router.get('/library', requireAuth, getUserLibrary)

router.post('/create', requireAuth, createQuizValidation, runValidation, createQuiz)
router.get('/public', getQuizzes)
router.get('/userQuiz', requireAuth, getUserQuizzes)
router.get('/:id', requireAuth, getQuizById)
router.put('/:id', requireAuth, updateQuizValidation, runValidation, updateQuiz)
router.delete('/:id', requireAuth, deleteQuiz)

router.get('/library/:quizId', requireAuth, getQuizFromLibrary)
router.delete('/library/:quizId', requireAuth, removeQuizFromLibrary)
router.post('/share-quiz', requireAuth, shareQuizWithUser)
router.post('/add-to-library', requireAuth, addQuizToLibraryUsingToken)
router.post('/library/add-public-quiz', requireAuth, addPublicQuizToLibrary)

router.get('*', (req, res) => {
  return handleResponse(res, 404, req.t('Errors.route_not_found'))
})

export default router
