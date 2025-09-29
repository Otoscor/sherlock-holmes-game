import React from 'react'

export interface HintChoice {
  id: string
  text: string
  hint: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface HintChoiceButtonProps {
  choice: HintChoice
  onSelect: (choice: HintChoice) => void
  disabled?: boolean
}

const HintChoiceButton: React.FC<HintChoiceButtonProps> = ({
  choice,
  onSelect,
  disabled = false
}) => {
  const getDifficultyColor = (difficulty: HintChoice['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400'
      case 'hard':
        return 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400'
      default:
        return 'border-sherlock-border bg-sherlock-gray hover:bg-sherlock-medium-gray text-sherlock-text'
    }
  }

  const getDifficultyIcon = (difficulty: HintChoice['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '💡'
      case 'medium':
        return '🔍'
      case 'hard':
        return '🧠'
      default:
        return '❓'
    }
  }

  const getDifficultyLabel = (difficulty: HintChoice['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '기본 진행'
      case 'medium':
        return '상세 진행'
      case 'hard':
        return '심화 진행'
      default:
        return '진행'
    }
  }

  return (
    <button
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className={`
        w-full p-4 rounded-lg border transition-all duration-200
        ${getDifficultyColor(choice.difficulty)}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-0.5'}
        text-left
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getDifficultyIcon(choice.difficulty)}</span>
          <span className="text-sm font-medium opacity-75">
            {getDifficultyLabel(choice.difficulty)}
          </span>
        </div>
      </div>
      
      <p className="text-sm leading-relaxed">
        {choice.text}
      </p>
      
      <div className="mt-3 pt-2 border-t border-current/20">
        <p className="text-xs opacity-60">
          클릭하면 이 방향으로 스토리가 자동 진행됩니다
        </p>
      </div>
    </button>
  )
}

export default HintChoiceButton
