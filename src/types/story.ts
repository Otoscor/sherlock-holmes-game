// 스토리 관련 타입 정의

export interface StoryCharacter {
  name: string
  avatar: string
  description: string
  personality: string
  quotes?: string[]
  role?: string
}

export interface StoryScene {
  id: string
  title: string
  description: string
  keywords?: string[]
  progress?: number
  chapterRef?: string
  originalText?: string
  gameContent?: string
  keyElements?: string[]
  evidence?: string[]
}

export interface StoryAct {
  title: string
  scenes: StoryScene[]
}

export interface StorySetting {
  time: string
  location: string
  atmosphere: string
}

export interface StoryGameMechanics {
  player_role: string
  available_characters: string[]
  story_branches: Array<{
    id: string
    title: string
    condition: string
    difficulty: string
  }>
}

export interface StoryQuote {
  character: string
  quote: string
  context: string
}

export interface StoryData {
  id: string
  title: string
  englishTitle?: string
  author: string
  year?: number
  description: string
  originalText?: string
  setting?: StorySetting
  characters: Record<string, StoryCharacter> | Record<string, Record<string, StoryCharacter>>
  themes?: string[]
  story_progression?: Record<string, StoryAct>
  gameFlow?: {
    introduction: {
      scene: string
      setup: string
      trigger: string
    }
    investigation?: {
      phases: string[]
    }
    resolution?: {
      revelation: string
      method: string
      motive: string
    }
  }
  game_mechanics?: StoryGameMechanics
  key_quotes?: StoryQuote[]
  keyScenes?: StoryScene[]
  vocabulary?: {
    victorianTerms?: string[]
    forensicTerms?: string[]
  }
  atmosphere?: {
    setting: string
    mood: string
    weather: string
  }
}

export interface StoryCardProps {
  story: StoryData
  onDetailClick: (storyId: string) => void
  onPlayClick: (storyId: string) => void
}

// 게임 난이도 타입
export type GameDifficulty = 'easy' | 'medium' | 'hard'

// 게임 장르 타입
export type GameGenre = '추리' | '로맨스' | '비극' | '드라마' | '모험'

// 게임 상태 타입
export type GameStatus = 'available' | 'coming-soon' | 'maintenance'

export interface GameInfo {
  genre: GameGenre
  difficulty: GameDifficulty
  estimatedTime: string
  status: GameStatus
}

// 캐릭터 정보를 평면화하는 유틸리티 타입
export interface FlatCharacter {
  name: string
  description: string
  avatar: string
  role?: string
  personality?: string
}

// 힌트 시스템 관련 타입
export interface HintChoice {
  id: string
  text: string
  hint: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameState {
  storyId: string
  currentAct: string
  currentScene: string
  playerCharacter?: string
  messages: ChatMessageProps[]
  evidence: string[]
  isInputDisabled: boolean
  score: number
  hintsUsed: number
  storyProgress: number
  completedKeywords: string[]
  unlockedScenes: string[]
  gameStartTime: Date
}

// 채팅 메시지 타입
export interface ChatMessageProps {
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  avatar?: string
  speaker?: string
  characterId?: string
}