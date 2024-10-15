import 'dotenv/config'

export const dev = {
  app: {
    port: Number(process.env.PORT) || 3002,
    smtpUsername: process.env.SMTP_USERNAME || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    jwtUserActivationKey: process.env.JWT_USER_ACTIVATION_KEY || '',
    jwtUserAccessKey: process.env.JWT_USER_ACCESS_KEY || '',
    jwtresetPassword: process.env.JWT_RESET_PASSWORD_KEY || '',
    jwtQuizSecretKey: process.env.JWT_QUIZ_SECRET_KEY || '',
    frontendUrl: process.env.FRONTEND_URL || '',
  },
  db: {
    url: process.env.MONGODB_URL,
  },
}
