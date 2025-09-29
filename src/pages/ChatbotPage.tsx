import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatbot } from '@/hooks/useChatbot'
import { ChatbotMessage } from '@/types/chatbot'
import { ServerStatus } from '@/components/ServerStatus'

const ChatbotPage: React.FC = () => {
  const { storyId, characterId } = useParams<{ storyId: string; characterId: string }>()
  const navigate = useNavigate()
  const { character, messages, sendMessage, isLoading, error } = useChatbot(storyId!, characterId!)
  const [inputMessage, setInputMessage] = useState('')
  const [isInputDisabled, setIsInputDisabled] = useState(false)

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isInputDisabled) return

    setIsInputDisabled(true)
    try {
      await sendMessage(inputMessage.trim())
      setInputMessage('')
    } catch (error) {
      console.error('메시지 전송 실패:', error)
    } finally {
      setIsInputDisabled(false)
    }
  }

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 캐릭터 정보가 없으면 에러 표시
  if (error) {
    return (
      <div className="min-h-screen bg-sherlock-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-sherlock-text mb-4">캐릭터를 찾을 수 없습니다</h1>
          <p className="text-sherlock-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate(`/story/${storyId}`)}
            className="sherlock-button"
          >
            스토리로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sherlock-dark">
      {/* 헤더 */}
      <div className="bg-sherlock-darker border-b border-sherlock-text border-opacity-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <button
                onClick={() => navigate(`/story/${storyId}`)}
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
              
              {character && (
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-sherlock-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sherlock-dark font-bold">
                      {character.avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sherlock-text font-semibold text-lg truncate">{character.name}</h1>
                    <p className="text-sherlock-text-secondary text-sm whitespace-nowrap">💬 1:1 대화 모드</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 ml-4">
              <ServerStatus className="text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* 대화 영역 */}
      <div className="max-w-4xl mx-auto px-6 py-6 h-[calc(100vh-120px)] flex flex-col">
        {/* 캐릭터 소개 */}
        {character && (
          <div className="bg-sherlock-darker rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-sherlock-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sherlock-dark font-bold text-lg">
                  {character.avatar}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-sherlock-text font-semibold text-lg mb-1">{character.name}</h3>
                <p className="text-sherlock-text-secondary text-sm mb-2">{character.role}</p>
                <p className="text-sherlock-text text-sm">{character.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-sherlock-accent text-sherlock-dark'
                    : 'bg-sherlock-darker text-sherlock-text'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' 
                    ? 'text-sherlock-dark opacity-70' 
                    : 'text-sherlock-text-secondary'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-sherlock-darker text-sherlock-text rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-sherlock-accent rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-sherlock-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-sherlock-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sherlock-text-secondary text-sm">
                    {character?.name}이(가) 답변을 준비 중...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 메시지 입력 */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${character?.name}에게 메시지를 입력하세요...`}
              disabled={isInputDisabled}
              className="w-full px-4 py-3 bg-sherlock-darker border border-sherlock-text border-opacity-20 rounded-lg text-sherlock-text placeholder-sherlock-text-secondary focus:outline-none focus:border-sherlock-accent resize-none"
              rows={3}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isInputDisabled}
            className="px-6 py-3 bg-sherlock-accent text-sherlock-dark font-medium rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
          >
            {isInputDisabled ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage
