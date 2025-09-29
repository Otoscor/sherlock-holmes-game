import React, { useState, useEffect } from 'react'
import { aiService } from '../services/aiService'

// 사용 가능한 AI 모델 목록
export interface AIModel {
  id: string
  name: string
  provider: 'gemini' | 'openai' | 'anthropic'
  description: string
  speed: 'fast' | 'medium' | 'slow'
  quality: 'good' | 'better' | 'best'
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    description: '안정적이고 검증된 모델, 모든 대화에 적합',
    speed: 'medium',
    quality: 'best'
  },
  {
    id: 'gemini-1.5-pro-001',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: '향상된 성능, 복잡한 추리와 분석에 적합',
    speed: 'medium',
    quality: 'better'
  },
  {
    id: 'gemini-1.5-flash-001',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: '빠른 응답 속도, 일반적인 대화에 적합',
    speed: 'fast',
    quality: 'good'
  }
]

interface ModelSelectorProps {
  className?: string
  onModelChange?: (model: AIModel) => void
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  className = '', 
  onModelChange 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentModel, setCurrentModel] = useState<AIModel>(AVAILABLE_MODELS[0])
  const [isChanging, setIsChanging] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')

  // 현재 AI 서비스의 모델 상태 가져오기
  useEffect(() => {
    const status = aiService.getConnectionStatus()
    const foundModel = AVAILABLE_MODELS.find(model => model.id === status.model)
    if (foundModel) {
      setCurrentModel(foundModel)
    }
  }, [])

  const handleModelSelect = async (model: AIModel) => {
    if (model.id === currentModel.id) {
      setIsOpen(false)
      return
    }

    setIsChanging(true)
    
    try {
      // AI 서비스의 모델 변경
      await (aiService as any).setModel(model.id, model.provider)
      
      setCurrentModel(model)
      setIsOpen(false)
      
      // 부모 컴포넌트에 변경 알림
      if (onModelChange) {
        onModelChange(model)
      }
      
      console.log(`✅ AI 모델이 ${model.name}으로 변경되었습니다.`)
    } catch (error) {
      console.error('❌ 모델 변경 실패:', error)
      alert('모델 변경에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsChanging(false)
    }
  }

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return '⚡'
      case 'medium': return '⚖️'
      case 'slow': return '🎯'
      default: return '⚡'
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good': return '⭐'
      case 'better': return '⭐⭐'
      case 'best': return '⭐⭐⭐'
      default: return '⭐'
    }
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'slow': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className={`relative ${className}`} style={{ zIndex: isOpen ? 99999 : 'auto' }}>
      {/* 현재 모델 표시 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center gap-2 px-3 py-2 bg-sherlock-card border border-sherlock-accent/20 rounded-lg hover:bg-sherlock-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI 모델 선택"
      >
        <div className="flex items-center gap-1">
          <span className="text-sherlock-accent font-medium text-sm">
            {currentModel.provider.toUpperCase()}
          </span>
          <span className="text-sherlock-text-secondary text-xs">
            ({currentModel.name})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className={`text-xs ${getSpeedColor(currentModel.speed)}`}>
            {getSpeedIcon(currentModel.speed)}
          </span>
          <span className="text-xs text-yellow-500">
            {getQualityIcon(currentModel.quality)}
          </span>
        </div>
        
        {isChanging ? (
          <div className="w-4 h-4 border-2 border-sherlock-accent border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg 
            className={`w-4 h-4 text-sherlock-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* 모델 선택 드롭다운 */}
      {isOpen && (
        <div className={`absolute ${dropdownPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} left-0 w-80 bg-gray-900/95 border border-sherlock-accent/30 rounded-lg shadow-2xl z-[99999] backdrop-blur-md ring-1 ring-black/20`}>
          <div className="p-3 border-b border-sherlock-accent/10">
            <h3 className="text-sherlock-text font-medium text-sm">AI 모델 선택</h3>
            <p className="text-sherlock-text-secondary text-xs mt-1">
              게임 경험에 맞는 AI 모델을 선택하세요
            </p>
          </div>
          
          <div className="p-2 max-h-64 overflow-y-auto">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model)}
                disabled={isChanging}
                className={`w-full p-3 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  model.id === currentModel.id
                    ? 'bg-sherlock-accent/20 border border-sherlock-accent/30'
                    : 'hover:bg-sherlock-accent/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sherlock-text font-medium text-sm">
                        {model.name}
                      </span>
                      {model.id === currentModel.id && (
                        <span className="text-sherlock-accent text-xs bg-sherlock-accent/20 px-2 py-0.5 rounded-full">
                          현재 선택됨
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sherlock-text-secondary text-xs mb-2">
                      {model.description}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-sherlock-text-secondary">속도:</span>
                        <span className={`text-xs ${getSpeedColor(model.speed)}`}>
                          {getSpeedIcon(model.speed)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-sherlock-text-secondary">품질:</span>
                        <span className="text-xs text-yellow-500">
                          {getQualityIcon(model.quality)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t border-sherlock-accent/10 bg-sherlock-accent/5">
            <p className="text-xs text-sherlock-text-secondary">
              💡 <strong>팁:</strong> Flash는 빠른 대화, Pro는 복잡한 추리에 적합합니다.
            </p>
          </div>
        </div>
      )}
      
      {/* 배경 클릭 시 닫기 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99998] bg-black/20 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ModelSelector

