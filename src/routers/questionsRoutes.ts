import { Router } from 'express'
import {
  addQuestionToQuiz,
  deleteQuestionFromQuiz,
  getQuestionById,
  getQuestionsByQuizId,
  updateQuestionInQuiz,
} from '../controllers/questionsController'
import { requireAuth } from '../middleware/auth'
import { handleResponse } from '../utils/responseHandlers'
import {
  addQuestionValidation,
  updateQuestionValidation,
} from '../validation/questionsValidation'
import { runValidation } from '../validation/runValidation'

const router: Router = Router()

router.post('/add', requireAuth, addQuestionValidation, runValidation, addQuestionToQuiz)
router.delete('/:quizId/:questionId', requireAuth, deleteQuestionFromQuiz)
router.put(
  '/:questionId',
  requireAuth,
  updateQuestionValidation,
  runValidation,
  updateQuestionInQuiz
)
router.get('/question/:questionId', requireAuth, getQuestionById)
router.get('/quiz/:quizId', requireAuth, getQuestionsByQuizId)
router.get('*', (req, res) => {
  return handleResponse(res, 404, req.t('Errors.route_not_found'))
})

export default router
