import { Router } from 'express'
import {
  deleteScore,
  getAllScores,
  getQuizScores,
  getSingleScore,
  submitQuiz,
} from '../controllers/scoresController'
import { isLoggedIn, userId } from '../middleware/auth'

const router: Router = Router()
router.get('/examiner', isLoggedIn, getQuizScores)
router.get('/', isLoggedIn, userId, getAllScores)
router.get('/:scoreId', isLoggedIn, userId, getSingleScore)
router.post('/submit', isLoggedIn, userId, submitQuiz)
router.delete('/delete-score', isLoggedIn, userId, deleteScore)

router.get('*', (req, res) => {
  return res.status(404).send('No score routes found!')
})
export default router
