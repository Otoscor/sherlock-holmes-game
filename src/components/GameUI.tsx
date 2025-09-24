import React, { useEffect, useRef } from 'react'
import ChatMessage, { ChatMessageProps } from './ChatMessage'
import ChatInput from './ChatInput'

export interface GameUIProps {
  caseTitle: string
  messages: ChatMessageProps[]
  onSendMessage: (message: string) => void
  onBackToMenu: () => void
  onRequestHint?: () => void // 🆕 힌트 요청 함수 추가
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
  onRequestHint, // 🆕 힌트 요청 함수
  isInputDisabled = false,
  evidence = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  score = 0,
  hintsUsed = 0, // 🆕 힌트 사용 횟수
  storyProgress = 0
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToMenu}
            className="text-sherlock-text-secondary hover:text-sherlock-text transition-colors"
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
          <div>
            <h1 className="text-sherlock-text font-semibold text-lg">{caseTitle}</h1>
            <p className="text-sherlock-text-secondary text-sm">셜록 홈즈와 함께하는 추리</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sherlock-text-secondary text-sm">
            점수: <span className="text-sherlock-accent font-bold">{score}</span>
          </div>
          
          {/* 🆕 힌트 사용 횟수 표시 */}
          <div className="text-sherlock-text-secondary text-sm">
            힌트: <span className="text-sherlock-accent font-bold">{hintsUsed}</span>
          </div>
          
          {/* 🆕 힌트 버튼 */}
          {onRequestHint && (
            <button
              onClick={onRequestHint}
              className="flex items-center space-x-1 px-3 py-1.5 bg-sherlock-accent/10 hover:bg-sherlock-accent/20 text-sherlock-accent border border-sherlock-accent/30 rounded-md transition-colors text-sm"
              disabled={isInputDisabled}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <span>힌트</span>
            </button>
          )}
          
          {/* 스토리 진행도 바 */}
          <div className="flex items-center space-x-2">
            <span className="text-sherlock-text-secondary text-sm">진행도:</span>
            <div className="w-24 h-2 bg-sherlock-gray rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sherlock-accent to-sherlock-text rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, storyProgress))}%` }}
              />
            </div>
            <span className="text-sherlock-accent text-sm font-medium min-w-[3rem]">
              {Math.round(storyProgress)}%
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sherlock-text-secondary text-sm">진행 중</span>
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