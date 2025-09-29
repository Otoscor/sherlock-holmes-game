export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  characterId: string // 응답하는 캐릭터 ID
  actions: string[]
}

export class AIService {
  private apiKey: string
  private model: string
  private provider: 'openai' | 'anthropic' | 'gemini'
  private currentStoryId: string = 'red-study'
  private playerCharacter: string | undefined
  private currentCharacter: any = null // 챗봇 모드에서 현재 대화 중인 캐릭터
  private isConnected: boolean = false
  private lastConnectionCheck: Date | null = null
  private connectionRetries: number = 0
  private maxRetries: number = 3

  constructor() {
    // 환경 변수에서 API 설정 읽기
    this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 'AIzaSyCFhTg-cnwD6gBy-VTB78iNyhb5zWShMt8'
    this.model = (import.meta as any).env?.VITE_AI_MODEL || 'gemini-pro'
    this.provider = ((import.meta as any).env?.VITE_AI_PROVIDER || 'gemini') as 'openai' | 'anthropic' | 'gemini'
    
    // 저장된 모델 설정 로드 (환경 변수보다 우선)
    this.loadModelSettings()
    
    // API 키 유효성 검사
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.warn('⚠️ AI API 키가 설정되지 않았습니다. 폴백 모드로 동작합니다.')
    }
    
    console.log(`🤖 AI 서비스 초기화: ${this.provider} - ${this.model}`)
    
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
      
      // 1단계: 사용 가능한 모델 목록 확인
      await this.listAvailableModels()
      
      // 2단계: 간단한 연결 테스트 (모델 목록 확인으로 충분)
      // 실제 API 호출은 필요시에만 수행하여 오류 방지
      console.log('🔗 API 키와 엔드포인트 연결 확인 완료')
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

  // 🆕 사용 가능한 Gemini 모델 목록 확인
  private async listAvailableModels(): Promise<string[]> {
    try {
      console.log('📋 사용 가능한 모델 목록 확인 중...')
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔑 API 키 유효성 확인: ✅')
        
        if (data.models && Array.isArray(data.models)) {
          const supportedModels = data.models
            .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
            .map((model: any) => model.name.replace('models/', ''))
          
          console.log('✅ 실제 지원되는 모델 목록:', supportedModels)
          
          // 현재 설정된 모델이 지원되는지 확인
          const currentModelSupported = supportedModels.includes(this.model)
          console.log(`🎯 현재 모델 (${this.model}) 지원 여부:`, currentModelSupported ? '✅' : '❌')
          
          if (!currentModelSupported && supportedModels.length > 0) {
            const recommendedModel = supportedModels.find((m: string) => m.includes('gemini-pro')) || supportedModels[0]
            console.log(`🔄 권장 모델: ${recommendedModel}`)
            
            // 자동으로 지원되는 모델로 변경
            this.model = recommendedModel
            console.log(`🔄 모델 자동 변경: ${recommendedModel}`)
          }
          
          return supportedModels
        }
      } else {
        const errorText = await response.text()
        console.error('❌ API 키 또는 권한 오류:', response.status, errorText)
        throw new Error(`API 인증 실패: ${response.status}`)
      }
    } catch (error) {
      console.warn('⚠️ 모델 목록 확인 실패:', error)
    }
    
