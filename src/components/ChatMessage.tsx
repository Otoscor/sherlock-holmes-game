import React from 'react'

export interface ChatMessageProps {
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  avatar?: string
  speaker?: string  // 화자 이름 (예: "레스트레이드 경감")
}

const ChatMessage: React.FC<ChatMessageProps> = ({ type, content, timestamp, avatar, speaker }) => {
  // 메시지 파싱 (간단한 정규식으로 구현)
  const parseMessage = (text: string) => {
    const actions: string[] = []
    let dialogue = text

    // *...* 패턴을 찾아서 추출
    const actionRegex = /\*([^*]+)\*/g
    let match

    while ((match = actionRegex.exec(text)) !== null) {
      actions.push(match[1].trim())
    }

    // 상황 표현을 제거한 순수 대화 내용
    dialogue = text.replace(/\*[^*]+\*/g, '').trim()

    return { actions, dialogue }
  }

  const parsedMessage = parseMessage(content)
  
  const getMessageClasses = () => {
    switch (type) {
      case 'user':
        return 'message-bubble message-user'
      case 'assistant':
        return 'message-bubble message-assistant'
      case 'system':
        return 'message-bubble message-system'
      default:
        return 'message-bubble message-assistant'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 상황 표현 컴포넌트 (버블 내부용)
  const ActionText: React.FC<{ actions: string[] }> = ({ actions }) => {
    if (actions.length === 0) return null
    
    return (
      <div className="mb-2">
        {actions.map((action, index) => (
          <div 
            key={index}
            className="text-sherlock-text-secondary text-sm italic mb-1 font-normal"
          >
            📝 {action}
          </div>
        ))}
      </div>
    )
  }

  if (type === 'system') {
    return (
      <div className="flex justify-center">
        <div className={getMessageClasses()}>
          <ActionText actions={parsedMessage.actions} />
          {parsedMessage.dialogue && (
            <div className="whitespace-pre-wrap font-bold">{parsedMessage.dialogue}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
      {type === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-sherlock-medium-gray flex items-center justify-center text-sherlock-text text-sm font-bold mb-1">
          {avatar || 'H'}
        </div>
      )}
      
      <div className="flex flex-col">
        <div className={getMessageClasses()}>
          <ActionText actions={parsedMessage.actions} />
          {speaker && (
            <div className="text-sherlock-text-secondary text-xs mb-1 font-normal">
              {speaker}이(가) 말했다:
            </div>
          )}
          {parsedMessage.dialogue && (
            <div className="whitespace-pre-wrap font-bold">{parsedMessage.dialogue}</div>
          )}
        </div>
        {timestamp && (
          <div className={`text-xs text-sherlock-text-secondary mt-1 ${
            type === 'user' ? 'text-right' : 'text-left'
          }`}>
            {formatTime(timestamp)}
          </div>
        )}
      </div>
      
      {type === 'user' && (
        <div className="w-8 h-8 rounded-full bg-sherlock-accent flex items-center justify-center text-sherlock-dark text-sm font-bold mb-1">
          나
        </div>
      )}
    </div>
  )
}

export default ChatMessage
