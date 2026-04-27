import { Router } from 'express'
import {
  addQuestionToQuiz,
  deleteQuestionFromQuiz,
  getQuestionById,
  getQuestionsByQuizId,
  updateQuestionInQuiz,
} from '../controllers/questionsController'
import { requireAuth } from '../middleware/auth'

const router: Router = Router()

router.post('/add', requireAuth, addQuestionToQuiz)
router.delete('/:quizId/:questionId', requireAuth, deleteQuestionFromQuiz)
router.put('/:questionId', requireAuth, updateQuestionInQuiz)
router.get('/question/:questionId', requireAuth, getQuestionById)
router.get('/quiz/:quizId', requireAuth, getQuestionsByQuizId)
router.get('*', (req, res) => {
  return res.status(404).send('No questions routes found!')
})

export default router
