import { useState, useCallback, useRef } from 'react'
import { ChatMessageProps } from '@/components/ChatMessage'
import { aiService, AIMessage } from '@/services/aiService'

export interface GameState {
  currentScene: string
  messages: ChatMessageProps[]
  playerName: string
  caseProgress: number
  evidence: string[]
  isInputDisabled: boolean
  score: number
  hintsUsed: number
  storyProgress: number // 🆕 스토리 진행도 추가
  completedKeywords: string[] // 🆕 완료된 키워드들
}

const initialGameState: GameState = {
  currentScene: 'intro',
  messages: [],
  playerName: '셜록 홈즈',
  caseProgress: 0,
  evidence: [],
  isInputDisabled: false,
  score: 0,
  hintsUsed: 0,
  storyProgress: 0, // 🆕 초기 진행도 0%
  completedKeywords: [] // 🆕 빈 배열로 시작
}

export const useGameState = (_caseId?: string) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const conversationHistory = useRef<AIMessage[]>([])

  const addMessage = useCallback((message: Omit<ChatMessageProps, 'timestamp'>) => {
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { ...message, timestamp: new Date() }]
    }))
  }, [])

  const addEvidence = useCallback((evidence: string) => {
    setGameState(prev => ({
      ...prev,
      evidence: [...prev.evidence, evidence]
    }))
  }, [])

  const setInputDisabled = useCallback((disabled: boolean) => {
    setGameState(prev => ({
      ...prev,
      isInputDisabled: disabled
    }))
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setGameState(prev => ({
      ...prev,
      caseProgress: Math.min(100, Math.max(0, progress))
    }))
  }, [])

  const resetGame = useCallback(() => {
    setGameState(initialGameState)
  }, [])

  // 🆕 스토리 진행도 업데이트 함수
  const updateStoryProgress = useCallback((userMessage: string) => {
    const keywords = userMessage.toLowerCase()
    
    // 주홍색 연구의 핵심 키워드들
    const storyKeywords = [
      'rache', '라헤', '시체', '로리스턴', '레스트레이드', 
      '왓슨', '홈즈', '독', '반지', '조사', '추리', '관찰',
      '경감', '스코틀랜드', '야드', '베이커', '221b', '의사',
      '아프가니스탄', '상처', '군의관', '복수', '독일어',
      '중독', '알칼로이드', '증거', '단서', '범인'
    ]
    
    let newProgress = gameState.storyProgress
    let newCompletedKeywords = [...gameState.completedKeywords]
    let progressIncreased = false
    
    storyKeywords.forEach(keyword => {
      if (keywords.includes(keyword) && !gameState.completedKeywords.includes(keyword)) {
        newCompletedKeywords.push(keyword)
        newProgress += (100 / storyKeywords.length) // 각 키워드마다 약 4% 진행
        progressIncreased = true
      }
    })
    
    if (progressIncreased) {
      setGameState(prev => ({
        ...prev,
        storyProgress: Math.min(100, newProgress),
        completedKeywords: newCompletedKeywords
      }))
      
      // 진행도 업데이트 시 시스템 메시지 추가 (선택적)
      if (Math.floor(newProgress) % 20 === 0 && Math.floor(newProgress) > Math.floor(gameState.storyProgress)) {
        setTimeout(() => {
          addMessage({
            type: 'system',
            content: `📖 스토리 진행도: ${Math.round(newProgress)}% - 주홍색 연구의 미스터리가 점점 풀리고 있습니다!`
          })
        }, 2000)
      }
    }
  }, [gameState.storyProgress, gameState.completedKeywords, addMessage])

  // 게임 초기화 (사건별 시작 메시지)
  const initializeGame = useCallback(async (caseId: string) => {
    resetGame()
    conversationHistory.current = []
    
    // 사건별 초기 설정
    switch (caseId) {
      case 'red-study':
        addMessage({
          type: 'system',
          content: '1881년, 런던 베이커가 221B번지'
        })
        addMessage({
          type: 'assistant',
          content: `*신문을 내려놓으며* 좋은 아침입니다, 홈즈! 스코틀랜드 야드에서 연락이 왔습니다. 

로리스턴 가든 3번지에서 의문의 시체가 발견되었다고 합니다. 현장에는 외상이 없는데도 한 남자가 죽어있었고, 벽에는 "RACHE"라는 글자가 피로 쓰여져 있었다고 하네요.

레스트레이드 경감이 당신의 도움을 요청했습니다.

어떻게 하시겠습니까?`,
          avatar: 'W',
          speaker: '왓슨 박사'
        })
        
        // 초기 대화 히스토리에 추가
        conversationHistory.current.push({
          role: 'assistant',
          content: '왓슨이 홈즈에게 새로운 사건에 대해 알려주었습니다.'
        })
        
        setInputDisabled(false)
        break
        
      default:
        addMessage({
          type: 'system',
          content: '새로운 사건이 시작됩니다...'
        })
        addMessage({
          type: 'assistant',
          content: '안녕하세요, 셜록 홈즈님. 새로운 미스터리가 당신을 기다리고 있습니다.',
          avatar: 'W',
          speaker: '왓슨 박사'
        })
    }
  }, [addMessage, setInputDisabled, resetGame])

  // 증거 발견 체크 함수
  const checkForEvidence = useCallback((input: string): string[] => {
    const evidence = []
    const inputLower = input.toLowerCase()
    
    if (inputLower.includes('rache') && !gameState.evidence.includes('벽에 피로 쓰인 RACHE')) {
      evidence.push('벽에 피로 쓰인 RACHE')
    }
    if (inputLower.includes('시체') && !gameState.evidence.includes('외상 없는 시체')) {
      evidence.push('외상 없는 시체')
    }
    if (inputLower.includes('반지') && !gameState.evidence.includes('여자의 결혼반지')) {
      evidence.push('여자의 결혼반지')
    }
    if (inputLower.includes('독') && !gameState.evidence.includes('독에 의한 죽음')) {
      evidence.push('독에 의한 죽음')
    }
    
    return evidence
  }, [gameState.evidence])

  // 사용자 메시지 처리 (실제 AI 기반 시스템)
  const processUserMessage = useCallback(async (message: string) => {
    // 사용자 메시지 추가
    addMessage({
      type: 'user',
      content: message
    })

    // 🆕 스토리 진행도 업데이트
    updateStoryProgress(message)

    // 대화 히스토리에 추가
    conversationHistory.current.push({
      role: 'user',
      content: message
    })

    // AI 응답 생성 (실제 API 호출)
    try {
      const aiResponse = await aiService.generateResponse(message, conversationHistory.current)
      
      // 캐릭터별 아바타 및 스피커 설정 (홈즈는 사용자 전용)
      let avatar = 'W'
      let speaker = '왓슨 박사'
      
      switch (aiResponse.character) {
        case 'watson':
          avatar = 'W'
          speaker = '왓슨 박사'
          break
        case 'lestrade':
          avatar = 'L'
          speaker = '레스트레이드 경감'
          break
        case 'npc':
          avatar = 'N'
          speaker = '목격자'
          break
        default:
          avatar = 'W'
          speaker = '왓슨 박사'
          break
      }

      // AI 응답을 채팅에 추가
      addMessage({
        type: 'assistant',
        content: aiResponse.content,
        avatar,
        speaker
      })

      // 대화 히스토리에 AI 응답 추가
      conversationHistory.current.push({
        role: 'assistant',
        content: aiResponse.content
      })

      // 증거 발견 체크
      const discoveredEvidence = checkForEvidence(message)
      if (discoveredEvidence.length > 0) {
        discoveredEvidence.forEach(evidence => addEvidence(evidence))
        
        // 점수 증가
        setGameState(prev => ({
          ...prev,
          score: prev.score + 10
        }))

        setTimeout(() => {
          addMessage({
            type: 'system',
            content: `🔍 새로운 증거를 발견했습니다: ${discoveredEvidence.join(', ')}`
          })
        }, 1500)
      }

    } catch (error) {
      console.error('AI 응답 생성 오류:', error)
      
      // 오류 시 폴백 응답
      addMessage({
        type: 'assistant',
        content: '*잠시 생각에 잠기며* 홈즈님, 죄송합니다. 잠깐 생각을 정리하고 있었습니다. 다시 말씀해 주시겠습니까?',
        avatar: 'W',
        speaker: '왓슨 박사'
      })
    }
  }, [addMessage, addEvidence, checkForEvidence, updateStoryProgress])

  // 🆕 힌트 시스템 - 진행도별 힌트 데이터
  const getHintByProgress = useCallback((progress: number): string => {
    const hints = [
      // 0-20% 초기 단계
      {
        range: [0, 20],
        hints: [
          '*파이프를 물며* 현장을 직접 조사해보는 것이 어떨까요? "현장 조사"라고 말해보세요.',
          '*책상을 두드리며* RACHE라는 글자가 핵심입니다. 독일어일 가능성을 생각해보세요.',
          '*왓슨을 바라보며* 외상이 없는데 죽었다면... 독의 가능성은 어떨까요?'
        ]
      },
      // 21-40% 조사 진행
      {
        range: [21, 40],
        hints: [
          '*현미경을 들여다보며* 시체 주변을 더 자세히 살펴보세요. 반지나 개인 소지품이 있을 겁니다.',
          '*지도를 펼치며* 로리스턴 가든의 위치와 주변 환경을 조사해보는 것이 좋겠군요.',
          '*레스트레이드를 바라보며* 목격자나 이웃들의 증언을 들어보셨나요?'
        ]
      },
      // 41-60% 단서 수집
      {
        range: [41, 60],
        hints: [
          '*손가락을 맞대며* 범인의 동기를 생각해보세요. 복수일 가능성이 높습니다.',
          '*창밖을 바라보며* 피해자의 과거를 조사해보세요. 아프가니스탄과 연관이 있을 수 있습니다.',
          '*화학 실험도구를 만지며* 독의 종류를 특정해보세요. 알칼로이드 계열일 겁니다.'
        ]
      },
      // 61-80% 추리 심화
      {
        range: [61, 80],
        hints: [
          '*벽난로 앞에 서며* 모든 단서를 연결해보세요. 범인은 피해자를 잘 아는 사람입니다.',
          '*신문을 뒤적이며* 최근 런던에 온 미국인들을 조사해보세요.',
          '*왓슨의 어깨를 두드리며* 당신의 의학 지식이 필요합니다. 독의 증상을 분석해보세요.'
        ]
      },
      // 81-100% 사건 해결
      {
        range: [81, 100],
        hints: [
          '*의자에 깊숙이 앉으며* 이제 범인을 특정할 시간입니다. 모든 증거가 한 사람을 가리키고 있어요.',
          '*손을 비비며* 범인을 직접 대면할 준비를 하세요. 함정을 준비해야 합니다.',
          '*자신만만하게 웃으며* 마지막 퍼즐 조각만 남았군요. 범인의 정체를 밝혀보세요.'
        ]
      }
    ]

    // 현재 진행도에 맞는 힌트 그룹 찾기
    const hintGroup = hints.find(h => progress >= h.range[0] && progress <= h.range[1])
    if (!hintGroup) return "*고개를 갸웃하며* 지금은 힌트를 드릴 적절한 시점이 아닌 것 같습니다."

    // 랜덤하게 힌트 선택
    const randomHint = hintGroup.hints[Math.floor(Math.random() * hintGroup.hints.length)]
    return randomHint
  }, [])

  // 🆕 힌트 요청 처리 함수
  const requestHint = useCallback(() => {
    // 힌트 사용 횟수 증가
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      score: Math.max(0, prev.score - 5) // 힌트 사용 시 점수 5점 차감
    }))

    // 진행도에 따른 힌트 생성
    const hint = getHintByProgress(gameState.storyProgress)
    
    // 힌트 사용 안내 메시지
    addMessage({
      type: 'system',
      content: `💡 힌트를 사용했습니다 (점수 -5점) | 총 힌트 사용: ${gameState.hintsUsed + 1}회`
    })

    // 힌트 메시지 추가 (왓슨이 홈즈에게 조언하는 형태로 변경)
    setTimeout(() => {
      addMessage({
        type: 'assistant',
        content: `*홈즈님을 바라보며* ${hint}`,
        avatar: 'W',
        speaker: '왓슨 박사'
      })
    }, 500)
  }, [gameState.storyProgress, gameState.hintsUsed, addMessage, getHintByProgress])

  return {
    gameState,
    addMessage,
    addEvidence,
    setInputDisabled,
    updateProgress,
    resetGame,
    initializeGame,
    processUserMessage,
    requestHint // 🆕 힌트 요청 함수 export
  }
}