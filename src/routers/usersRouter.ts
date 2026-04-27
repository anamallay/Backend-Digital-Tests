import { Router } from 'express'
import {
  activateAccount,
  deleteAccount,
  getPublicUserById,
  getUserById,
  listPublicUsers,
  registerUser,
  resendActivationEmail,
  updateUser,
} from '../controllers/usersController'
import { clearPreviousLoginCookie, isLoggedOut, requireAuth } from '../middleware/auth'
import { registerValidation, updateValidation } from '../validation/usersValidation'
import { runValidation } from '../validation/runValidation'
import { registerLimiter, resendActivationLimiter } from '../middleware/rateLimiters'

const router = Router()

router.get('/public', listPublicUsers)
router.get('/public/:id', getPublicUserById)

router.post(
  '/register',
  registerLimiter,
  clearPreviousLoginCookie,
  isLoggedOut,
  registerValidation,
  runValidation,
  registerUser
)
router.get('/activate', activateAccount)
router.post('/resend-activation-email', resendActivationLimiter, resendActivationEmail)
router.get('/user', requireAuth, getUserById)
router.put('/update-user', requireAuth, updateValidation, runValidation, updateUser)

router.delete('/delete-account', requireAuth, deleteAccount)

router.get('*', (req, res) => {
  return res.status(404).send('No users routes found!')
})

export default router
