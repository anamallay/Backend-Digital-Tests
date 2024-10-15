// import { rateLimit } from 'express-rate-limit'
import { Router } from 'express'
import { login, logout, forgetPassword, resetPassword } from '../controllers/authController'
import { clearPreviousLoginCookie, isLoggedIn, isLoggedOut, userId } from '../middleware/auth'

const router = Router()

// Define the rate limiter middleware
// const limiter = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   max: 7, // Limit each IP to 7 requests per `window` (here, per 5 minutes)
//   message: 'لقد وصلت إلى الحد الأقصى لعدد الطلبات، يرجى المحاولة مرة أخرى بعد 5 دقائق',
// })

// Login route
router.post('/login', clearPreviousLoginCookie, isLoggedOut, login)
router.post('/logout', isLoggedIn, logout)
router.post('/forget-password', forgetPassword)
router.put('/reset-password', resetPassword)

router.get('*', (req, res) => {
  return res.status(404).send('No auths routes found')
})

export default router
