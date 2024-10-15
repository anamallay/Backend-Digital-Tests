import { Router } from 'express'
import {
  activateAccount,
  deleteAccount,
  getUserById,
  registerUser,
  resendActivationEmail,
  updateUser,
} from '../controllers/usersController'
import { clearPreviousLoginCookie, isLoggedIn, isLoggedOut, userId } from '../middleware/auth'
import { registerValidation } from '../validation/usersValidation'
import { runValidation } from '../validation/runValidation'

const router = Router()

router.post(
  '/register',
  clearPreviousLoginCookie,
  isLoggedOut,
  registerValidation,
  runValidation,
  registerUser
)
router.get('/activate', activateAccount)
router.post('/resend-activation-email', resendActivationEmail)
router.get('/user', isLoggedIn, userId, getUserById)
router.put('/update-user', isLoggedIn, userId, updateUser)

router.delete('/delete-account', isLoggedIn, userId, deleteAccount)

router.get('*', (req, res) => {
  return res.status(404).send('No users routes found!')
})

export default router
