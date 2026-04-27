import { Router } from 'express'
import {
  deleteScore,
  getAllScores,
  getQuizScores,
  getSingleScore,
  submitQuiz,
} from '../controllers/scoresController'
import { requireAuth } from '../middleware/auth'

const router: Router = Router()
router.get('/examiner', requireAuth, getQuizScores)
router.get('/', requireAuth, getAllScores)
router.get('/:scoreId', requireAuth, getSingleScore)
router.post('/submit', requireAuth, submitQuiz)
router.delete('/delete-score', requireAuth, deleteScore)

router.get('*', (req, res) => {
  return res.status(404).send('No score routes found!')
})
export default router
