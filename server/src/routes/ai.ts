import { Router, Request, Response } from 'express'
import { AIService } from '../services/aiService'

const router = Router()
const aiService = new AIService()

interface ChatRequest {
  message: string
  storyId?: string
  playerCharacter?: string
  conversationHistory?: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
}

// AI 채팅 엔드포인트
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, storyId, playerCharacter, conversationHistory = [] }: ChatRequest = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: '메시지가 필요합니다.'
      })
    }

    // 스토리 컨텍스트 설정
    if (storyId) {
      aiService.setStoryContext(storyId, playerCharacter)
    }

    // AI 응답 생성
    const response = await aiService.generateResponse(message, conversationHistory)

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI 채팅 오류:', error)
    res.status(500).json({
      error: 'AI 응답 생성 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// AI 서비스 상태 확인
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = aiService.getConnectionStatus()
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI 상태 확인 오류:', error)
    res.status(500).json({
      error: 'AI 서비스 상태 확인 중 오류가 발생했습니다.'
    })
  }
})

// AI 연결 테스트
router.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const isConnected = await aiService.checkConnection()
    const status = aiService.getConnectionStatus()
    
    res.json({
      success: true,
      data: {
        isConnected,
        ...status
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI 연결 테스트 오류:', error)
    res.status(500).json({
      error: 'AI 연결 테스트 중 오류가 발생했습니다.'
    })
  }
})

export { router as aiRouter }

