import { Router } from 'express'

const router = Router()

// 서버 상태 확인 엔드포인트
router.get('/', (req, res) => {
  const uptime = process.uptime()
  const timestamp = new Date().toISOString()
  
  res.json({
    status: 'healthy',
    timestamp,
    uptime: `${Math.floor(uptime / 60)}분 ${Math.floor(uptime % 60)}초`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// 상세 상태 확인
router.get('/detailed', (req, res) => {
  const memUsage = process.memoryUsage()
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    },
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

export { router as healthRouter }

