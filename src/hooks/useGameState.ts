import { useState, useCallback, useRef, useEffect } from 'react'
import { GameState, ChatMessageProps, HintChoice } from '@/types/story'
import { CharacterManager } from '@/services/characterManager'
import { aiService, AIMessage } from '@/services/aiService'

const createInitialGameState = (storyId: string): GameState => ({
  storyId,
  currentAct: '',
  currentScene: '',
  playerCharacter: undefined,
  messages: [],
  evidence: [],
  isInputDisabled: false,
  score: 0,
  hintsUsed: 0,
  storyProgress: 0,
  completedKeywords: [],
  unlockedScenes: [],
  gameStartTime: new Date()
})
 
export const useGameState = (storyId?: string) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState(storyId || 'red-study'))
  const conversationHistory = useRef<AIMessage[]>([])
  const characterManager = useRef<CharacterManager>(new CharacterManager())

  // 스토리 데이터 로드
  useEffect(() => {
    if (storyId && storyId !== gameState.storyId) {
      setGameState(createInitialGameState(storyId))
    }
  }, [storyId, gameState.storyId])

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
    setGameState(createInitialGameState(gameState.storyId))
  }, [gameState.storyId])

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

  // 게임 초기화 (스토리별 시작 메시지)
  const initializeGame = useCallback(async (storyId: string) => {
    try {
      // 캐릭터 매니저에 스토리 데이터 로드
      await characterManager.current.loadStoryData(storyId)
      const storyData = characterManager.current.getStoryData()

      if (!storyData) {
        throw new Error(`Failed to load story data for ${storyId}`)
      }

      // 게임 상태 초기화
      setGameState(createInitialGameState(storyId))
      conversationHistory.current = []

      // 스토리별 초기 설정
      switch (storyId) {
        case 'red-study':
          await initializeSherlockGame(storyData)
          break
        case 'romeo-and-juliet':
          await initializeRomeoGame(storyData)
          break
        default:
          await initializeGenericGame(storyData)
      }

      setGameState(prev => ({ ...prev, isInputDisabled: false }))
    } catch (error) {
      console.error('Game initialization failed:', error)
      addMessage({
        type: 'system',
        content: '게임 초기화 중 오류가 발생했습니다. 다시 시도해주세요.'
      })
    }
  }, [])

  // 셜록 홈즈 게임 초기화
  const initializeSherlockGame = useCallback(async (storyData: any) => {
    const watson = characterManager.current.getCharacter('watson')

    addMessage({
      type: 'system',
      content: `${storyData.setting.time}, ${storyData.setting.location}`
    })

    addMessage({
      type: 'assistant',
      content: `*신문을 내려놓으며* 좋은 아침입니다, 홈즈! 스코틀랜드 야드에서 연락이 왔습니다.

로리스턴 가든 3번지에서 의문의 시체가 발견되었다고 합니다. 현장에는 외상이 없는데도 한 남자가 죽어있었고, 벽에는 "RACHE"라는 글자가 피로 쓰여져 있었다고 하네요.

레스트레이드 경감이 당신의 도움을 요청했습니다. 어떻게 하시겠습니까?`,
      avatar: watson?.avatar || 'W',
      speaker: watson?.name || '왓슨 박사',
      characterId: 'watson'
    })

    conversationHistory.current.push({
      role: 'assistant',
      content: '왓슨이 홈즈에게 새로운 사건에 대해 알려주었습니다.'
    })
  }, [addMessage])

  // 로미오와 줄리엣 게임 초기화
  const initializeRomeoGame = useCallback(async (storyData: any) => {
    addMessage({
      type: 'system',
      content: `${storyData.setting.time}, ${storyData.setting.location}`
    })

    // 플레이어 캐릭터 선택 메시지
    addMessage({
      type: 'system',
      content: `📖 **${storyData.title}**에 오신 것을 환영합니다!
      
베로나의 두 원수 가문, 몬태규와 캐퓰릿 사이에서 펼쳐지는 사랑 이야기가 시작됩니다.

당신은 누구의 관점에서 이야기를 경험하고 싶으신가요?

**"로미오"** 또는 **"줄리엣"**을 입력해주세요.`
    })

    conversationHistory.current.push({
      role: 'assistant',
      content: '로미오와 줄리엣의 이야기가 시작되었습니다. 플레이어가 캐릭터를 선택해야 합니다.'
    })
  }, [addMessage])

  // 일반 게임 초기화
  const initializeGenericGame = useCallback(async (storyData: any) => {
    addMessage({
      type: 'system',
      content: `📖 **${storyData.title}** (${storyData.author})`
    })

    addMessage({
      type: 'system',
      content: `${storyData.setting.time}, ${storyData.setting.location}
      
${storyData.description}
      
새로운 모험이 시작됩니다!`
    })
  }, [addMessage])

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
    // 로미오와 줄리엣에서 캐릭터 선택 처리
    if (gameState.storyId === 'romeo-and-juliet' && !gameState.playerCharacter) {
      const lowerMessage = message.toLowerCase()
      if (lowerMessage.includes('로미오')) {
        setGameState(prev => ({ ...prev, playerCharacter: 'romeo' }))
        aiService.setStoryContext('romeo-and-juliet', 'romeo')

        addMessage({
          type: 'system',
          content: '🎭 로미오를 선택하셨습니다! 몬태규 가의 젊은 귀족으로서 베로나의 거리를 거닐며 모험을 시작하세요.'
        })

        const nurse = characterManager.current.getCharacter('nurse')
        addMessage({
          type: 'assistant',
          content: '*길가에서 마주치며* 어머나, 로미오님! 이런 곳에서 뵙게 되다니. 오늘 밤 우리 주인님 댁에서 큰 잔치가 있다고 하던데, 혹시 아시나요?',
          avatar: nurse?.avatar || 'N',
          speaker: nurse?.name || '유모',
          characterId: 'nurse'
        })
        return
      } else if (lowerMessage.includes('줄리엣')) {
        setGameState(prev => ({ ...prev, playerCharacter: 'juliet' }))
        aiService.setStoryContext('romeo-and-juliet', 'juliet')

        addMessage({
          type: 'system',
          content: '🎭 줄리엣을 선택하셨습니다! 캐퓰릿 가의 아름다운 딸로서 베로나의 저택에서 모험을 시작하세요.'
        })

        const nurse = characterManager.current.getCharacter('nurse')
        addMessage({
          type: 'assistant',
          content: '*방으로 들어오며* 줄리엣 아가씨, 좋은 소식이 있어요! 오늘 밤 댁에서 큰 잔치가 열린다고 하네요. 많은 귀족들이 오신다고 해요.',
          avatar: nurse?.avatar || 'N',
          speaker: nurse?.name || '유모',
          characterId: 'nurse'
        })
        return
      }
    }

    // AI 서비스에 현재 스토리 컨텍스트 설정
    aiService.setStoryContext(gameState.storyId, gameState.playerCharacter)

    // 사용자 메시지 추가
    addMessage({
      type: 'user',
      content: message
    })

    // 스토리 진행도 업데이트
    updateStoryProgress(message)

    // 대화 히스토리에 추가
    conversationHistory.current.push({
      role: 'user',
      content: message
    })

    // AI 응답 생성 (실제 API 호출)
    try {
      const aiResponse = await aiService.generateResponse(message, conversationHistory.current)

      // 캐릭터 매니저에서 캐릭터 정보 조회
      const character = characterManager.current.getCharacter(aiResponse.characterId)
      const avatar = character?.avatar || 'N'
      const speaker = character?.name || '알 수 없음'

      // AI 응답을 채팅에 추가
      addMessage({
        type: 'assistant',
        content: aiResponse.content,
        avatar,
        speaker,
        characterId: aiResponse.characterId
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

      // 오류 시 스토리별 폴백 응답
      const fallbackCharacter = gameState.storyId === 'romeo-and-juliet' ? 'nurse' : 'watson'
      const character = characterManager.current.getCharacter(fallbackCharacter)

      addMessage({
        type: 'assistant',
        content: '*잠시 생각에 잠기며* 죄송합니다. 잠깐 생각을 정리하고 있었습니다. 다시 말씀해 주시겠습니까?',
        avatar: character?.avatar || 'W',
        speaker: character?.name || '알 수 없음',
        characterId: fallbackCharacter
      })
    }
  }, [gameState.storyId, gameState.playerCharacter, addMessage, addEvidence, checkForEvidence, updateStoryProgress])


  // 🆕 동적 힌트 선택지 생성 (스토리 상황에 맞게)
  const generateHintChoices = useCallback((progress: number): HintChoice[] => {
    switch (gameState.storyId) {
      case 'red-study':
        return generateSherlockHintChoices(progress, gameState.evidence, gameState.completedKeywords)
      case 'romeo-and-juliet':
        return generateRomeoHintChoices(progress, gameState.playerCharacter, gameState.completedKeywords)
      default:
        return generateGenericHintChoices(progress, gameState.completedKeywords)
    }
  }, [gameState.storyId, gameState.playerCharacter, gameState.evidence, gameState.completedKeywords])

  // 🆕 셜록 홈즈 동적 힌트 선택지 생성
  const generateSherlockHintChoices = useCallback((progress: number, evidence: string[], completedKeywords: string[]): HintChoice[] => {
    // 현재 상황에 따른 동적 힌트 생성
    const hasVisitedScene = completedKeywords.includes('현장') || completedKeywords.includes('로리스턴')
    const hasRacheClue = evidence.includes('벽에 피로 쓰인 RACHE') || completedKeywords.includes('rache')
    const hasDeathCause = evidence.includes('독에 의한 죽음') || completedKeywords.includes('독')
    const hasRing = evidence.includes('여자의 결혼반지') || completedKeywords.includes('반지')
    const hasWitness = completedKeywords.includes('목격자') || completedKeywords.includes('미국')
    const hasMotive = completedKeywords.includes('복수') || completedKeywords.includes('동기')
    const hasBackground = completedKeywords.includes('아프가니스탄') || completedKeywords.includes('군인')
    if (progress <= 20) {
      const choices: HintChoice[] = []

      // 현장 방문 여부에 따라 다른 메시지
      if (!hasVisitedScene) {
        choices.push({
          id: 'basic-investigation',
          text: '현장으로 가서 직접 조사해보고 싶어요',
          hint: '로리스턴 가든으로 가서 현장을 직접 확인해봅시다.',
          difficulty: 'easy'
        })
      } else {
        choices.push({
          id: 'basic-investigation',
          text: '현장에서 놓친 단서가 있을까요?',
          hint: '이미 현장에 도착했으니 더 자세히 살펴봅시다.',
          difficulty: 'easy'
        })
      }

      // RACHE 단서 발견 여부에 따라
      if (!hasRacheClue) {
        choices.push({
          id: 'rache-clue',
          text: '벽에 쓰인 글자가 무엇인지 확인하고 싶어요',
          hint: '벽에 피로 쓰인 글자를 자세히 살펴봅시다.',
          difficulty: 'medium'
        })
      } else {
        choices.push({
          id: 'rache-clue',
          text: 'RACHE의 진짜 의미를 파악하고 싶어요',
          hint: '이미 RACHE를 발견했으니, 이것이 진짜 단서인지 함정인지 분석해봅시다.',
          difficulty: 'medium'
        })
      }

      // 사망 원인 파악 여부에 따라
      if (!hasDeathCause) {
        choices.push({
          id: 'death-cause',
          text: '시체를 의학적으로 검사해보고 싶어요',
          hint: '외상이 없는 시체의 사망 원인을 찾아봅시다.',
          difficulty: 'hard'
        })
      } else {
        choices.push({
          id: 'death-cause',
          text: '독의 종류를 더 구체적으로 알아보고 싶어요',
          hint: '독이라는 것을 알았으니 어떤 독인지 구체적으로 분석해봅시다.',
          difficulty: 'hard'
        })
      }

      return choices
    } else if (progress <= 40) {
      const choices: HintChoice[] = []

      // 반지 발견 여부에 따라
      if (!hasRing) {
        choices.push({
          id: 'evidence-search',
          text: '현장에서 더 많은 물리적 증거를 찾고 싶어요',
          hint: '시체 주변을 꼼꼼히 살펴보면 중요한 증거를 발견할 수 있을 겁니다.',
          difficulty: 'easy'
        })
      } else {
        choices.push({
          id: 'evidence-search',
          text: '발견한 반지의 의미를 분석하고 싶어요',
          hint: '여자의 반지가 왜 남자 시체 옆에 있는지 분석해봅시다.',
          difficulty: 'easy'
        })
      }

      // 장소 분석
      choices.push({
        id: 'location-analysis',
        text: hasVisitedScene
          ? '로리스턴 가든을 선택한 범인의 의도를 파악하고 싶어요'
          : '범행 장소의 특성을 분석하고 싶어요',
        hint: hasVisitedScene
          ? '현장을 봤으니 범인이 왜 이곳을 선택했는지 생각해봅시다.'
          : '로리스턴 가든이라는 장소에 특별한 의미가 있을까요?',
        difficulty: 'medium'
      })

      // 목격자 조사 여부에 따라
      if (!hasWitness) {
        choices.push({
          id: 'witness-testimony',
          text: '주변 사람들의 목격담을 수집하고 싶어요',
          hint: '이웃들이나 지나가던 사람들이 뭔가 봤을 수도 있습니다.',
          difficulty: 'hard'
        })
      } else {
        choices.push({
          id: 'witness-testimony',
          text: '미국인 목격자 정보를 더 자세히 분석하고 싶어요',
          hint: '미국 억양의 남자라는 증언을 바탕으로 더 구체적인 정보를 찾아봅시다.',
          difficulty: 'hard'
        })
      }

      return choices
    } else if (progress <= 60) {
      const choices: HintChoice[] = []

      // 동기 파악 여부에 따라
      if (!hasMotive) {
        choices.push({
          id: 'motive-analysis',
          text: '범인이 왜 이런 일을 저질렀는지 알고 싶어요',
          hint: '지금까지의 증거를 종합해서 범인의 동기를 추론해봅시다.',
          difficulty: 'easy'
        })
      } else {
        choices.push({
          id: 'motive-analysis',
          text: '복수라는 동기를 더 구체적으로 파헤치고 싶어요',
          hint: '복수라는 동기를 알았으니, 누가 누구에게 복수하는 건지 구체적으로 분석해봅시다.',
          difficulty: 'easy'
        })
      }

      // 피해자 배경 조사 여부에 따라
      if (!hasBackground) {
        choices.push({
          id: 'victim-background',
          text: '피해자가 누구인지 신원을 파악하고 싶어요',
          hint: '피해자의 신원과 과거를 조사해서 범인과의 연결고리를 찾아봅시다.',
          difficulty: 'medium'
        })
      } else {
        choices.push({
          id: 'victim-background',
          text: '아프가니스탄 복무 기록을 더 자세히 조사하고 싶어요',
          hint: '군인이었다는 것을 알았으니, 아프가니스탄에서 무슨 일이 있었는지 파헤쳐봅시다.',
          difficulty: 'medium'
        })
      }

      // 독 종류 파악
      if (hasDeathCause) {
        choices.push({
          id: 'poison-identification',
          text: '사용된 독의 정확한 종류와 입수 경로를 알고 싶어요',
          hint: '독이라는 것을 알았으니, 어떤 독인지 그리고 범인이 어떻게 구했는지 분석해봅시다.',
          difficulty: 'hard'
        })
      } else {
        choices.push({
          id: 'poison-identification',
          text: '사망 원인을 더 정확하게 규명하고 싶어요',
          hint: '시체의 상태를 더 자세히 분석해서 정확한 사망 원인을 찾아봅시다.',
          difficulty: 'hard'
        })
      }

      return choices
    } else if (progress <= 80) {
      const choices: HintChoice[] = []

      // 수집된 증거들을 바탕으로 종합 분석
      const evidenceCount = evidence.length
      const keywordCount = completedKeywords.length

      choices.push({
        id: 'connect-clues',
        text: evidenceCount > 2
          ? '수집한 모든 증거들을 하나로 연결하고 싶어요'
          : '지금까지 발견한 단서들의 연관성을 찾고 싶어요',
        hint: evidenceCount > 2
          ? `${evidenceCount}개의 증거와 ${keywordCount}개의 단서를 종합해서 사건의 전체 그림을 그려봅시다.`
          : '지금까지의 단서들 사이의 숨겨진 연결고리를 찾아봅시다.',
        difficulty: 'easy'
      })

      // 용의자 특정
      if (hasWitness && hasBackground) {
        choices.push({
          id: 'suspect-identification',
          text: '미국인이면서 아프가니스탄과 연관된 용의자를 찾고 싶어요',
          hint: '목격자 증언과 피해자의 과거를 연결해서 구체적인 용의자를 특정해봅시다.',
          difficulty: 'medium'
        })
      } else if (hasWitness) {
        choices.push({
          id: 'suspect-identification',
          text: '미국 억양의 목격자를 바탕으로 용의자를 좁혀나가고 싶어요',
          hint: '미국에서 온 사람들 중에서 피해자와 연관이 있을 만한 사람을 찾아봅시다.',
          difficulty: 'medium'
        })
      } else {
        choices.push({
          id: 'suspect-identification',
          text: '범인의 프로필을 작성해서 용의자를 좁혀나가고 싶어요',
          hint: '지금까지의 증거를 바탕으로 범인이 어떤 사람일지 프로필을 만들어봅시다.',
          difficulty: 'medium'
        })
      }

      // 독 분석 심화
      if (hasDeathCause) {
        choices.push({
          id: 'poison-symptoms',
          text: '독의 작용 방식과 범인의 의학 지식을 분석하고 싶어요',
          hint: '독의 종류를 알았으니, 이런 독을 사용할 수 있는 사람의 배경을 추론해봅시다.',
          difficulty: 'hard'
        })
      } else {
        choices.push({
          id: 'poison-symptoms',
          text: '시체의 상태를 통해 사망 과정을 재구성하고 싶어요',
          hint: '시체의 자세, 표정, 주변 상황을 종합해서 사망 당시 상황을 재구성해봅시다.',
          difficulty: 'hard'
        })
      }

      return choices
    } else {
      const choices: HintChoice[] = []

      // 최종 단계 - 수집된 정보에 따라 다른 접근
      const evidenceCount = evidence.length
      const keywordCount = completedKeywords.length
      const hasEnoughEvidence = evidenceCount >= 3 && (hasMotive || hasBackground)

      if (hasEnoughEvidence) {
        choices.push({
          id: 'identify-criminal',
          text: '모든 증거를 바탕으로 범인을 최종 특정하고 싶어요',
          hint: `${evidenceCount}개의 증거와 충분한 단서가 있습니다. 이제 범인이 누구인지 확정할 수 있을 것 같습니다.`,
          difficulty: 'easy'
        })
      } else {
        choices.push({
          id: 'identify-criminal',
          text: '부족한 증거로도 범인을 추론해보고 싶어요',
          hint: '아직 증거가 부족하지만, 지금까지의 정보로도 범인의 윤곽을 그려볼 수 있을 것 같습니다.',
          difficulty: 'easy'
        })
      }

      // 범인 대면 준비
      if (hasMotive && hasWitness) {
        choices.push({
          id: 'confront-criminal',
          text: '동기와 목격 증언을 바탕으로 범인을 추궁하고 싶어요',
          hint: '복수 동기와 목격자 증언이 있으니 범인을 직접 대면할 준비가 되었습니다.',
          difficulty: 'medium'
        })
      } else {
        choices.push({
          id: 'confront-criminal',
          text: '현재 가진 정보로 범인과 심리전을 벌이고 싶어요',
          hint: '완전하지 않은 정보로도 범인의 심리를 흔들어 자백을 받아낼 수 있을 것입니다.',
          difficulty: 'medium'
        })
      }

      // 최종 해결
      const totalClues = evidenceCount + keywordCount
      if (totalClues >= 8) {
        choices.push({
          id: 'final-solution',
          text: '완벽한 추리로 사건을 마무리하고 싶어요',
          hint: `${totalClues}개의 단서로 완벽한 추리를 완성할 수 있습니다. 홈즈다운 완벽한 해결책을 제시해봅시다.`,
          difficulty: 'hard'
        })
      } else {
        choices.push({
          id: 'final-solution',
          text: '현재까지의 추리를 정리해서 사건을 마무리하고 싶어요',
          hint: '아직 모든 것이 명확하지 않지만, 지금까지의 추리를 바탕으로 사건을 정리해봅시다.',
          difficulty: 'hard'
        })
      }

      return choices
    }
  }, [])

  // 🆕 로미오와 줄리엣 동적 힌트 선택지 생성
  const generateRomeoHintChoices = useCallback((progress: number, playerCharacter?: string, completedKeywords: string[] = []): HintChoice[] => {
    // 현재 상황 파악
    const hasMetLove = completedKeywords.includes('사랑') || completedKeywords.includes('만남')
    const knowsParty = completedKeywords.includes('파티') || completedKeywords.includes('캐퓰릿')
    const knowsConflict = completedKeywords.includes('갈등') || completedKeywords.includes('원수')
    const playerName = playerCharacter === 'romeo' ? '로미오' :
      playerCharacter === 'juliet' ? '줄리엣' : '님'

    if (progress <= 20) {
      const choices: HintChoice[] = []

      // 파티 정보 여부에 따라
      if (!knowsParty) {
        choices.push({
          id: 'party-info',
          text: '오늘 밤 열리는 특별한 행사에 대해 알고 싶어요',
          hint: `${playerName}님, 베로나에서 큰 잔치가 열린다고 하는데 자세히 알아보시는 게 어떨까요?`,
          difficulty: 'easy'
        })
      } else {
        choices.push({
          id: 'party-info',
          text: '캐퓰릿 가 파티에 참석할 방법을 알고 싶어요',
          hint: `파티 정보를 알았으니, 이제 어떻게 참석할지 계획을 세워봅시다.`,
          difficulty: 'easy'
        })
      }

      // 가문 갈등 인식 여부에 따라
      if (!knowsConflict) {
        choices.push({
          id: 'family-conflict',
          text: '우리 가문과 다른 가문들 사이의 관계가 궁금해요',
          hint: '베로나의 가문들 사이에 어떤 역사가 있는지 알아보는 것이 중요할 것 같습니다.',
          difficulty: 'medium'
        })
      } else {
        choices.push({
          id: 'family-conflict',
          text: '몬태규와 캐퓰릿 가문의 원수 관계를 어떻게 극복할지 고민이에요',
          hint: '두 가문의 갈등을 알았으니, 이를 어떻게 극복할지 고민해봅시다.',
          difficulty: 'medium'
        })
      }

      // 가족과의 관계
      choices.push({
        id: 'family-conversation',
        text: hasMetLove
          ? '가족들에게 사랑에 대한 이야기를 꺼내고 싶어요'
          : '가족들과 미래에 대해 진지한 대화를 나누고 싶어요',
        hint: hasMetLove
          ? '사랑을 느끼기 시작했으니 가족들과 이에 대해 조심스럽게 이야기해봅시다.'
          : '가족들과 결혼이나 미래에 대한 그들의 계획을 들어봅시다.',
        difficulty: 'hard'
      })

      return choices
    } else if (progress <= 40) {
      return [
        {
          id: 'express-love',
          text: '사랑을 어떻게 표현해야 할까요?',
          hint: '사랑에 대해 솔직하게 표현해보세요. 진실한 마음이 중요합니다. 하지만 상황을 고려해서 신중하게 행동하세요.',
          difficulty: 'easy'
        },
        {
          id: 'friar-advice',
          text: '로렌스 신부의 조언을 구하고 싶어요',
          hint: '로렌스 신부를 찾아가보세요. 지혜로운 조언을 들을 수 있을 겁니다. 그는 두 가문의 화해를 원하고 있어요.',
          difficulty: 'medium'
        },
        {
          id: 'family-opposition',
          text: '가족의 반대를 어떻게 극복해야 할까요?',
          hint: '가족의 반대를 어떻게 극복할지 생각해보세요. 직접적인 대립보다는 지혜로운 방법을 찾아보세요.',
          difficulty: 'hard'
        }
      ]
    } else {
      return [
        {
          id: 'peaceful-solution',
          text: '평화로운 해결책이 있을까요?',
          hint: '갈등을 피하고 평화로운 해결책을 찾아보세요. 사랑이 증오보다 강하다는 것을 보여줄 수 있습니다.',
          difficulty: 'easy'
        },
        {
          id: 'tell-truth',
          text: '가족들에게 진실을 말해야 할까요?',
          hint: '가족들에게 진실을 말할 용기를 가져보세요. 때로는 정직함이 최선의 해결책이 될 수 있습니다.',
          difficulty: 'medium'
        },
        {
          id: 'final-choice',
          text: '최종 선택을 어떻게 해야 할까요?',
          hint: '이제 최종 선택의 시간입니다. 지혜롭게 결정하세요. 진정한 사랑의 힘으로 모든 것을 바꿀 수 있습니다.',
          difficulty: 'hard'
        }
      ]
    }
  }, [])

  // 🆕 일반 동적 힌트 선택지 생성
  const generateGenericHintChoices = useCallback((_progress: number, completedKeywords: string[] = []): HintChoice[] => {
    const keywordCount = completedKeywords.length
    return [
      {
        id: 'basic-hint',
        text: keywordCount > 5 ? '수집한 정보들을 정리하고 싶어요' : '기본적인 방향성을 알고 싶어요',
        hint: keywordCount > 5
          ? `지금까지 ${keywordCount}개의 단서를 발견했습니다. 이들을 체계적으로 정리해봅시다.`
          : '주변을 더 자세히 살펴보세요. 놓친 단서가 있을 수 있습니다.',
        difficulty: 'easy'
      },
      {
        id: 'character-interaction',
        text: keywordCount > 3 ? '특정 캐릭터와 심화 대화를 나누고 싶어요' : '다른 캐릭터와 대화하는 방법이 궁금해요',
        hint: keywordCount > 3
          ? '이미 여러 캐릭터와 대화했으니, 이제 더 깊이 있는 대화를 나눠봅시다.'
          : '다른 캐릭터와 대화해보는 것이 좋겠어요. 그들이 중요한 정보를 가지고 있을 수 있습니다.',
        difficulty: 'medium'
      },
      {
        id: 'story-analysis',
        text: keywordCount > 7 ? '복잡해진 상황을 명확하게 정리하고 싶어요' : '지금까지의 상황을 종합적으로 분석하고 싶어요',
        hint: keywordCount > 7
          ? `${keywordCount}개의 단서로 상황이 복잡해졌습니다. 핵심을 파악해 명확하게 정리해봅시다.`
          : '지금까지의 정보를 종합해보세요. 새로운 관점에서 상황을 바라보면 해답을 찾을 수 있을 겁니다.',
        difficulty: 'hard'
      }
    ]
  }, [])


  // 🆕 힌트 액션 실행 함수
  const executeHintAction = useCallback(async (choice: HintChoice) => {
    // 힌트 실행 시 진행도 업데이트 (연타 시 점진적 진행)
    const progressIncrease = Math.max(2, Math.min(8, 15 - gameState.hintsUsed))
    updateProgress(progressIncrease)
    
    switch (gameState.storyId) {
      case 'red-study':
        await executeSherlockHintAction(choice)
        break
      case 'romeo-and-juliet':
        await executeRomeoHintAction(choice)
        break
      default:
        await executeGenericHintAction(choice)
    }
    
    // 힌트 실행 후 추가 AI 응답으로 스토리 연결
    setTimeout(async () => {
      const followUpPrompts = [
        "현재 상황을 어떻게 해석하시나요?",
        "다음에 무엇을 해야 할까요?",
        "이 단서가 의미하는 바는 무엇일까요?",
        "어떤 추리를 해볼 수 있을까요?",
        "다른 관점에서 살펴보면 어떨까요?"
      ]
      
      const randomPrompt = followUpPrompts[Math.floor(Math.random() * followUpPrompts.length)]
      await processUserMessage(randomPrompt)
    }, 2000)
  }, [gameState.storyId, gameState.playerCharacter, gameState.hintsUsed, updateProgress, processUserMessage])

  // 🆕 셜록 홈즈 힌트 액션 실행
  const executeSherlockHintAction = useCallback(async (choice: HintChoice) => {
    const watson = characterManager.current.getCharacter('watson')
    const holmes = characterManager.current.getCharacter('holmes')
    const lestrade = characterManager.current.getCharacter('lestrade')

    switch (choice.id) {
      case 'basic-investigation':
        addMessage({
          type: 'assistant',
          content: '*왓슨이 모자와 외투를 가져오며* 좋습니다, 홈즈! 현장으로 가보죠. 로리스턴 가든 3번지로 향합니다.',
          avatar: watson?.avatar || 'W',
          speaker: watson?.name || '왓슨 박사',
          characterId: 'watson'
        })

        setTimeout(() => {
          addMessage({
            type: 'system',
            content: '🚶‍♂️ 로리스턴 가든 3번지 도착...'
          })

          setTimeout(() => {
            addMessage({
              type: 'assistant',
              content: '*현장을 둘러보며* 여기가 바로 그 장소군요. 집은 비어있고, 앞문은 열려있습니다. 안으로 들어가 보시겠습니까?',
              avatar: watson?.avatar || 'W',
              speaker: watson?.name || '왓슨 박사',
              characterId: 'watson'
            })
          }, 1500)
        }, 2000)
        break

      case 'rache-clue':
        addMessage({
          type: 'assistant',
          content: '*벽의 글자를 자세히 살펴보며* RACHE... 독일어로 "복수"를 의미하죠. 하지만 홈즈, 이것이 정말 독일인의 소행일까요?',
          avatar: watson?.avatar || 'W',
          speaker: watson?.name || '왓슨 박사',
          characterId: 'watson'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*냉소적으로 웃으며* 왓슨, 그것이 바로 범인이 원하는 것입니다. 경찰을 혼란시키려는 속임수죠. 진짜 단서는 다른 곳에 있을 겁니다.',
            avatar: holmes?.avatar || 'H',
            speaker: holmes?.name || '셜록 홈즈',
            characterId: 'holmes'
          })
        }, 2500)
        break

      case 'death-cause':
        addMessage({
          type: 'assistant',
          content: '*시체를 자세히 검사하며* 외상은 전혀 없군요. 얼굴 표정을 보세요, 왓슨. 고통스러워하는 표정이 아닙니다.',
          avatar: watson?.avatar || 'W',
          speaker: watson?.name || '왓슨 박사',
          characterId: 'watson'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*돋보기로 손톱을 살펴보며* 독입니다, 왓슨. 그것도 빠르게 작용하는 독이죠. 아마도 알칼로이드 계열일 겁니다.',
            avatar: holmes?.avatar || 'H',
            speaker: holmes?.name || '셜록 홈즈',
            characterId: 'holmes'
          })

          // 증거 추가
          addEvidence('독에 의한 죽음')
          setTimeout(() => {
            addMessage({
              type: 'system',
              content: '🔍 새로운 증거를 발견했습니다: 독에 의한 죽음'
            })
          }, 1000)
        }, 2500)
        break

      case 'evidence-search':
        addMessage({
          type: 'assistant',
          content: '*바닥을 꼼꼼히 살펴보며* 홈즈, 여기 뭔가 있습니다!',
          avatar: watson?.avatar || 'W',
          speaker: watson?.name || '왓슨 박사',
          characterId: 'watson'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*물건을 집어들며* 아하! 여자의 결혼반지군요. 하지만 피해자는 남자... 이상하군요.',
            avatar: holmes?.avatar || 'H',
            speaker: holmes?.name || '셜록 홈즈',
            characterId: 'holmes'
          })

          // 증거 추가
          addEvidence('여자의 결혼반지')
          setTimeout(() => {
            addMessage({
              type: 'system',
              content: '🔍 새로운 증거를 발견했습니다: 여자의 결혼반지'
            })
          }, 1000)
        }, 2000)
        break

      case 'witness-testimony':
        addMessage({
          type: 'assistant',
          content: '*문을 두드리며* 이웃들에게 물어보겠습니다. 혹시 수상한 사람을 본 적이 있는지...',
          avatar: watson?.avatar || 'W',
          speaker: watson?.name || '왓슨 박사',
          characterId: 'watson'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*돌아와서* 홈즈! 옆집 할머니가 어젯밤 늦게 키 큰 남자가 이 집에 들어가는 것을 봤다고 합니다. 미국 억양으로 말하더라고 하네요.',
            avatar: watson?.avatar || 'W',
            speaker: watson?.name || '왓슨 박사',
            characterId: 'watson'
          })
        }, 3000)
        break

      case 'motive-analysis':
        addMessage({
          type: 'assistant',
          content: '*파이프를 피우며 생각에 잠기는 홈즈*',
          avatar: holmes?.avatar || 'H',
          speaker: holmes?.name || '셜록 홈즈',
          characterId: 'holmes'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*갑자기 일어서며* 복수입니다, 왓슨! 이 모든 것이 복수를 위한 것이에요. 피해자가 과거에 누군가에게 큰 해를 끼쳤을 겁니다.',
            avatar: holmes?.avatar || 'H',
            speaker: holmes?.name || '셜록 홈즈',
            characterId: 'holmes'
          })
        }, 2500)
        break

      case 'victim-background':
        addMessage({
          type: 'assistant',
          content: '*레스트레이드가 서류를 가져오며* 피해자의 신원을 확인했습니다. 이노크 드레버, 전직 군인입니다.',
          avatar: lestrade?.avatar || 'L',
          speaker: lestrade?.name || '레스트레이드 경감',
          characterId: 'lestrade'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*서류를 살펴보며* 아프가니스탄에서 복무했군요! 이제 연결고리가 보이기 시작합니다.',
            avatar: holmes?.avatar || 'H',
            speaker: holmes?.name || '셜록 홈즈',
            characterId: 'holmes'
          })
        }, 2500)
        break

      default:
        addMessage({
          type: 'assistant',
          content: '*홈즈가 신중하게 생각하며* 흥미로운 관점이군요. 더 자세히 조사해봅시다.',
          avatar: holmes?.avatar || 'H',
          speaker: holmes?.name || '셜록 홈즈',
          characterId: 'holmes'
        })
    }

    // 스토리 진행도 업데이트
    updateStoryProgress(`힌트 선택: ${choice.text}`)
  }, [addMessage, addEvidence, updateStoryProgress])

  // 🆕 로미오와 줄리엣 힌트 액션 실행
  const executeRomeoHintAction = useCallback(async (choice: HintChoice) => {
    const nurse = characterManager.current.getCharacter('nurse')
    const friar = characterManager.current.getCharacter('friar_lawrence')
    const romeo = characterManager.current.getCharacter('romeo')
    const juliet = characterManager.current.getCharacter('juliet')

    switch (choice.id) {
      case 'party-info':
        addMessage({
          type: 'assistant',
          content: '*흥미진진하게* 오늘 밤 캐퓰릿 가에서 큰 잔치가 열린답니다! 베로나의 모든 젊은 귀족들이 올 거예요. 혹시... 관심 있으신가요?',
          avatar: nurse?.avatar || 'N',
          speaker: nurse?.name || '유모',
          characterId: 'nurse'
        })

        setTimeout(() => {
          addMessage({
            type: 'system',
            content: '🎭 파티 정보를 얻었습니다. 오늘 밤이 운명적인 만남의 시간이 될 것 같습니다.'
          })
        }, 2000)
        break

      case 'family-conflict':
        addMessage({
          type: 'assistant',
          content: '*한숨을 쉬며* 몬태규와 캐퓰릿... 이 두 가문의 원수 관계는 너무나 깊어요. 수십 년간 이어진 증오인걸요.',
          avatar: friar?.avatar || 'F',
          speaker: friar?.name || '로렌스 신부',
          characterId: 'friar_lawrence'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*진지하게* 하지만 진정한 사랑이 이 모든 증오를 녹일 수 있다고 믿습니다. 사랑은 미움보다 강하니까요.',
            avatar: friar?.avatar || 'F',
            speaker: friar?.name || '로렌스 신부',
            characterId: 'friar_lawrence'
          })
        }, 2500)
        break

      case 'express-love':
        if (gameState.playerCharacter === 'romeo') {
          addMessage({
            type: 'assistant',
            content: '*로미오가 용기를 내며* 사랑하는 마음을 숨길 수 없어요. 진실한 마음을 전해야겠어요.',
            avatar: romeo?.avatar || 'R',
            speaker: romeo?.name || '로미오',
            characterId: 'romeo'
          })
        } else {
          addMessage({
            type: 'assistant',
            content: '*줄리엣이 결심을 다지며* 마음속 깊은 사랑을 더 이상 숨길 수 없어요. 솔직하게 표현해야겠어요.',
            avatar: juliet?.avatar || 'J',
            speaker: juliet?.name || '줄리엣',
            characterId: 'juliet'
          })
        }

        setTimeout(() => {
          addMessage({
            type: 'system',
            content: '💕 사랑을 표현하기로 결심했습니다. 진실한 마음이 전해질 것입니다.'
          })
        }, 2000)
        break

      case 'friar-advice':
        addMessage({
          type: 'assistant',
          content: '*로렌스 신부의 방으로 찾아갑니다*',
          avatar: friar?.avatar || 'F',
          speaker: friar?.name || '로렌스 신부',
          characterId: 'friar_lawrence'
        })

        setTimeout(() => {
          addMessage({
            type: 'assistant',
            content: '*따뜻하게 맞이하며* 어서 오세요. 무엇이 당신을 이렇게 고민스럽게 만드나요? 신의 사랑 안에서 모든 것을 이야기해보세요.',
            avatar: friar?.avatar || 'F',
            speaker: friar?.name || '로렌스 신부',
            characterId: 'friar_lawrence'
          })
        }, 2000)
        break

      case 'peaceful-solution':
        addMessage({
          type: 'assistant',
          content: '*지혜롭게 조언하며* 폭력으로는 아무것도 해결되지 않습니다. 사랑과 이해로 평화를 만들어가야 해요.',
          avatar: friar?.avatar || 'F',
          speaker: friar?.name || '로렌스 신부',
          characterId: 'friar_lawrence'
        })

        setTimeout(() => {
          addMessage({
            type: 'system',
            content: '☮️ 평화로운 해결책을 모색하기로 했습니다. 지혜로운 선택입니다.'
          })
        }, 2000)
        break

      default:
        addMessage({
          type: 'assistant',
          content: '*다정하게* 좋은 선택이에요. 사랑의 힘을 믿어보세요.',
          avatar: nurse?.avatar || 'N',
          speaker: nurse?.name || '유모',
          characterId: 'nurse'
        })
    }

    // 스토리 진행도 업데이트
    updateStoryProgress(`힌트 선택: ${choice.text}`)
  }, [gameState.playerCharacter, addMessage, updateStoryProgress])

  // 🆕 일반 힌트 액션 실행
  const executeGenericHintAction = useCallback(async (choice: HintChoice) => {
    addMessage({
      type: 'system',
      content: `🎯 ${choice.text}에 따라 스토리가 진행됩니다.`
    })

    setTimeout(() => {
      addMessage({
        type: 'assistant',
        content: choice.hint,
        avatar: 'N',
        speaker: '내레이터',
        characterId: 'narrator'
      })
    }, 1000)
  }, [addMessage])

  // 🆕 직접 힌트 실행 (팝업 없이 바로 스토리 진행) - 연타 대응 개선
  const requestHint = useCallback(async () => {
    // 현재 상황에 맞는 최적의 힌트를 자동으로 선택
    const availableHints = generateHintChoices(gameState.storyProgress)

    if (availableHints.length === 0) {
      // 힌트가 없을 때는 AI에게 도움 요청
      addMessage({
        type: 'system',
        content: '💡 힌트를 생성하고 있습니다...'
      })
      
      // AI에게 현재 상황에 맞는 힌트 요청
      setTimeout(async () => {
        await processUserMessage("힌트를 주세요")
      }, 500)
      return
    }

    // 🆕 연타 방지를 위한 힌트 선택 개선
    const selectedHint = selectProgressiveHint(availableHints, gameState)

    // 힌트 사용 횟수 증가
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }))

    // 힌트 사용 안내 메시지 (더 다양하게)
    const hintMessages = [
      `💡 "${selectedHint.text}" - 스토리를 진행합니다!`,
      `🔍 "${selectedHint.text}" - 새로운 단서를 찾았습니다!`,
      `⚡ "${selectedHint.text}" - 추리가 한 단계 발전합니다!`,
      `🎯 "${selectedHint.text}" - 사건의 실마리를 발견했습니다!`,
      `✨ "${selectedHint.text}" - 진실에 한 걸음 다가섭니다!`
    ]
    
    const randomMessage = hintMessages[Math.floor(Math.random() * hintMessages.length)]
    
    addMessage({
      type: 'system',
      content: `${randomMessage} | 힌트 사용: ${gameState.hintsUsed + 1}회`
    })

    // 힌트에 따른 스토리 자동 진행
    setTimeout(async () => {
      await executeHintAction(selectedHint)
    }, 300)
  }, [gameState.storyProgress, gameState.hintsUsed, generateHintChoices, addMessage, processUserMessage])

  // 🆕 연타 대응 진행형 힌트 선택 알고리즘
  const selectProgressiveHint = useCallback((availableHints: HintChoice[], currentGameState: GameState): HintChoice => {
    const hintsUsed = currentGameState.hintsUsed
    
    // 힌트 사용 횟수에 따라 다른 전략 적용
    const hintIndex = hintsUsed % availableHints.length
    
    // 연타 시 순환하면서 다른 힌트 선택
    if (hintsUsed > 0) {
      // 이전에 사용하지 않은 힌트 우선 선택
      const sortedHints = [...availableHints].sort((a, b) => {
        // 난이도를 고려한 정렬 (easy -> medium -> hard)
        const difficultyOrder: Record<string, number> = { easy: 1, medium: 2, hard: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      })
      
      return sortedHints[hintIndex]
    }
    
    return availableHints[0]
  }, [])

  // 🆕 최적의 힌트 선택 알고리즘 (기존 유지)
  const selectBestHint = useCallback((availableHints: HintChoice[], currentGameState: GameState): HintChoice => {
    // 우선순위 기반 힌트 선택
    const evidenceCount = currentGameState.evidence.length
    const progress = currentGameState.storyProgress

    // 1. 진행도가 낮으면 기본 힌트 우선
    if (progress <= 30) {
      const easyHints = availableHints.filter(h => h.difficulty === 'easy')
      if (easyHints.length > 0) return easyHints[0]
    }

    // 2. 증거가 부족하면 증거 수집 관련 힌트 우선
    if (evidenceCount < 2) {
      const evidenceHints = availableHints.filter(h =>
        h.id.includes('evidence') || h.id.includes('search') || h.id.includes('investigation')
      )
      if (evidenceHints.length > 0) return evidenceHints[0]
    }

    // 3. 중간 진행도에서는 상세 힌트 선호
    if (progress > 30 && progress <= 70) {
      const mediumHints = availableHints.filter(h => h.difficulty === 'medium')
      if (mediumHints.length > 0) return mediumHints[0]
    }

    // 4. 후반부에서는 고급 힌트 선호
    if (progress > 70) {
      const hardHints = availableHints.filter(h => h.difficulty === 'hard')
      if (hardHints.length > 0) return hardHints[0]
    }

    // 5. 기본적으로 첫 번째 힌트 선택
    return availableHints[0]
  }, [])

  return {
    gameState,
    addMessage,
    addEvidence,
    setInputDisabled,
    updateProgress,
    resetGame,
    initializeGame,
    processUserMessage,
    requestHint // 🆕 직접 힌트 실행 (팝업 없이)
  }
}