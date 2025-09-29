// 클라이언트의 AI 서비스와 동일한 코드를 서버에서 사용
// 환경 변수만 서버 환경에 맞게 수정

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  characterId: string
  actions: string[]
}

export class AIService {
  private apiKey: string
  private model: string
  private provider: 'openai' | 'anthropic' | 'gemini'
  private currentStoryId: string = 'red-study'
  private playerCharacter: string | undefined
  private isConnected: boolean = false
  private lastConnectionCheck: Date | null = null
  private connectionRetries: number = 0
  private maxRetries: number = 3

  constructor() {
    // 서버 환경 변수에서 API 설정 읽기
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCFhTg-cnwD6gBy-VTB78iNyhb5zWShMt8'
    this.model = process.env.AI_MODEL || 'gemini-1.5-flash'
    this.provider = (process.env.AI_PROVIDER || 'gemini') as 'openai' | 'anthropic' | 'gemini'
    
    // API 키 유효성 검사
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.warn('⚠️ AI API 키가 설정되지 않았습니다. 폴백 모드로 동작합니다.')
    }
    
    // 초기 연결 테스트
    this.checkConnection()
  }

  // 서버 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      this.isConnected = false
      return false
    }

    try {
      console.log('🔍 서버 연결 상태 확인 중...')
      
      // 간단한 테스트 메시지로 연결 확인
      const testMessages: AIMessage[] = [
        { role: 'user', content: 'test' }
      ]
      
      await this.callAI(testMessages)
      this.isConnected = true
      this.lastConnectionCheck = new Date()
      this.connectionRetries = 0
      
      console.log('✅ 서버 연결 성공')
      return true
    } catch (error) {
      this.isConnected = false
      console.error('❌ 서버 연결 실패:', error)
      return false
    }
  }

  // 연결 상태 반환
  getConnectionStatus(): { isConnected: boolean; lastCheck: Date | null; provider: string; model: string } {
    return {
      isConnected: this.isConnected,
      lastCheck: this.lastConnectionCheck,
      provider: this.provider,
      model: this.model
    }
  }

  // 스토리 컨텍스트 설정
  setStoryContext(storyId: string, playerCharacter?: string) {
    this.currentStoryId = storyId
    this.playerCharacter = playerCharacter
  }

  // 스토리별 시스템 프롬프트 생성
  private getSystemPrompt(): string {
    switch (this.currentStoryId) {
      case 'red-study':
        return this.getSherlockPrompt()
      case 'romeo-and-juliet':
        return this.getRomeoPrompt()
      default:
        return this.getGenericPrompt()
    }
  }

  private getSherlockPrompt(): string {
    return `당신은 1881년 런던의 셜록 홈즈 세계관에서 활동하는 캐릭터들입니다. 
🎭 중요: 사용자는 항상 "셜록 홈즈"입니다. 사용자를 홈즈로 대하고 응답하세요.

캐릭터 설정:
- 플레이어: 셜록 홈즈 (사용자가 조작하는 캐릭터)
- 왓슨 박사: 의사, 따뜻함, 실용적, 홈즈의 절친한 동료이자 조력자
- 레스트레이드 경감: 스코틀랜드 야드 경찰, 현실적, 홈즈를 존경하지만 때로는 의존적
- 기타 NPC들: 증인, 용의자, 관련 인물들

응답 규칙:
1. 사용자를 항상 "홈즈", "홈즈님", "셜록"으로 호칭하세요
2. 사용자의 추리와 관찰에 적절히 반응하고 협력하세요
3. 상황 표현은 *행동* 형태로 작성하세요
4. 1881년 빅토리아 시대 런던의 분위기를 살려주세요
5. 현재 사건: 로리스턴 가든 3번지에서 외상 없는 시체 발견, 벽에 "RACHE" 글자
6. 홈즈(사용자)의 천재적 추리력을 인정하고 존경하는 태도로 응답하세요

응답 형식:
CHARACTER_ID: [watson/lestrade/witness]
CONTENT: *상황표현* 대화내용`
  }

  private getRomeoPrompt(): string {
    const playerName = this.playerCharacter === 'romeo' ? '로미오' : 
                      this.playerCharacter === 'juliet' ? '줄리엣' : '플레이어'
    
    return `당신은 중세 후기 베로나의 로미오와 줄리엣 세계관에서 활동하는 캐릭터들입니다.
🎭 중요: 사용자는 "${playerName}"입니다. 사용자를 ${playerName}로 대하고 응답하세요.

스토리 배경:
- 시대: 중세 후기 이탈리아 베로나
- 상황: 몬태규 가문과 캐퓰릿 가문의 오랜 원수 관계
- 분위기: 로맨틱하면서도 긴장감 있는 가족 갈등

주요 캐릭터:
- 로미오: 몬태규 가의 아들, 열정적이고 로맨틱한 젊은 귀족
- 줄리엣: 캐퓰릿 가의 딸, 순수하면서도 의지가 강한 소녀  
- 유모: 줄리엣의 유모, 따뜻하고 수다스러운 중년 여성
- 로렌스 신부: 프란체스코회 수사, 지혜롭고 자비로운
- 머큐쇼: 로미오의 친구, 재치 있고 장난기 많은
- 티볼트: 줄리엣의 사촌, 호전적이고 가문의 명예를 중시

응답 규칙:
1. 사용자를 "${playerName}", "${playerName}님"으로 호칭하세요
2. 중세 이탈리아의 귀족 사회 분위기를 살려주세요
3. 상황 표현은 *행동* 형태로 작성하세요
4. 가문 간의 갈등과 사랑의 딜레마를 잘 표현하세요
5. 각 캐릭터의 성격과 관계를 정확히 반영하세요
6. 원작의 비극적 결말을 피하고 새로운 가능성을 제시하세요

응답 형식:
CHARACTER_ID: [romeo/juliet/nurse/friar/mercutio/tybalt]
CONTENT: *상황표현* 대화내용`
  }

  private getGenericPrompt(): string {
    return `당신은 문학 작품 속 캐릭터들입니다.
사용자와 함께 이야기를 만들어가며, 각 캐릭터의 성격을 살려 응답하세요.

응답 형식:
CHARACTER_ID: [character_id]
CONTENT: *상황표현* 대화내용`
  }

  async generateResponse(userMessage: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    console.log('🤖 AI 응답 생성 시작:', userMessage)
    
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.log('❌ API 키 없음 - 폴백 응답 사용')
      return this.getFallbackResponse(userMessage)
    }

    // 재시도 로직
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const messages: AIMessage[] = [
          { role: 'system', content: this.getSystemPrompt() },
          ...conversationHistory.slice(-6), // 최근 6개 메시지만 유지
          { role: 'user', content: userMessage }
        ]

        console.log(`📤 AI API 호출 중... (시도 ${attempt + 1}/${this.maxRetries + 1})`, { provider: this.provider, model: this.model })
        const response = await this.callAI(messages)
        console.log('📥 AI 응답 받음:', response)
        
        const parsedResponse = this.parseAIResponse(response)
        console.log('✅ 파싱된 응답:', parsedResponse)
        
        // 성공 시 연결 상태 업데이트
        this.isConnected = true
        this.connectionRetries = 0
        this.lastConnectionCheck = new Date()
        
        return parsedResponse
      } catch (error) {
        console.error(`❌ AI API 호출 오류 (시도 ${attempt + 1}):`, error)
        this.connectionRetries++
        
        // 마지막 시도가 아니라면 잠시 대기
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // 지수 백오프
          console.log(`⏳ ${delay}ms 대기 후 재시도...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // 모든 재시도 실패 시
    this.isConnected = false
    console.log('🔄 모든 재시도 실패 - 폴백 응답으로 전환')
    return this.getFallbackResponse(userMessage)
  }

  private async callAI(messages: AIMessage[]): Promise<string> {
    if (this.provider === 'openai') {
      return this.callOpenAI(messages)
    } else if (this.provider === 'gemini') {
      return this.callGemini(messages)
    } else {
      return this.callAnthropic(messages)
    }
  }

  private async callGemini(messages: AIMessage[]): Promise<string> {
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    
    const conversationHistory = messages.filter(m => m.role !== 'system')
    const historyText = conversationHistory.length > 1 
      ? conversationHistory.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n')
      : ''
    
    const prompt = `${systemMessage}

${historyText ? `이전 대화:\n${historyText}\n` : ''}

현재 사용자 입력: ${lastUserMessage}

위 형식에 맞춰 응답해주세요:`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 300,
        candidateCount: 1
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Gemini API 응답 형식이 올바르지 않습니다')
    }
    
    return data.candidates[0].content.parts[0].text
  }

  private async callOpenAI(messages: AIMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: 300,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callAnthropic(_messages: AIMessage[]): Promise<string> {
    throw new Error('Anthropic API는 아직 구현되지 않았습니다.')
  }

  private parseAIResponse(aiResponse: string): AIResponse {
    const lines = aiResponse.split('\n')
    let characterId = this.getDefaultCharacter()
    let content = aiResponse

    // CHARACTER_ID: 라인 파싱
    const characterLine = lines.find(line => line.trim().startsWith('CHARACTER_ID:'))
    if (characterLine) {
      const charMatch = characterLine.match(/CHARACTER_ID:\s*\[?([^\]]+)\]?/i)
      if (charMatch) {
        characterId = charMatch[1].trim()
      }
    }

    // CONTENT: 라인 파싱
    const contentLine = lines.find(line => line.trim().startsWith('CONTENT:'))
    if (contentLine) {
      content = contentLine.replace(/^CONTENT:\s*/, '').trim()
    }

    // 액션 추출
    const actions: string[] = []
    const actionMatches = content.match(/\*([^*]+)\*/g)
    if (actionMatches) {
      actionMatches.forEach(match => {
        actions.push(match.replace(/\*/g, ''))
      })
    }

    return {
      content,
      characterId,
      actions
    }
  }

  private getDefaultCharacter(): string {
    switch (this.currentStoryId) {
      case 'red-study':
        return 'watson'
      case 'romeo-and-juliet':
        return this.playerCharacter === 'romeo' ? 'juliet' : 'nurse'
      default:
        return 'narrator'
    }
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    switch (this.currentStoryId) {
      case 'red-study':
        return this.getSherlockFallback(userMessage)
      case 'romeo-and-juliet':
        return this.getRomeoFallback(userMessage)
      default:
        return this.getGenericFallback(userMessage)
    }
  }

  private getSherlockFallback(userMessage: string): AIResponse {
    const input = userMessage.toLowerCase()

    if (input.includes('rache') || input.includes('라헤')) {
      return {
        content: '*벽을 가리키며* 홈즈님, "RACHE"는 독일어로 복수를 뜻합니다. 이것이 진짜 단서일까요?',
        characterId: 'watson',
        actions: ['벽을 가리키며']
      }
    } else if (input.includes('시체') || input.includes('죽음')) {
      return {
        content: '*시체를 검시하며* 홈즈님, 외상이 없는데도 죽었다는 것이 이상합니다. 독살 가능성을 배제할 수 없어요.',
        characterId: 'watson',
        actions: ['시체를 검시하며']
      }
    } else {
      return {
        content: '*메모장을 꺼내며* 홈즈님, 그렇게 생각하시는군요. 이것도 중요한 단서가 될 수 있을 것 같습니다.',
        characterId: 'watson',
        actions: ['메모장을 꺼내며']
      }
    }
  }

  private getRomeoFallback(userMessage: string): AIResponse {
    const input = userMessage.toLowerCase()
    const playerName = this.playerCharacter === 'romeo' ? '로미오' : 
                      this.playerCharacter === 'juliet' ? '줄리엣' : '님'

    if (input.includes('로미오')) {
      if (this.playerCharacter === 'juliet') {
        return {
          content: `*부끄러워하며* 로미오... 그분의 이름만 들어도 가슴이 두근거려요.`,
          characterId: 'juliet',
          actions: ['부끄러워하며']
        }
      } else {
        return {
          content: `*미소지으며* 로미오님, 어떤 일로 그분을 찾으시는지요?`,
          characterId: 'nurse',
          actions: ['미소지으며']
        }
      }
    } else {
      return {
        content: `*고개를 끄덕이며* ${playerName}님의 말씀이 맞습니다. 어떻게 하시겠습니까?`,
        characterId: this.getDefaultCharacter(),
        actions: ['고개를 끄덕이며']
      }
    }
  }

  private getGenericFallback(userMessage: string): AIResponse {
    return {
      content: '*고개를 끄덕이며* 흥미로운 말씀이네요. 더 자세히 말씀해주시겠습니까?',
      characterId: 'narrator',
      actions: ['고개를 끄덕이며']
    }
  }
}

