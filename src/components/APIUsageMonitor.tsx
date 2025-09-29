import React, { useState, useEffect } from 'react'

interface APIUsageStats {
  requestCount: number
  estimatedTokensUsed: number
  dailyLimit: number
  sessionStartTime: Date
  lastRequestTime: Date | null
}

interface APIUsageMonitorProps {
  className?: string
}

export const APIUsageMonitor: React.FC<APIUsageMonitorProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<APIUsageStats>({
    requestCount: 0,
    estimatedTokensUsed: 0,
    dailyLimit: 1500, // Gemini API 무료 한도 (일일)
    sessionStartTime: new Date(),
    lastRequestTime: null
  })
  const [isExpanded, setIsExpanded] = useState(false)

  // 로컬 스토리지에서 일일 사용량 로드
  useEffect(() => {
    const today = new Date().toDateString()
    const savedStats = localStorage.getItem(`api_usage_${today}`)
    
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats)
        setStats(prev => ({
          ...prev,
          requestCount: parsed.requestCount || 0,
          estimatedTokensUsed: parsed.estimatedTokensUsed || 0,
          lastRequestTime: parsed.lastRequestTime ? new Date(parsed.lastRequestTime) : null
        }))
      } catch (error) {
        console.warn('API 사용량 데이터 로드 실패:', error)
      }
    }

    // 전역 함수로 노출하여 AI 서비스에서 사용할 수 있도록 함
    if (typeof window !== 'undefined') {
      (window as any).trackAPIRequest = (estimatedTokens: number = 100) => {
        const today = new Date().toDateString()
        const newRequestCount = stats.requestCount + 1
        const newTokensUsed = stats.estimatedTokensUsed + estimatedTokens
        const newLastRequestTime = new Date()

        setStats(prev => ({
          ...prev,
          requestCount: newRequestCount,
          estimatedTokensUsed: newTokensUsed,
          lastRequestTime: newLastRequestTime
        }))
        
        // 로컬 스토리지에 저장
        localStorage.setItem(`api_usage_${today}`, JSON.stringify({
          requestCount: newRequestCount,
          estimatedTokensUsed: newTokensUsed,
          lastRequestTime: newLastRequestTime.toISOString()
        }))
      }
    }

    // 5초마다 상태 업데이트
    const interval = setInterval(() => {
      const today = new Date().toDateString()
      const savedStats = localStorage.getItem(`api_usage_${today}`)
      
      if (savedStats) {
        try {
          const parsed = JSON.parse(savedStats)
          setStats(prev => ({
            ...prev,
            requestCount: parsed.requestCount || 0,
            estimatedTokensUsed: parsed.estimatedTokensUsed || 0,
            lastRequestTime: parsed.lastRequestTime ? new Date(parsed.lastRequestTime) : null
          }))
        } catch (error) {
          // 무시
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getUsagePercentage = () => {
    return Math.min((stats.requestCount / stats.dailyLimit) * 100, 100)
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage < 50) return 'text-green-500'
    if (percentage < 80) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getUsageBarColor = () => {
    const percentage = getUsagePercentage()
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatTime = (date: Date | null) => {
    if (!date) return '없음'
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const getRemainingRequests = () => {
    return Math.max(0, stats.dailyLimit - stats.requestCount)
  }

  return (
    <div className={`relative ${className}`}>
      {/* 간단한 표시 버튼 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
          getUsagePercentage() > 80 
            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
            : 'bg-sherlock-accent/10 text-sherlock-accent border border-sherlock-accent/20'
        }`}
        title="API 사용량 보기"
      >
        <span>API</span>
        <div className="flex items-center gap-1">
          <div className="w-8 h-1 bg-sherlock-gray rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getUsageBarColor()}`}
              style={{ width: `${getUsagePercentage()}%` }}
            />
          </div>
          <span className={getUsageColor()}>
            {stats.requestCount}
          </span>
        </div>
      </button>

      {/* 상세 정보 팝업 */}
      {isExpanded && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsExpanded(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-72 bg-sherlock-card border border-sherlock-accent/20 rounded-lg shadow-xl z-[9999]">
            <div className="p-3 border-b border-sherlock-accent/10">
              <h3 className="text-sherlock-text font-medium text-sm">API 사용량 모니터</h3>
              <p className="text-sherlock-text-secondary text-xs mt-1">
                오늘의 Gemini API 사용 현황
              </p>
            </div>
            
            <div className="p-3">
              {/* 사용량 바 */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-sherlock-text-secondary">일일 사용량</span>
                  <span className={`text-xs font-medium ${getUsageColor()}`}>
                    {stats.requestCount}/{stats.dailyLimit}
                  </span>
                </div>
                <div className="w-full h-2 bg-sherlock-gray rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getUsageBarColor()}`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
                <div className="text-xs text-sherlock-text-secondary mt-1">
                  {Math.round(getUsagePercentage())}% 사용됨
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-sherlock-text-secondary">남은 요청:</span>
                  <div className={`font-medium ${getUsageColor()}`}>
                    {getRemainingRequests()}개
                  </div>
                </div>
                
                <div>
                  <span className="text-sherlock-text-secondary">예상 토큰:</span>
                  <div className="text-sherlock-text font-medium">
                    {stats.estimatedTokensUsed.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sherlock-text-secondary">세션 시작:</span>
                  <div className="text-sherlock-text font-medium">
                    {formatTime(stats.sessionStartTime)}
                  </div>
                </div>
                
                <div>
                  <span className="text-sherlock-text-secondary">마지막 요청:</span>
                  <div className="text-sherlock-text font-medium">
                    {formatTime(stats.lastRequestTime)}
                  </div>
                </div>
              </div>

              {/* 경고 메시지 */}
              {getUsagePercentage() > 80 && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                  <span className="text-yellow-500">⚠️ </span>
                  <span className="text-sherlock-text">
                    일일 한도의 {Math.round(getUsagePercentage())}% 사용됨
                    {getRemainingRequests() < 50 && ' - 곧 한도에 도달할 수 있습니다'}
                  </span>
                </div>
              )}

              {/* 도움말 링크 */}
              <div className="mt-3 pt-2 border-t border-sherlock-accent/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sherlock-text-secondary">
                    더 자세한 정보:
                  </span>
                  <a 
                    href="https://aistudio.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sherlock-accent hover:underline"
                  >
                    Google AI Studio ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default APIUsageMonitor
