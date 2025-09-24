import { StoryParser } from './storyParser'
import { ChatMessageProps } from '@/components/ChatMessage'

export interface GameState {
  currentScene: string
  evidence: string[]
  suspects: string[]
  deductions: string[]
  score: number
  hintsUsed: number
  timeElapsed: number
}

export interface GameResponse {
  messages: ChatMessageProps[]
  evidence?: string[]
  sceneChange?: string
}

export class GameEngine {
  private storyParser: StoryParser
  private gameState: GameState
  private caseId: string

  constructor(caseId: string) {
    this.caseId = caseId
    this.storyParser = new StoryParser()
    this.gameState = {
      currentScene: 'introduction',
      evidence: [],
      suspects: [],
      deductions: [],
      score: 0,
      hintsUsed: 0,
      timeElapsed: 0
    }
  }

  async initialize(): Promise<void> {
    await this.storyParser.loadOriginalData(this.caseId)
  }

  // 사용자 입력 처리 및 응답 생성
  processUserInput(userInput: string): GameResponse {
    const response: GameResponse = {
      messages: []
    }

    // 입력 분석
    const inputAnalysis = this.analyzeInput(userInput)
    
    // 현재 장면에 따른 처리
    switch (this.gameState.currentScene) {
      case 'introduction':
        return this.handleIntroduction(userInput, inputAnalysis)
      
      case 'crime-scene':
        return this.handleCrimeScene(userInput, inputAnalysis)
      
      case 'investigation':
        return this.handleInvestigation(userInput, inputAnalysis)
      
      case 'deduction-phase':
        return this.handleDeductionPhase(userInput, inputAnalysis)
      
      default:
        return this.handleGenericScene(userInput, inputAnalysis)
    }
  }

  private analyzeInput(input: string): {
    keywords: string[]
    intent: string
    confidence: number
  } {
    const keywords = input.toLowerCase().split(' ').filter(word => word.length > 2)
    
    // 의도 분석
    let intent = 'general'
    let confidence = 0.5

    if (keywords.some(k => ['관찰', 'examine', '살펴', '조사'].includes(k))) {
      intent = 'examine'
      confidence = 0.8
    } else if (keywords.some(k => ['추론', 'deduce', '생각', '결론'].includes(k))) {
      intent = 'deduce'
      confidence = 0.8
    } else if (keywords.some(k => ['질문', 'ask', '묻다', '물어'].includes(k))) {
      intent = 'question'
      confidence = 0.7
    } else if (keywords.some(k => ['rache', '라헤', '글자', '벽'].includes(k))) {
      intent = 'examine-rache'
      confidence = 0.9
    }

    return { keywords, intent, confidence }
  }

  private handleIntroduction(userInput: string, analysis: any): GameResponse {
    const response: GameResponse = {
      messages: [
        {
          type: 'user',
          content: userInput
        }
      ],
      choices: []
    }

    // 왓슨의 응답
    if (analysis.intent === 'question') {
      response.messages.push({
        type: 'assistant',
        content: this.storyParser.generateCharacterResponse('watson', 'introduction', userInput),
        avatar: 'W'
      })
    } else {
      response.messages.push({
        type: 'assistant',
        content: `좋은 생각입니다, 홈즈. ${userInput}에 대해 더 자세히 알아보죠. 레스트레이드가 우리를 기다리고 있을 것입니다.`,
        avatar: 'W'
      })
    }

    // 다음 장면으로 이동
    this.gameState.currentScene = 'crime-scene'
    response.sceneChange = 'crime-scene'
    
    // 범죄 현장 도착 메시지
    response.messages.push({
      type: 'system',
      content: this.storyParser.generateAtmosphericText('crime-scene')
    })

    response.messages.push({
      type: 'assistant',
      content: '홈즈! 와주셔서 감사합니다. 이상한 사건입니다. 외상 없는 시체와 벽에 피로 쓰인 "RACHE"라는 글자... 도무지 이해할 수 없습니다. 어떻게 조사를 시작하시겠습니까?',
      avatar: 'L'
    })

    return response
  }

