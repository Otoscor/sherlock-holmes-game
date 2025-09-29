import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import GameUI from '@/components/GameUI'
import { useGameState } from '@/hooks/useGameState'

const GamePage = () => {
  const navigate = useNavigate()
  const { storyId } = useParams<{ storyId: string }>()
  const caseId = storyId || 'red-study' // URL 파라미터에서 스토리 ID 가져오기, 기본값은 주홍색 연구
  const { gameState, initializeGame, processUserMessage, requestHint } = useGameState(caseId)

  useEffect(() => {
    initializeGame(caseId)
  }, [initializeGame])

  const handleSendMessage = async (message: string) => {
    await processUserMessage(message)
  }

  const handleBackToMenu = () => {
    navigate('/')
  }

  // 🆕 힌트 요청 핸들러
  const handleRequestHint = () => {
    requestHint()
  }

  // 스토리별 제목 매핑
  const getStoryTitle = (storyId: string) => {
    switch (storyId) {
      case 'red-study':
        return '주홍색 연구'
      case 'romeo-and-juliet':
        return '로미오와 줄리엣'
      default:
        return '문학 속 모험'
    }
  }

  return (
    <GameUI
      caseTitle={getStoryTitle(caseId)}
      messages={gameState.messages}
      onSendMessage={handleSendMessage}
      onBackToMenu={handleBackToMenu}
      onRequestHint={handleRequestHint}
      isInputDisabled={gameState.isInputDisabled}
      evidence={gameState.evidence}
      score={gameState.score}
      hintsUsed={gameState.hintsUsed}
      storyProgress={gameState.storyProgress}
    />
  )
}

export default GamePage