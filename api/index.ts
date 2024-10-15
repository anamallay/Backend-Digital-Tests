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
    origin: [
      'https://www.digitaltests.org',
      // 'https://frontend-digital-tests.vercel.app',
      // 'https://frontend-digital-tests-amals-projects-3e6df37a.vercel.app',
      // 'https://frontend-digital-tests-git-main-amals-projects-3e6df37a.vercel.app',
      // 'https://frontend-digital-tests-3819a7me4-amals-projects-3e6df37a.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

app.options('*', cors())

// app.use((req: Request, res: Response, next: NextFunction) => {
//   console.log('Request Origin:', req.headers.origin)
//   next()
// })

// app.use(
//   cors({
//     origin: 'http://localhost:5173', // Replace with your frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow methods as needed
//     credentials: true, // Allow cookies and credentials
//     optionsSuccessStatus: 200, // For legacy browsers support
//   })
// )

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cookieParser())

// Define routes
app.use('/api/users', usersRouter)
app.use('/api/auths', authsRouter)
app.use('/api/quizzes', quizzesRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/scores', scoresRoutes)

mongoose.set('debug', true)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
connectDB()

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = createHttpError(404, 'Route not found!')
  next(error)
})

app.use(errorHandler)