  private handleCrimeScene(userInput: string, analysis: any): GameResponse {
    const response: GameResponse = {
      messages: [
        {
          type: 'user',
          content: userInput
        }
      ],
      choices: []
    }

    if (analysis.intent === 'examine-rache') {
      // RACHE 조사
      response.messages.push({
        type: 'assistant',
        content: '"RACHE"... 흥미롭군요. 독일어로 "복수"를 뜻합니다. 하지만 과연 그럴까요? ' + this.storyParser.generateCharacterResponse('holmes', 'rache-analysis', userInput),
        avatar: 'H'
      })

      this.addEvidence('벽에 피로 쓰인 RACHE')
      response.evidence = this.gameState.evidence

    } else if (analysis.intent === 'examine') {
      // 일반적인 조사
      const evidenceFound = this.discoverEvidence(analysis.keywords)
      
      if (evidenceFound.length > 0) {
        response.messages.push({
          type: 'assistant',
          content: `훌륭한 관찰입니다! ${evidenceFound.map(e => this.storyParser.generateEvidenceDescription(e)).join(' ')}`,
          avatar: 'H'
        })
        
        response.evidence = this.gameState.evidence
        this.gameState.score += 10
      } else {
        response.messages.push({
          type: 'assistant',
          content: this.storyParser.generateCharacterResponse('holmes', 'crime-scene', userInput),
          avatar: 'H'
        })
      }

      response.choices = this.storyParser.generateContextualChoices('crime-scene', this.gameState.evidence).map(choice => ({
        id: choice.id,
        text: choice.text,
        action: () => this.handleChoice(choice.action)
      }))

    } else {
      // 기본 응답
      response.messages.push({
        type: 'assistant',
        content: this.storyParser.generateCharacterResponse('holmes', 'crime-scene', userInput),
        avatar: 'H'
      })

      response.choices = this.storyParser.generateContextualChoices('crime-scene', this.gameState.evidence).map(choice => ({
        id: choice.id,
        text: choice.text,
        action: () => this.handleChoice(choice.action)
      }))
    }

    return response
  }

  private handleInvestigation(userInput: string, analysis: any): GameResponse {
    // 수사 단계 처리 로직
    const response: GameResponse = {
      messages: [
        {
          type: 'user',
          content: userInput
        },
        {
          type: 'assistant',
          content: this.storyParser.generateCharacterResponse('holmes', 'investigation', userInput),
          avatar: 'H'
        }
      ]
    }

    return response
  }

  private handleDeductionPhase(userInput: string, analysis: any): GameResponse {
    // 추론 단계 처리 로직
    const response: GameResponse = {
      messages: [
        {
          type: 'user',
          content: userInput
        }
      ]
    }

    if (analysis.intent === 'deduce') {
      const deduction = this.evaluateDeduction(userInput)
      response.messages.push({
        type: 'assistant',
        content: deduction.feedback,
        avatar: 'H'
      })

      if (deduction.correct) {
        this.gameState.score += 20
        this.gameState.deductions.push(userInput)
      }
    }

    return response
  }

  private handleGenericScene(userInput: string, analysis: any): GameResponse {
    return {
      messages: [
        {
          type: 'user',
          content: userInput
        },
        {
          type: 'assistant',
          content: this.storyParser.generateCharacterResponse('holmes', this.gameState.currentScene, userInput),
          avatar: 'H'
        }
      ]
    }
  }


  private discoverEvidence(keywords: string[]): string[] {
    const possibleEvidence = [
      { keywords: ['시체', 'body', '죽음'], evidence: '외상 없는 시체' },
      { keywords: ['반지', 'ring', '금'], evidence: '여자의 반지' },
      { keywords: ['독', 'poison', '중독'], evidence: '독에 의한 죽음' },
      { keywords: ['rache', '라헤', '글자'], evidence: '벽에 피로 쓰인 RACHE' }
    ]

    const found: string[] = []
    
    possibleEvidence.forEach(item => {
      if (item.keywords.some(keyword => keywords.includes(keyword)) && 
          !this.gameState.evidence.includes(item.evidence)) {
        found.push(item.evidence)
        this.addEvidence(item.evidence)
      }
    })

    return found
  }

  private addEvidence(evidence: string): void {
    if (!this.gameState.evidence.includes(evidence)) {
      this.gameState.evidence.push(evidence)
    }
  }

  private evaluateDeduction(deduction: string): { correct: boolean; feedback: string } {
    // 추론 평가 로직
    const correctDeductions = [
      'rache는 독일어가 아니라 미완성된 단어',
      '범인이 의도적으로 경찰을 혼란시키려 했다',
      '독을 이용한 계획적 살인'
    ]

    const isCorrect = correctDeductions.some(correct => 
      deduction.toLowerCase().includes(correct.toLowerCase())
    )

    return {
      correct: isCorrect,
      feedback: isCorrect 
        ? `탁월한 추론입니다, 홈즈! ${this.storyParser.getOriginalQuote('deduction')}`
        : `흥미로운 관점이지만, 다른 가능성도 고려해보시기 바랍니다. ${this.storyParser.getOriginalQuote('observation')}`
    }
  }

  getGameState(): GameState {
    return { ...this.gameState }
  }
}
