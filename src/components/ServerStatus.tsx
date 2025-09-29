import React, { useState, useEffect } from 'react'
import { aiService } from '@/services/aiService'
import ModelSelector from './ModelSelector'
import APIUsageMonitor from './APIUsageMonitor'

interface ServerStatusProps {
  className?: string
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState({
    isConnected: false,
    lastCheck: null as Date | null,
    provider: 'gemini',
    model: 'gemini-1.5-flash'
  })
  const [isChecking, setIsChecking] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const updateStatus = () => {
    const currentStatus = aiService.getConnectionStatus()
    setStatus(currentStatus)
  }

  const checkConnection = async () => {
    setIsChecking(true)
    await aiService.checkConnection()
    updateStatus()
    setIsChecking(false)
  }

  const testAIGeneration = async () => {
    setIsTesting(true)
    const success = await aiService.testAIGeneration()
    if (success) {
      alert('✅ AI 생성 테스트 성공! 콘솔에서 자세한 로그를 확인하세요.')
    } else {
      alert('❌ AI 생성 테스트 실패! 콘솔에서 오류를 확인하세요.')
    }
    updateStatus()
    setIsTesting(false)
  }

  useEffect(() => {
    updateStatus()
    
    // 30초마다 상태 업데이트
    const interval = setInterval(updateStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-500'
    return status.isConnected ? 'text-green-500' : 'text-red-500'
  }

  const getStatusText = () => {
    if (isChecking) return '연결 확인 중...'
    return status.isConnected ? '서버 연결됨' : '서버 연결 안됨'
  }

  const getStatusIcon = () => {
    if (isChecking) return '🔄'
    return status.isConnected ? '🟢' : '🔴'
  }

  const handleModelChange = () => {
    // 모델 변경 후 상태 업데이트
    updateStatus()
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* 연결 상태 표시 (간소화) */}
      <div className="flex items-center gap-1">
        <span className="text-base">{getStatusIcon()}</span>
        <span className={getStatusColor()}>
          {status.isConnected ? 'AI' : '오프라인'}
        </span>
      </div>
      
      {/* AI 모델 선택기 */}
      <ModelSelector 
        onModelChange={handleModelChange}
        className="flex-shrink-0"
      />
      
      {/* API 사용량 모니터 */}
      <APIUsageMonitor className="flex-shrink-0" />
      
      {/* 개발자 도구 (숨김 처리) */}
      <div className="hidden">
        <button
          onClick={checkConnection}
          disabled={isChecking || isTesting}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? '확인 중...' : '연결 테스트'}
        </button>
        
        <button
          onClick={testAIGeneration}
          disabled={isChecking || isTesting}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="실제 AI 응답 생성 테스트"
        >
          {isTesting ? 'AI 테스트 중...' : 'AI 테스트'}
        </button>
      </div>
    </div>
  )
}
