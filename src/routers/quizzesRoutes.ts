import { Router } from 'express'
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  getUserQuizzes,
  updateQuiz,
  deleteQuiz,
  // toggleQuizVisibility,
} from '../controllers/quizzesController'
import { isLoggedIn, userId } from '../middleware/auth'
import {
  addPublicQuizToLibrary,
  addQuizToLibraryUsingToken,
  getQuizFromLibrary,
  getUserLibrary,
  removeQuizFromLibrary,
  shareQuizWithUser,
} from '../controllers/librariesController'

const router: Router = Router()
router.get('/library', isLoggedIn, userId, getUserLibrary)

router.post('/create', isLoggedIn, userId, createQuiz)
router.get('/public', getQuizzes)
router.get('/userQuiz', isLoggedIn, userId, getUserQuizzes)
router.get('/:id', isLoggedIn, userId, getQuizById)
router.put('/:id', isLoggedIn, userId, updateQuiz)
router.delete('/:id', isLoggedIn, userId, deleteQuiz)
// router.patch('/:id/toggle-visibility', isLoggedIn, userId, toggleQuizVisibility)

router.get('/library/:quizId', isLoggedIn, userId, getQuizFromLibrary)
router.delete('/library/:quizId', isLoggedIn, userId, removeQuizFromLibrary)
router.post('/share-quiz', isLoggedIn, shareQuizWithUser)
router.post('/add-to-library', isLoggedIn, userId, addQuizToLibraryUsingToken)
router.post('/library/add-public-quiz', isLoggedIn, userId, addPublicQuizToLibrary)

router.get('*', (req, res) => {
  return res.status(404).send('No quizzes routes found!')
})

export default router
