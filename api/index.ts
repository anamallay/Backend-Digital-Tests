import express, { Application, Request, Response, NextFunction } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { connectDB } from '../src/config/db'
import { dev } from '../src/config'
import { createHttpError } from '../src/utils/createHttpError'
import { errorHandler } from '../src/middleware/errorHandler'
import path from 'path'
import i18next from '../src/utils/i18n'
import { handle } from 'i18next-http-middleware'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
// routers
import usersRouter from '../src/routers/usersRouter'
import authsRouter from '../src/routers/authsRouter'
import quizzesRoutes from '../src/routers/quizzesRoutes'
import questionsRoutes from '../src/routers/questionsRoutes'
import scoresRoutes from '../src/routers/scoresRouter'

const app: Application = express()
const port: number = dev.app.port

app.use(handle(i18next))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'src', 'views'))

app.use(
  cors({
    origin: dev.app.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

app.options('*', cors())

// Body-size cap. The largest legitimate payload in this API is ~2KB
// (createQuiz with description, addQuestionToQuiz with options); 100KB
// gives 50× headroom while making body-flood DoS uneconomic. Exceeding
// the limit raises a PayloadTooLargeError with status 413, mapped to a
// clean i18n'd response by errorHandler.
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))
app.use(morgan(dev.app.isProd ? 'combined' : 'dev'))
app.use(cookieParser())

// Define routes
app.use('/api/users', usersRouter)
app.use('/api/auths', authsRouter)
app.use('/api/quizzes', quizzesRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/scores', scoresRoutes)

mongoose.set('debug', !dev.app.isProd)

connectDB()

app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = createHttpError(404, 'Route not found!')
  next(error)
})

app.use(errorHandler)

// Local dev: bind a port. On Vercel the platform sets VERCEL=1 and invokes
// the default-exported handler directly, so listen() would just waste a port.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

export default app
