import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import GameUI from '@/components/GameUI'
import { useGameState } from '@/hooks/useGameState'

const GamePage = () => {
  const navigate = useNavigate()
  const caseId = 'red-study' // 항상 주홍색 연구로 고정
  const { gameState, initializeGame, processUserMessage, requestHint } = useGameState(caseId) // 🆕 requestHint 추가

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

  return (
    <GameUI
      caseTitle="주홍색 연구"
      messages={gameState.messages}
      onSendMessage={handleSendMessage}
      onBackToMenu={handleBackToMenu}
      onRequestHint={handleRequestHint} // 🆕 힌트 요청 함수 전달
      isInputDisabled={gameState.isInputDisabled}
      evidence={gameState.evidence}
      score={gameState.score}
      hintsUsed={gameState.hintsUsed}
      storyProgress={gameState.storyProgress}
    />
  )
}

export default GamePage