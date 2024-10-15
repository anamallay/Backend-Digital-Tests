import { Router } from 'express'
import {
  addQuestionToQuiz,
  deleteQuestionFromQuiz,
  getQuestionById,
  getQuestionsByQuizId,
  updateQuestionInQuiz,
} from '../controllers/questionsController'
import { isLoggedIn, userId } from '../middleware/auth'

const router: Router = Router()

router.post('/add', isLoggedIn, userId, addQuestionToQuiz)
router.delete('/:quizId/:questionId', isLoggedIn, userId, deleteQuestionFromQuiz)
router.put('/:questionId', isLoggedIn, userId, updateQuestionInQuiz)
router.get('/question/:questionId', isLoggedIn, userId, getQuestionById)
router.get('/quiz/:quizId', isLoggedIn, userId, getQuestionsByQuizId)
router.get('*', (req, res) => {
  return res.status(404).send('No questions routes found!')
})

export default router
