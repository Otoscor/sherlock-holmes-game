import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { aiRouter } from './routes/ai'
import { healthRouter } from './routes/health'
import { errorHandler } from './middleware/errorHandler'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 보안 미들웨어
app.use(helmet())
app.use(compression())

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: {
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
})
app.use(limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 라우트 설정
app.use('/api/health', healthRouter)
app.use('/api/ai', aiRouter)

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청하신 리소스를 찾을 수 없습니다.',
    path: req.originalUrl
  })
})

// 에러 핸들러
app.use(errorHandler)

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`)
})

export default app

