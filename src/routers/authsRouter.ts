import { Router } from 'express'
import { login, logout, forgetPassword, resetPassword } from '../controllers/authController'
import { clearPreviousLoginCookie, isLoggedOut, requireAuth } from '../middleware/auth'
import { loginLimiter, forgetPasswordLimiter } from '../middleware/rateLimiters'
import { handleResponse } from '../utils/responseHandlers'

const router = Router()

router.post('/login', loginLimiter, clearPreviousLoginCookie, isLoggedOut, login)
router.post('/logout', requireAuth, logout)
router.post('/forget-password', forgetPasswordLimiter, forgetPassword)
router.put('/reset-password', resetPassword)

router.get('*', (req, res) => {
  return handleResponse(res, 404, req.t('Errors.route_not_found'))
})

export default router
