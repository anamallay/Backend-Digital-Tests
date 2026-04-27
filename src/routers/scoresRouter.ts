import { Router } from 'express'
import {
  deleteScore,
  getAllScores,
  getQuizScores,
  getSingleScore,
  submitQuiz,
} from '../controllers/scoresController'
import { requireAuth } from '../middleware/auth'
import { handleResponse } from '../utils/responseHandlers'

const router: Router = Router()
router.get('/examiner', requireAuth, getQuizScores)
router.get('/', requireAuth, getAllScores)
router.get('/:scoreId', requireAuth, getSingleScore)
router.post('/submit', requireAuth, submitQuiz)
router.delete('/delete-score', requireAuth, deleteScore)

router.get('*', (req, res) => {
  return handleResponse(res, 404, req.t('Errors.route_not_found'))
})
export default router
