// 챗봇 대화 관련 타입 정의

export interface ChatbotCharacter {
  id: string
  name: string
  role: string
  personality: string
  avatar: string
  description: string
  greeting?: string // 첫 인사말
  backstory?: string // 캐릭터 배경 스토리
}

export interface ChatbotMessage {
  id: string
  sender: 'user' | 'character'
  characterId?: string
  content: string
  timestamp: Date
  emotion?: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral'
}

export interface ChatbotSession {
  id: string
  storyId: string
  characterId: string
  messages: ChatbotMessage[]
  startTime: Date
  lastActivity: Date
  isActive: boolean
}

export interface ChatbotState {
  currentSession: ChatbotSession | null
  availableCharacters: ChatbotCharacter[]
  isLoading: boolean
  error: string | null
}




