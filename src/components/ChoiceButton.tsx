import React from 'react'

export interface ChoiceButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
  index?: number
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ 
  text, 
  onClick, 
  disabled = false, 
  index 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="choice-button disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start space-x-3">
        {index !== undefined && (
          <span className="text-sherlock-text-secondary font-mono text-sm mt-0.5">
            {index + 1}.
          </span>
        )}
        <span className="flex-1 text-left">{text}</span>
      </div>
    </button>
  )
}

export default ChoiceButton
