import React, { useEffect, useRef, useState } from 'react'
import ChatMessage, { ChatMessageProps } from './ChatMessage'
import ChatInput from './ChatInput'
import { ServerStatus } from './ServerStatus'

export interface GameUIProps {
  caseTitle: string
  messages: ChatMessageProps[]
  onSendMessage: (message: string) => void
  onBackToMenu: () => void
  onRequestHint?: () => void // 힌트 요청 함수
  isInputDisabled?: boolean
  evidence?: string[]
  score?: number
  hintsUsed?: number
  storyProgress?: number
}

const GameUI: React.FC<GameUIProps> = ({
  caseTitle,
  messages,
  onSendMessage,
  onBackToMenu,
  onRequestHint, // 힌트 요청 함수
  isInputDisabled = false,
  evidence: _evidence = [],
  score = 0,
  hintsUsed = 0,
  storyProgress = 0
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hintCooldown, setHintCooldown] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 힌트 쿨다운 타이머
  useEffect(() => {
    if (hintCooldown > 0) {
      const timer = setTimeout(() => {
        setHintCooldown(prev => prev - 1)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [hintCooldown])

  // 힌트 요청 핸들러 (쿨다운 적용)
  const handleHintRequest = () => {
    if (hintCooldown > 0) return
    
    setHintCooldown(5) // 0.5초 쿨다운
    if (onRequestHint) {
      onRequestHint()
    }
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        {/* 첫 번째 행: 제목과 서버 상태 */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <button
              onClick={onBackToMenu}
              className="text-sherlock-text-secondary hover:text-sherlock-text transition-colors flex-shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sherlock-text font-semibold text-lg truncate">{caseTitle}</h1>
              <p className="text-sherlock-text-secondary text-sm">셜록 홈즈와 함께하는 추리</p>
            </div>
          </div>
          
          {/* 서버 상태 표시 */}
          <div className="flex-shrink-0 ml-4">
            <ServerStatus className="text-xs" />
          </div>
        </div>
        
        {/* 두 번째 행: 게임 정보 (간소화) */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* 점수 */}
            <div className="text-sherlock-text-secondary text-xs">
              점수: <span className="text-sherlock-accent font-bold">{score}</span>
            </div>
            
            {/* 진행도 */}
            <div className="flex items-center space-x-2">
              <span className="text-sherlock-text-secondary text-xs">진행도:</span>
              <div className="w-16 h-1.5 bg-sherlock-gray rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sherlock-accent to-sherlock-text rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, storyProgress))}%` }}
                />
              </div>
              <span className="text-sherlock-accent text-xs font-medium min-w-[2rem]">
                {Math.round(storyProgress)}%
              </span>
            </div>

            {/* 힌트 버튼 (간소화) */}
            {onRequestHint && (
              <button
                onClick={handleHintRequest}
                disabled={hintCooldown > 0 || isInputDisabled}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  hintCooldown > 0 || isInputDisabled
                    ? 'bg-sherlock-gray text-sherlock-text-secondary cursor-not-allowed'
                    : 'bg-sherlock-accent/20 text-sherlock-accent hover:bg-sherlock-accent/30'
                }`}
                title={hintCooldown > 0 ? '잠시 후 다시 시도하세요' : '힌트 요청'}
              >
                {hintCooldown > 0 ? `💡 (${(hintCooldown / 10).toFixed(1)}s)` : '💡 힌트'}
              </button>
            )}
          </div>
          
          {/* 상태 표시 (간소화) */}
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sherlock-text-secondary text-xs">활성</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            type={message.type}
            content={message.content}
            timestamp={message.timestamp}
            avatar={message.avatar}
            speaker={message.speaker}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={isInputDisabled}
          placeholder="추리나 질문을 입력하세요..."
        />
      </div>

    </div>
  )
}

export default GameUI