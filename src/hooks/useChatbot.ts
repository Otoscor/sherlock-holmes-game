import { useState, useCallback, useEffect } from 'react'
import { ChatbotCharacter, ChatbotMessage, ChatbotState } from '@/types/chatbot'
import { aiService } from '@/services/aiService'
import redStudyData from '@/data/cases/red-study-original.json'
import romeoJulietData from '@/data/cases/romeo-and-juliet.json'

interface StoryData {
  characters: any
}

export const useChatbot = (storyId: string, characterId: string) => {
  const [state, setState] = useState<ChatbotState>({
    currentSession: null,
    availableCharacters: [],
    isLoading: false,
    error: null
  })
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [character, setCharacter] = useState<ChatbotCharacter | null>(null)

  // 스토리 데이터 가져오기
  const getStoryData = useCallback((id: string): StoryData | null => {
    switch (id) {
      case 'red-study':
        return redStudyData as StoryData
      case 'romeo-and-juliet':
        return romeoJulietData as StoryData
      default:
        return null
    }
  }, [])

  // 캐릭터 ID로 캐릭터 찾기
  const findCharacterById = useCallback((storyData: StoryData, charId: string): ChatbotCharacter | null => {
    console.log('🔍 캐릭터 찾기:', { storyId, charId, characters: storyData.characters })
    
    if (storyId === 'red-study') {
      // 직접 키로 접근
      const found = storyData.characters[charId]
      console.log('📍 red-study 캐릭터 찾기 결과:', found)
      
      if (found) {
        return {
          id: charId,
          name: found.name,
          role: found.role || found.description,
          personality: found.personality || found.description,
          avatar: found.avatar,
          description: found.description,
          greeting: found.greeting || `안녕하세요! 저는 ${found.name}입니다.`
        }
      }
    } else if (storyId === 'romeo-and-juliet') {
      // 로미오와 줄리엣의 경우 중첩된 구조
      const families = Object.values(storyData.characters) as any[]
      for (const family of families) {
        if (family[charId]) {
          const found = family[charId]
          return {
            id: charId,
            name: found.name,
            role: found.role,
            personality: found.personality,
            avatar: found.avatar,
            description: `${found.role} - ${found.personality}`,
            greeting: found.greeting || `안녕하세요! 저는 ${found.name}입니다.`
          }
        }
      }
    }
    
    console.log('❌ 캐릭터를 찾을 수 없음:', charId)
    return null
  }, [storyId])

  // 캐릭터 초기화
  useEffect(() => {
    const initializeCharacter = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        const storyData = getStoryData(storyId)
        if (!storyData) {
          throw new Error(`스토리 '${storyId}'를 찾을 수 없습니다.`)
        }

        const foundCharacter = findCharacterById(storyData, characterId)
        if (!foundCharacter) {
          throw new Error(`캐릭터 '${characterId}'를 찾을 수 없습니다.`)
        }

        setCharacter(foundCharacter)
        
        // AI 서비스에 챗봇 모드 설정 (캐릭터 정보 포함)
        aiService.setStoryContext(storyId, 'chatbot')
        aiService.setCurrentCharacter(foundCharacter)
        
        // 초기 인사말 추가 (캐릭터별 맞춤)
        const greetingMessage: ChatbotMessage = {
          id: `greeting-${Date.now()}`,
          sender: 'character',
          characterId: foundCharacter.id,
          content: getCharacterGreeting(foundCharacter),
          timestamp: new Date(),
          emotion: 'happy'
        }
        
        setMessages([greetingMessage])
        setState(prev => ({ ...prev, isLoading: false }))
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage 
        }))
      }
    }

    if (storyId && characterId) {
      initializeCharacter()
    }
  }, [storyId, characterId, getStoryData, findCharacterById])

  // 캐릭터별 맞춤 인사말 생성
  const getCharacterGreeting = useCallback((character: ChatbotCharacter): string => {
    const name = character.name.toLowerCase()
    
    if (storyId === 'red-study') {
      if (name.includes('셜록') || name.includes('홈즈')) {
        return '*파이프를 천천히 피우며 날카로운 눈으로 당신을 관찰한다* 흥미롭군요. 베이커가 221B번지를 찾아오신 방문객이시군요. 무엇이 당신을 이곳으로 이끌었는지 궁금하네요.'
      } else if (name.includes('왓슨')) {
        return '*따뜻한 미소로 맞이하며* 안녕하세요, 친구! 베이커가에 오신 것을 환영합니다. 홈즈는 지금 사건에 몰두하고 있어서... 제가 대신 이야기 상대가 되어드릴게요. 차 한 잔 드시겠습니까?'
      } else if (name.includes('레스트레이드')) {
        return '*공책을 정리하며 고개를 든다* 아, 시민 한 분이 오셨군요. 레스트레이드 경감입니다. 혹시 신고할 사건이라도 있으신가요? 아니면 그냥 홈즈를 찾아오신 건가요?'
      } else if (name.includes('허드슨')) {
        return '*앞치마를 털며 다정하게 웃는다* 어서 오세요, 손님! 허드슨 부인입니다. 베이커가 221B번지에 오신 것을 환영해요. 홈즈 씨나 왓슨 박사를 찾으시는 건가요? 아니면 그냥 차나 한 잔 하실래요?'
      }
    } else if (storyId === 'romeo-and-juliet') {
      if (name.includes('로미오')) {
        return '*열정적인 눈빛으로* 안녕하세요, 친구! 로미오 몬태규입니다. 베로나에 오신 것을 환영해요. 이 아름다운 도시에서 사랑과 시에 대해 이야기해보지 않으실래요?'
      } else if (name.includes('줄리엣')) {
        return '*수줍게 미소지으며* 안녕하세요, 방문자님. 줄리엣 캐퓰릿입니다. 베로나는 어떠신가요? 처음 오신 건가요?'
      }
    }
    
    // 기본 인사말
    return `*${character.avatar} 표시와 함께 정중하게 인사한다* 안녕하세요! 저는 ${character.name}입니다. 만나서 반갑습니다. 무엇을 도와드릴까요?`
  }, [storyId])

  // 메시지 전송
  const sendMessage = useCallback(async (content: string) => {
    if (!character || state.isLoading) return

    // 사용자 메시지 추가
    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // AI 응답 생성
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))

      console.log('🤖 챗봇 AI 호출:', { 
        userMessage: content, 
        character: character.name,
        historyLength: conversationHistory.length 
      })

      const aiResponse = await aiService.generateResponse(content, conversationHistory)
      
      console.log('📥 챗봇 AI 응답:', aiResponse)

      // 캐릭터 응답 추가
      const characterMessage: ChatbotMessage = {
        id: `character-${Date.now()}`,
        sender: 'character',
        characterId: character.id,
        content: aiResponse.content,
        timestamp: new Date(),
        emotion: 'neutral'
      }

      setMessages(prev => [...prev, characterMessage])
      
    } catch (error) {
      console.error('AI 응답 생성 실패:', error)
      
      // 폴백 응답
      const fallbackMessage: ChatbotMessage = {
        id: `fallback-${Date.now()}`,
        sender: 'character',
        characterId: character.id,
        content: `죄송해요, 지금 답변하기 어려운 상황이네요. 다시 말씀해 주시겠어요?`,
        timestamp: new Date(),
        emotion: 'sad'
      }
      
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [character, messages, state.isLoading])

  return {
    character,
    messages,
    sendMessage,
    isLoading: state.isLoading,
    error: state.error,
    availableCharacters: state.availableCharacters
  }
}