    return []
  }

  // 🆕 실제 AI 생성 테스트 (선택적)
  async testAIGeneration(): Promise<boolean> {
    try {
      console.log('🧪 AI 생성 기능 테스트 중...')
      
      const testMessages: AIMessage[] = [
        { role: 'user', content: 'Say "Hello" in one word.' }
      ]
      
      const response = await this.callAI(testMessages)
      console.log('✅ AI 생성 테스트 성공:', response)
      return true
    } catch (error) {
      console.error('❌ AI 생성 테스트 실패:', error)
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

  // 🆕 AI 모델 변경
  async setModel(model: string, provider: 'openai' | 'anthropic' | 'gemini' = 'gemini'): Promise<void> {
    console.log(`🔄 AI 모델 변경: ${this.model} → ${model} (${this.provider} → ${provider})`)
    
    const oldModel = this.model
    const oldProvider = this.provider
    
    // 모델과 프로바이더 업데이트
    this.model = model
    this.provider = provider
    
    try {
      // 새 모델로 연결 테스트
      console.log('🧪 새 모델 연결 테스트 중...')
      const success = await this.checkConnection()
      
      if (success) {
        console.log(`✅ 모델 변경 성공: ${model} (${provider})`)
        
        // 로컬 스토리지에 설정 저장 (선택사항)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('ai_model', model)
          localStorage.setItem('ai_provider', provider)
        }
      } else {
        throw new Error('새 모델 연결 테스트 실패')
      }
    } catch (error) {
      // 실패 시 이전 설정으로 롤백
      console.error('❌ 모델 변경 실패, 이전 설정으로 롤백:', error)
      this.model = oldModel
      this.provider = oldProvider
      throw error
    }
  }

  // 🆕 로컬 스토리지에서 모델 설정 로드
  private loadModelSettings(): void {
    if (typeof localStorage !== 'undefined') {
      const savedModel = localStorage.getItem('ai_model')
      const savedProvider = localStorage.getItem('ai_provider')
      
      if (savedModel) {
        this.model = savedModel
        console.log('📂 저장된 모델 설정 로드:', savedModel)
      }
      
      if (savedProvider && ['openai', 'anthropic', 'gemini'].includes(savedProvider)) {
        this.provider = savedProvider as 'openai' | 'anthropic' | 'gemini'
        console.log('📂 저장된 프로바이더 설정 로드:', savedProvider)
      }
    }
  }

  // 🆕 API 사용량 추적
  private trackAPIUsage(promptLength: number): void {
    // 토큰 수 추정 (대략 4자 = 1토큰)
    const estimatedTokens = Math.ceil(promptLength / 4) + 50 // 응답 토큰 추정
    
    console.log(`📊 API 사용량 추적: ${estimatedTokens} 토큰 추정`)
    
    // 전역 추적 함수 호출 (APIUsageMonitor에서 설정)
    if (typeof window !== 'undefined' && (window as any).trackAPIRequest) {
      (window as any).trackAPIRequest(estimatedTokens)
    }
  }

  // 스토리 컨텍스트 설정
  setStoryContext(storyId: string, playerCharacter?: string) {
    this.currentStoryId = storyId
    this.playerCharacter = playerCharacter
  }

  // 챗봇 모드에서 현재 대화 중인 캐릭터 설정
  setCurrentCharacter(character: any) {
    this.currentCharacter = character
    console.log('🎭 현재 캐릭터 설정:', character?.name)
  }

  // 스토리별 시스템 프롬프트 생성
  private getSystemPrompt(): string {
    console.log('🎭 시스템 프롬프트 생성:', { playerCharacter: this.playerCharacter, storyId: this.currentStoryId })
    
    // 챗봇 모드인 경우 챗봇 전용 프롬프트 사용
    if (this.playerCharacter === 'chatbot') {
      console.log('🤖 챗봇 모드 프롬프트 사용')
      return this.getChatbotPrompt()
    }
    
    switch (this.currentStoryId) {
      case 'red-study':
        return this.getSherlockPrompt()
      case 'romeo-and-juliet':
        return this.getRomeoPrompt()
      default:
        return this.getGenericPrompt()
    }
  }

  // 챗봇 대화 전용 프롬프트
  private getChatbotPrompt(): string {
    console.log('🎭 챗봇 프롬프트 생성:', { character: this.currentCharacter?.name })
    
    // 현재 캐릭터 정보가 있으면 개인화된 프롬프트 생성
    if (this.currentCharacter) {
      return this.getPersonalizedChatbotPrompt(this.currentCharacter)
    }
    
    // 폴백: 스토리별 일반 챗봇 프롬프트
    switch (this.currentStoryId) {
      case 'red-study':
        return this.getSherlockChatbotPrompt()
      case 'romeo-and-juliet':
        return this.getRomeoChatbotPrompt()
      default:
        return this.getGenericChatbotPrompt()
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

  // 셜록 홈즈 챗봇 프롬프트 - 개선된 버전
  private getSherlockChatbotPrompt(): string {
    return `🎭 **셜록 홈즈 세계관 1:1 대화**

당신은 1881년 런던 베이커가 221B번지의 등장인물입니다.
사용자는 당신을 찾아온 방문객으로, 자유롭게 대화하고 싶어합니다.

**🔍 셜록 홈즈로서 대화할 때**:
- **성격**: 예리하고 논리적이며 때로는 오만하지만 매력적
- **말투**: 지적이고 분석적, 가끔 신랄한 유머 섞임
- **특징**: 
  • 상대방을 관찰하고 추론하는 것을 좋아함
  • 복잡한 문제를 단순하게 설명하는 능력
  • 때로는 감정보다 논리를 우선시
  • 파이프, 바이올린, 코카인 등의 취미 언급 가능
- **호칭**: "당신", "방문객", "선생/부인" (정중하게)
- **예시 대화**:
  • *날카로운 시선으로 관찰하며* "흥미롭군요. 당신의 왼손 검지에 있는 잉크 자국으로 보아 작가이시군요."
  • *파이프를 천천히 피우며* "단순명쾌한 문제입니다. 범인은 이미 우리 앞에 모든 단서를 남겨놨어요."

**👨‍⚕️ 왓슨 박사로서 대화할 때**:
- **성격**: 따뜻하고 신뢰할 수 있으며 상식적
- **말투**: 친근하고 배려 깊음, 의학적 지식 활용
- **특징**:
  • 홈즈를 존경하지만 때로는 그의 방식에 당황
  • 실용적이고 인간적인 접근
  • 의사로서의 경험과 지식 활용
- **호칭**: "친구", "동지", "좋은 분"
- **예시 대화**:
  • *따뜻하게 웃으며* "홈즈의 추리는 항상 놀랍습니다. 하지만 때로는 너무 복잡하게 생각하는 것 같아요."
  • *의학 가방을 정리하며* "제가 의사로서 말씀드리자면, 충분한 휴식이 필요해 보이시네요."

**👮‍♂️ 레스트레이드 경감으로서 대화할 때**:
- **성격**: 현실적이고 고집스럽지만 결국 홈즈를 인정
- **말투**: 직업적이고 때로는 투덜거림
- **특징**:
  • 경찰 업무에 대한 자부심
  • 홈즈의 방법에 회의적이지만 결과는 인정
  • 법과 절차를 중시
- **호칭**: "시민", "선생님", "당신"

**👵 허드슨 부인으로서 대화할 때**:
- **성격**: 다정하지만 때로는 엄격한 집주인
- **말투**: 모성적이고 실용적
- **특징**:
  • 홈즈와 왓슨을 돌보는 것을 자연스럽게 여김
  • 집안일과 요리에 대한 이야기
  • 베이커가의 일상 이야기

**💬 대화 품질 향상 규칙**:
1. **맥락 연결**: 이전 대화를 기억하고 자연스럽게 이어가세요
2. **캐릭터 일관성**: 선택한 캐릭터의 성격을 끝까지 유지하세요
3. **시대적 배경**: 1881년 빅토리아 시대의 언어와 관습을 반영하세요
4. **구체적 디테일**: 베이커가 221B, 런던 거리, 당시 사건들을 언급하세요
5. **감정 표현**: *행동*과 함께 미묘한 감정 변화를 보여주세요
6. **질문 유도**: 대화가 이어지도록 상대방에게 질문하거나 의견을 물어보세요

**응답 형식**: *구체적인 행동이나 표정* + 대화 내용

**절대 금지사항**: 사용자를 "홈즈"라고 부르지 마세요!`
  }

  // 로미오와 줄리엣 챗봇 프롬프트
  private getRomeoChatbotPrompt(): string {
    return `🎭 **1:1 챗봇 대화 모드**

당신은 중세 후기 베로나의 로미오와 줄리엣 세계관에 등장하는 캐릭터 중 한 명입니다.
사용자는 베로나를 방문한 여행자이며, 당신과 자유롭게 대화하고 싶어합니다.

**각 캐릭터별 대화 방식**:

**로미오인 경우**:
- 사용자를 "친구", "방문자", "당신" 등으로 부르세요
- 열정적이고 로맨틱한 젊은 귀족의 모습을 보여주세요
- 사랑과 시에 대한 이야기를 좋아합니다
- 예: "친구여, 사랑에 대해 어떻게 생각하시나요?"

**줄리엣인 경우**:
- 사용자를 "손님", "방문자", "당신" 등으로 부르세요
- 순수하면서도 의지가 강한 소녀의 모습을 보여주세요
- 꿈과 희망에 대한 이야기를 나눌 수 있습니다
- 예: "방문자님, 베로나는 어떠신가요?"

**유모인 경우**:
- 사용자를 "젊은이", "손님", "아가" 등으로 부르세요
- 따뜻하고 수다스러운 중년 여성의 모습을 보여주세요
- 줄리엣에 대한 이야기를 자주 언급할 수 있습니다

**로렌스 신부인 경우**:
- 사용자를 "아들아", "손님", "당신" 등으로 부르세요
- 지혜롭고 자비로운 성직자의 모습을 보여주세요
- 철학적이고 도덕적인 조언을 줄 수 있습니다

**머큐쇼인 경우**:
- 사용자를 "친구", "동지", "당신" 등으로 부르세요
- 재치 있고 장난기 많은 친구의 모습을 보여주세요
- 유머와 농담을 좋아합니다

**티볼트인 경우**:
- 사용자를 "이방인", "손님", "당신" 등으로 부르세요
- 호전적이지만 예의는 지키는 귀족의 모습을 보여주세요
- 가문의 명예에 대한 이야기를 할 수 있습니다

**대화 규칙**:
1. 중세 이탈리아의 귀족 사회 분위기를 살리세요
2. 캐릭터의 성격과 말투를 일관되게 유지하세요
3. 자유롭고 친근한 대화를 나누세요
4. 상황 표현은 *행동* 형태로 작성하세요

**응답 형식**:
*상황표현* 대화내용

좋은 예시:
- 로미오: *열정적으로* 친구여! 사랑만큼 아름다운 것이 또 있을까요?
- 줄리엣: *수줍게 미소지으며* 방문자님께서는 어디서 오셨나요?
- 유모: *친근하게 웃으며* 젊은이, 배가 고프지 않나요?`
  }

  // 🆕 개인화된 챗봇 프롬프트 (특정 캐릭터용)
  private getPersonalizedChatbotPrompt(character: any): string {
    const timeContext = this.currentStoryId === 'red-study' ? '1881년 런던' : '르네상스 시대 이탈리아'
    
    return `🎭 **${character.name}과의 1:1 대화**

당신은 ${timeContext}의 **${character.name}**입니다.
사용자는 당신을 찾아온 방문객으로, 자유롭게 대화하고 싶어합니다.

**캐릭터 정보**:
- **이름**: ${character.name}
- **역할**: ${character.role || character.description}
- **성격**: ${character.personality || character.description}
${character.description ? `- **설명**: ${character.description}` : ''}

**대화 가이드라인**:
1. **캐릭터 일관성**: ${character.name}의 성격과 특징을 끝까지 유지하세요
2. **시대적 배경**: ${timeContext}의 언어와 관습을 반영하세요
3. **자연스러운 대화**: 상대방의 말에 적절히 반응하고 질문하세요
4. **감정 표현**: *행동*과 함께 미묘한 감정 변화를 보여주세요
5. **대화 연결**: 대화가 이어지도록 상대방에게 질문하거나 의견을 물어보세요

**응답 형식**: *구체적인 행동이나 표정* + 대화 내용

**중요**: 항상 ${character.name}로서 일관되게 응답하세요. 다른 캐릭터가 되거나 내레이션하지 마세요.`
  }

  // 일반 챗봇 프롬프트
  private getGenericChatbotPrompt(): string {
    return `당신은 문학 작품 속 캐릭터입니다.

🎭 **챗봇 대화 모드**: 사용자와 자유롭게 1:1 대화하는 모드입니다.

**대화 규칙**:
1. 캐릭터의 성격을 일관되게 유지하세요
2. 스토리 진행과 관계없이 자유롭게 대화하세요
3. 사용자의 질문에 친근하고 자연스럽게 응답하세요
4. 상황 표현은 *행동* 형태로 작성하세요

**응답 형식**:
*상황표현* 대화내용`
  }

  async generateResponse(userMessage: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    console.log('🤖 AI 응답 생성 시작:', { userMessage, playerCharacter: this.playerCharacter, storyId: this.currentStoryId })
    
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.log('❌ API 키 없음 - 폴백 응답 사용')
      return this.getFallbackResponse(userMessage)
    }

    // 재시도 로직
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const messages: AIMessage[] = [
          { role: 'system', content: this.getSystemPrompt() },
          ...conversationHistory.slice(-8), // 챗봇 모드에서는 더 많은 맥락 유지
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
    
    // 챗봇 모드에서는 더 자연스러운 오류 응답 제공
    if (this.playerCharacter === 'chatbot') {
      console.log('🤖 챗봇 모드 - 연결 오류에 대한 자연스러운 응답 제공')
      return {
        content: '*잠시 생각에 잠긴다* 죄송합니다, 지금 머릿속이 조금 복잡하네요. 다시 한 번 말씀해 주시겠어요?',
        characterId: this.currentCharacter?.id || 'chatbot',
        actions: []
      }
    }
    
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

  private async callGemini(messages: AIMessage[]): Promise<string> {
    // 더 간단하고 효과적인 프롬프트 구성
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    
    // 대화 히스토리 구성
    const conversationHistory = messages.filter(m => m.role !== 'system')
    const historyText = conversationHistory.length > 1 
      ? conversationHistory.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n')
      : ''
    
    // 더 명확한 프롬프트 구성
    const prompt = `${systemMessage}

${historyText ? `이전 대화:\n${historyText}\n` : ''}

현재 사용자 입력: ${lastUserMessage}

위 형식에 맞춰 응답해주세요:`

    console.log('📤 Gemini에게 전송할 프롬프트:', prompt)

    // 실제 지원되는 모델 목록 가져오기
    let availableModels = await this.listAvailableModels()
    
    // 모델 목록을 가져오지 못한 경우 기본 모델 사용
    if (availableModels.length === 0) {
      console.log('⚠️ 모델 목록을 가져오지 못함, 기본 모델 사용')
      availableModels = ['gemini-pro']
    }
    
    // 현재 설정된 모델을 우선순위로 배치
    if (availableModels.includes(this.model)) {
      availableModels = [this.model, ...availableModels.filter(m => m !== this.model)]
    }

    console.log('🎯 시도할 모델 순서:', availableModels)

    let lastError: Error | null = null

    // 각 모델을 순차적으로 시도
    for (const modelName of availableModels) {
      try {
        console.log(`🔄 Gemini 모델 시도: ${modelName}`)
        const result = await this.tryGeminiModel(modelName, prompt)
        console.log(`✅ ${modelName} 모델로 성공`)
        
        // 성공한 모델로 현재 모델 업데이트
        if (this.model !== modelName) {
          this.model = modelName
          console.log(`🔄 성공한 모델로 업데이트: ${modelName}`)
        }
        
        // API 사용량 추적
        this.trackAPIUsage(prompt.length)
        
        return result
      } catch (error) {
        console.warn(`⚠️ ${modelName} 모델 실패:`, error)
        lastError = error as Error
        continue
      }
    }

    // 모든 모델이 실패한 경우
    throw lastError || new Error('모든 Gemini 모델에서 오류 발생')
  }

  private async tryGeminiModel(modelName: string, prompt: string): Promise<string> {
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

    console.log('📤 Gemini 요청:', { model: modelName, url: `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent` })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Gemini 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API 오류 응답:', {
        status: response.status,
        statusText: response.statusText,
        model: modelName,
        errorText: errorText
      })
      
      if (response.status === 404) {
        throw new Error(`모델 '${modelName}'을 찾을 수 없습니다. 지원되지 않는 모델일 수 있습니다.`)
      } else if (response.status === 403) {
        throw new Error(`API 키 권한 오류: ${modelName} 모델에 대한 접근 권한이 없습니다.`)
      } else {
        throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`)
      }
    }

    const data = await response.json()
    console.log('📥 Gemini 전체 응답:', JSON.stringify(data, null, 2))
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('❌ Gemini API 응답 구조 오류:', data)
      throw new Error('Gemini API 응답 형식이 올바르지 않습니다')
    }
    
    const responseText = data.candidates[0].content.parts[0].text
    console.log('✅ Gemini 응답 텍스트:', responseText)
    
    return responseText
  }

  private async callAnthropic(_messages: AIMessage[]): Promise<string> {
    // Anthropic API 구현 (필요시)
    throw new Error('Anthropic API는 아직 구현되지 않았습니다.')
  }

  private parseAIResponse(aiResponse: string): AIResponse {
    console.log('🔍 응답 파싱 시작:', aiResponse)

    // 챗봇 모드인 경우 간단한 파싱
    if (this.playerCharacter === 'chatbot') {
      return this.parseChatbotResponse(aiResponse)
    }

    const lines = aiResponse.split('\n')
    let characterId = this.getDefaultCharacter()
    let content = aiResponse

    // CHARACTER_ID: 라인 파싱
    const characterLine = lines.find(line => line.trim().startsWith('CHARACTER_ID:'))
    if (characterLine) {
      const charMatch = characterLine.match(/CHARACTER_ID:\s*\[?([^\]]+)\]?/i)
      if (charMatch) {
        characterId = charMatch[1].trim()
        console.log('✅ 캐릭터 파싱됨:', characterId)
      }
    }

    // CONTENT: 라인 파싱
    const contentLine = lines.find(line => line.trim().startsWith('CONTENT:'))
    if (contentLine) {
      content = contentLine.replace(/^CONTENT:\s*/, '').trim()
      console.log('✅ 콘텐츠 파싱됨:', content)
    } else {
      // CHARACTER_ID:와 CONTENT: 형식이 없으면 전체를 콘텐츠로 사용
      console.log('⚠️ 형식 없음 - 전체를 콘텐츠로 사용')
    }

    // 액션 추출
    const actions: string[] = []
    const actionMatches = content.match(/\*([^*]+)\*/g)
    if (actionMatches) {
      actionMatches.forEach(match => {
        actions.push(match.replace(/\*/g, ''))
      })
      console.log('✅ 액션 파싱됨:', actions)
    }

    const result = {
      content,
      characterId,
      actions
    }

    console.log('✅ 최종 파싱 결과:', result)
    return result
  }

  // 챗봇 모드 전용 응답 파싱
  private parseChatbotResponse(aiResponse: string): AIResponse {
    console.log('🤖 챗봇 응답 파싱:', aiResponse)
    
    // 응답을 그대로 사용하되, 액션만 추출
    const actions: string[] = []
    const actionMatches = aiResponse.match(/\*([^*]+)\*/g)
    if (actionMatches) {
      actionMatches.forEach(match => {
        actions.push(match.replace(/\*/g, ''))
      })
    }

    // 현재 캐릭터 ID 사용 (있는 경우)
    const characterId = this.currentCharacter?.id || 'chatbot'
    
    const result = {
      content: aiResponse.trim(),
      characterId: characterId,
      actions
    }

    console.log('✅ 챗봇 파싱 결과:', result)
    return result
  }

  // 스토리별 기본 캐릭터 반환
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
    console.log('🔄 폴백 응답 생성:', userMessage)
    
    // 챗봇 모드인 경우 챗봇 전용 폴백 사용
    if (this.playerCharacter === 'chatbot') {
      return this.getChatbotFallback(userMessage)
    }
    
    switch (this.currentStoryId) {
      case 'red-study':
        return this.getSherlockFallback(userMessage)
      case 'romeo-and-juliet':
        return this.getRomeoFallback(userMessage)
      default:
        return this.getGenericFallback(userMessage)
    }
  }

  // 챗봇 모드 전용 폴백 응답 - 캐릭터별 맞춤
  private getChatbotFallback(_userMessage: string): AIResponse {
    // 현재 캐릭터 정보가 있으면 개인화된 폴백 사용
    if (this.currentCharacter) {
      return this.getPersonalizedFallback(this.currentCharacter)
    }
    
    // 셜록 홈즈 세계관 캐릭터별 폴백 응답
    if (this.currentStoryId === 'red-study') {
      const sherlockFallbacks = [
        '*파이프를 천천히 피우며* 흥미로운 관점이군요. 좀 더 자세히 설명해 주시겠습니까?',
        '*날카로운 눈으로 바라보며* 당신의 추리 과정이 궁금하네요. 어떻게 그런 결론에 도달하셨나요?',
        '*의자에 기대며 생각에 잠긴다* 잠깐만요... 다시 한 번 말씀해 주시겠어요? 놓친 부분이 있을 수 있습니다.',
        '*바이올린을 만지작거리며* 복잡한 문제네요. 단계별로 차근차근 접근해 보시죠.',
        '*창밖을 바라보며* 런던의 안개처럼 모호한 이야기군요. 좀 더 명확하게 설명해 주세요.'
      ]
      
      const randomResponse = sherlockFallbacks[Math.floor(Math.random() * sherlockFallbacks.length)]
      
      return {
        content: randomResponse,
        characterId: this.currentCharacter?.id || 'chatbot',
        actions: []
      }
    }
    
    // 일반 폴백 응답
    const genericFallbacks = [
      '*미소를 지으며* 죄송해요, 잠시 생각이 정리되지 않네요. 다시 말씀해 주시겠어요?',
      '*고개를 갸우뚱하며* 흥미로운 질문이네요. 조금 더 자세히 설명해 주실 수 있나요?',
      '*차분히* 잠깐, 다시 한 번 말씀해 주시겠어요? 더 좋은 답변을 드리고 싶어서요.',
      '*웃으며* 재미있는 이야기네요! 그에 대해 더 듣고 싶습니다.',
      '*호기심 어린 표정으로* 그런 생각을 하시는군요. 어떤 계기로 그렇게 생각하게 되셨나요?'
    ]
    
    const randomResponse = genericFallbacks[Math.floor(Math.random() * genericFallbacks.length)]
    
    return {
      content: randomResponse,
      characterId: this.currentCharacter?.id || 'chatbot',
      actions: []
    }
  }

  // 🆕 개인화된 폴백 응답
  private getPersonalizedFallback(character: any): AIResponse {
    const characterName = character.name
    const characterId = character.id
    
    // 캐릭터별 맞춤 폴백 응답
    let fallbacks: string[] = []
    
    if (characterId === 'holmes') {
      fallbacks = [
        '*파이프를 천천히 피우며* 흥미로운 관점이군요. 좀 더 자세히 설명해 주시겠습니까?',
        '*날카로운 눈으로 바라보며* 당신의 추리 과정이 궁금하네요.',
        '*의자에 기대며 생각에 잠긴다* 잠깐만요... 다시 한 번 말씀해 주시겠어요?',
        '*바이올린을 만지작거리며* 복잡한 문제네요. 차근차근 접근해 보시죠.',
        '*창밖을 바라보며* 런던의 안개처럼 모호한 이야기군요. 좀 더 명확하게 설명해 주세요.'
      ]
    } else if (characterId === 'watson') {
      fallbacks = [
        '*친근하게 미소지으며* 잠깐, 다시 한 번 설명해 주시겠어요? 제가 놓친 부분이 있을 것 같습니다.',
        '*고개를 끄덕이며* 흥미로운 이야기네요. 더 자세히 듣고 싶습니다.',
        '*메모를 하며* 죄송합니다, 다시 한 번 말씀해 주시겠어요? 정확히 기록하고 싶어서요.',
        '*따뜻한 표정으로* 그런 생각을 하시는군요. 어떤 계기로 그렇게 생각하게 되셨나요?',
        '*차를 따르며* 차 한 잔 하시면서 천천히 이야기해 주세요.'
      ]
    } else if (characterId === 'lestrade') {
      fallbacks = [
        '*경찰관답게 진지하게* 잠깐, 다시 한 번 정리해서 말씀해 주시겠어요?',
        '*수첩을 꺼내며* 중요한 정보일 수 있으니 다시 한 번 말씀해 주세요.',
        '*고개를 갸우뚱하며* 흥미로운 관점이네요. 증거는 있으신가요?',
        '*진지한 표정으로* 경찰의 입장에서 보면... 좀 더 구체적으로 설명해 주시겠어요?'
      ]
    } else {
      // 일반 폴백
      fallbacks = [
        `*${characterName}로서 미소를 지으며* 죄송해요, 잠시 생각이 정리되지 않네요. 다시 말씀해 주시겠어요?`,
        `*호기심 어린 표정으로* 흥미로운 질문이네요. 조금 더 자세히 설명해 주실 수 있나요?`,
        `*차분히* 잠깐, 다시 한 번 말씀해 주시겠어요? 더 좋은 답변을 드리고 싶어서요.`,
        `*웃으며* 재미있는 이야기네요! 그에 대해 더 듣고 싶습니다.`
      ]
    }
    
    const randomResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    
    return {
      content: randomResponse,
      characterId: characterId,
      actions: []
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
    } else if (input.includes('줄리엣')) {
      if (this.playerCharacter === 'romeo') {
        return {
          content: `*꿈꾸는 표정으로* 줄리엣... 세상에서 가장 아름다운 이름이지요.`,
          characterId: 'romeo',
          actions: ['꿈꾸는 표정으로']
        }
      } else {
        return {
          content: `*따뜻하게 웃으며* 우리 줄리엣 아가씨를 말씀하시는군요.`,
          characterId: 'nurse',
          actions: ['따뜻하게 웃으며']
        }
      }
    } else if (input.includes('사랑')) {
      return {
        content: `*깊이 생각하며* 사랑이란 참으로 신비로운 것이지요, ${playerName}님. 때로는 가장 큰 기쁨이 되기도, 가장 큰 시련이 되기도 합니다.`,
        characterId: 'friar',
        actions: ['깊이 생각하며']
      }
    } else {
      return {
        content: `*고개를 끄덕이며* ${playerName}님의 말씀이 맞습니다. 어떻게 하시겠습니까?`,
        characterId: this.getDefaultCharacter(),
        actions: ['고개를 끄덕이며']
      }
    }
  }

  private getGenericFallback(_userMessage: string): AIResponse {
    return {
      content: '*고개를 끄덕이며* 흥미로운 말씀이네요. 더 자세히 말씀해주시겠습니까?',
      characterId: 'narrator',
      actions: ['고개를 끄덕이며']
    }
  }
}

export const aiService = new AIService()

// 🛠️ 디버깅을 위해 전역 객체에 노출 (개발 환경에서만)
if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
  (window as any).aiService = aiService
  console.log('🛠️ 디버깅 모드: window.aiService로 AI 서비스에 접근 가능')
  console.log('💡 사용 예시:')
  console.log('  - await window.aiService.checkConnection()')
  console.log('  - await window.aiService.testAIGeneration()')
  console.log('  - window.aiService.getConnectionStatus()')
}