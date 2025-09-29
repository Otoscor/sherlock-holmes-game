import React, { useState } from 'react'
import HintChoiceButton, { HintChoice } from './HintChoiceButton'

interface HintSelectorProps {
  choices: HintChoice[]
  onSelectHint: (choice: HintChoice) => void
  onCancel: () => void
  currentScore: number
  hintsUsed: number
}

const HintSelector: React.FC<HintSelectorProps> = ({
  choices,
  onSelectHint,
  onCancel,
  currentScore,
  hintsUsed
}) => {
  const [selectedChoice, setSelectedChoice] = useState<HintChoice | null>(null)

  const handleSelectChoice = (choice: HintChoice) => {
    setSelectedChoice(choice)
  }

  const handleConfirm = () => {
    if (selectedChoice) {
      onSelectHint(selectedChoice)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-sherlock-dark border border-sherlock-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-sherlock-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-sherlock-text">
              🎯 스토리 진행 방향 선택
            </h2>
            <button
              onClick={onCancel}
              className="text-sherlock-text-secondary hover:text-sherlock-text transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="text-sherlock-text-secondary">
              현재 점수: <span className="text-sherlock-accent font-bold">{currentScore}점</span>
            </div>
            <div className="text-sherlock-text-secondary">
              힌트 사용: <span className="text-sherlock-accent font-bold">{hintsUsed}회</span>
            </div>
          </div>
        </div>

        {/* 힌트 선택지 */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {choices.map((choice) => (
              <div
                key={choice.id}
                className={`${
                  selectedChoice?.id === choice.id 
                    ? 'ring-2 ring-sherlock-accent' 
                    : ''
                }`}
              >
                <HintChoiceButton
                  choice={choice}
                  onSelect={handleSelectChoice}
                  disabled={false}
                />
              </div>
            ))}
          </div>

          {/* 선택된 힌트 미리보기 */}
          {selectedChoice && (
            <div className="bg-sherlock-darker rounded-lg p-4 mb-6">
              <h3 className="text-sherlock-text font-medium mb-2">선택된 진행 방향:</h3>
              <p className="text-sherlock-text-secondary text-sm leading-relaxed">
                {selectedChoice.text}
              </p>
              <div className="mt-3 pt-3 border-t border-sherlock-border">
                <div className="flex items-center justify-center text-xs text-green-400">
                  <span>🎯 자동 진행</span>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-sherlock-gray hover:bg-sherlock-medium-gray text-sherlock-text border border-sherlock-border rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedChoice}
              className={`
                flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                ${selectedChoice 
                  ? 'bg-sherlock-accent hover:bg-sherlock-text text-sherlock-dark' 
                  : 'bg-sherlock-gray text-sherlock-text-secondary cursor-not-allowed'
                }
              `}
            >
              스토리 진행하기
            </button>
          </div>
        </div>

        {/* 도움말 */}
        <div className="px-6 pb-6">
          <div className="bg-sherlock-gray/50 rounded-lg p-4">
            <h4 className="text-sherlock-text text-sm font-medium mb-2">🎯 스토리 진행 가이드</h4>
            <ul className="text-sherlock-text-secondary text-xs space-y-1">
              <li>• <span className="text-green-400">기본 진행</span>: 일반적인 스토리 흐름으로 진행</li>
              <li>• <span className="text-yellow-400">상세 진행</span>: 구체적인 액션과 대화로 진행</li>
              <li>• <span className="text-red-400">심화 진행</span>: 복잡한 상황과 깊은 분석으로 진행</li>
              <li>• 선택한 방향에 따라 캐릭터들이 자동으로 행동하며 스토리가 전개됩니다!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HintSelector
