import React, { useState, KeyboardEvent, useRef } from 'react'

export interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "메시지를 입력하세요..." 
}) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 상황 버튼 클릭 시 ** 추가하고 커서를 가운데로
  const handleActionButton = () => {
    if (!inputRef.current) return

    const input = inputRef.current
    const cursorPos = input.selectionStart || 0
    const currentValue = message
    
    // 현재 커서 위치에 ** 삽입
    const beforeCursor = currentValue.substring(0, cursorPos)
    const afterCursor = currentValue.substring(cursorPos)
    const newValue = beforeCursor + '**' + afterCursor
    
    setMessage(newValue)
    
    // 다음 프레임에서 커서를 * 사이로 이동
    setTimeout(() => {
      if (input) {
        input.focus()
        input.setSelectionRange(cursorPos + 1, cursorPos + 1) // * 사이에 커서 위치
      }
    }, 0)
  }

  return (
    <div className="flex items-center space-x-3">
      {/* 상황 버튼 */}
      <button
        onClick={handleActionButton}
        disabled={disabled}
        className="flex items-center justify-center w-10 h-10 bg-sherlock-light-gray hover:bg-sherlock-medium-gray text-sherlock-text border border-sherlock-border rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="상황 표현 추가 (*문을 열며* 형태)"
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
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </button>

      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-sherlock-gray text-sherlock-text border border-sherlock-border rounded-full px-4 py-3 pr-12 focus:outline-none focus:border-sherlock-accent transition-colors placeholder-sherlock-text-secondary"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-sherlock-accent text-sherlock-dark rounded-full flex items-center justify-center hover:bg-sherlock-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ChatInput
