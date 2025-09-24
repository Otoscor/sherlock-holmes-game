export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  character: 'watson' | 'lestrade' | 'npc' // 🆕 홈즈는 사용자 전용
  actions: string[]
}

export class AIService {
  private apiKey: string
  private model: string
  private provider: 'openai' | 'anthropic' | 'gemini'
  private systemPrompt: string

  constructor() {
    // 환경 변수에서 API 설정 읽기
    this.apiKey = 'AIzaSyCFhTg-cnwD6gBy-VTB78iNyhb5zWShMt8'
    this.model = 'gemini-1.5-flash'
    this.provider = 'gemini'
    
    this.systemPrompt = `당신은 1881년 런던의 셜록 홈즈 세계관에서 활동하는 캐릭터들입니다. 
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
CHARACTER: [watson/lestrade/npc]
CONTENT: *상황표현* 대화내용`
  }

  async generateResponse(userMessage: string, conversationHistory: AIMessage[] = []): Promise<AIResponse> {
    console.log('🤖 AI 응답 생성 시작:', userMessage)
    
    if (!this.apiKey) {
      console.log('❌ API 키 없음 - 폴백 응답 사용')
      return this.getFallbackResponse(userMessage)
    }

    try {
      const messages: AIMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory.slice(-6), // 최근 6개 메시지만 유지
        { role: 'user', content: userMessage }
      ]

      console.log('📤 AI API 호출 중...', { provider: this.provider, model: this.model })
      const response = await this.callAI(messages)
      console.log('📥 AI 응답 받음:', response)
      
      const parsedResponse = this.parseAIResponse(response)
      console.log('✅ 파싱된 응답:', parsedResponse)
      
      return parsedResponse
    } catch (error) {
      console.error('❌ AI API 호출 오류:', error)
      console.log('🔄 폴백 응답으로 전환')
      return this.getFallbackResponse(userMessage)
    }
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

    console.log('📤 Gemini 요청:', { model: this.model, url: `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent` })

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Gemini 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API 오류 응답:', errorText)
      throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`)
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
    
    const lines = aiResponse.split('\n')
    let character: 'watson' | 'lestrade' | 'npc' = 'watson' // 🆕 홈즈는 사용자 전용
    let content = aiResponse
    
    // CHARACTER: 라인 파싱
    const characterLine = lines.find(line => line.trim().startsWith('CHARACTER:'))
    if (characterLine) {
      const charMatch = characterLine.match(/CHARACTER:\s*(watson|lestrade|npc)/i)
      if (charMatch) {
        character = charMatch[1].toLowerCase() as 'watson' | 'lestrade' | 'npc'
        console.log('✅ 캐릭터 파싱됨:', character)
      }
    }

    // CONTENT: 라인 파싱
    const contentLine = lines.find(line => line.trim().startsWith('CONTENT:'))
    if (contentLine) {
      content = contentLine.replace(/^CONTENT:\s*/, '').trim()
      console.log('✅ 콘텐츠 파싱됨:', content)
    } else {
      // CHARACTER:와 CONTENT: 형식이 없으면 전체를 콘텐츠로 사용
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
      character,
      actions
    }
    
    console.log('✅ 최종 파싱 결과:', result)
    return result
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    console.log('🔄 폴백 응답 생성:', userMessage)
    
    const input = userMessage.toLowerCase()
    
    // 더 다양한 폴백 응답
    if (input.includes('rache') || input.includes('라헤')) {
      return {
        content: '*벽을 가리키며* 홈즈님, "RACHE"는 독일어로 복수를 뜻합니다. 이것이 진짜 단서일까요?',
        character: 'watson',
        actions: ['벽을 가리키며']
      }
    } else if (input.includes('시체') || input.includes('죽음')) {
      return {
        content: '*시체를 검시하며* 홈즈님, 외상이 없는데도 죽었다는 것이 이상합니다. 독살 가능성을 배제할 수 없어요.',
        character: 'watson',
        actions: ['시체를 검시하며']
      }
    } else if (input.includes('조사') || input.includes('살펴')) {
      return {
        content: '*주변을 둘러보며* 홈즈님, 좋은 생각입니다. 더 자세히 조사해보죠. 놓친 단서가 있을 수 있습니다.',
        character: 'lestrade',
        actions: ['주변을 둘러보며']
      }
    } else if (input.includes('안녕') || input.includes('hello')) {
      return {
        content: '*정중하게 인사하며* 안녕하세요, 홈즈님! 이 미스터리한 사건에 대해 이야기해봅시다.',
        character: 'watson',
        actions: ['정중하게 인사하며']
      }
    } else {
      // 랜덤 응답으로 다양성 추가
      const randomResponses = [
        {
          content: '*메모장을 꺼내며* 홈즈님, 그렇게 생각하시는군요. 이것도 중요한 단서가 될 수 있을 것 같습니다.',
          character: 'watson' as const,
          actions: ['메모장을 꺼내며']
        },
        {
          content: '*턱수염을 만지며* 홈즈님, 경찰 입장에서는 더 구체적인 증거가 필요하지만, 흥미로운 관찰이네요.',
          character: 'lestrade' as const,
          actions: ['턱수염을 만지며']
        },
        {
          content: '*고개를 끄덕이며* 홈즈님의 추리력은 정말 대단합니다. 더 자세히 설명해주시겠습니까?',
          character: 'watson' as const,
          actions: ['고개를 끄덕이며']
        }
      ]
      
      return randomResponses[Math.floor(Math.random() * randomResponses.length)]
    }
  }
}

export const aiService = new AIService()