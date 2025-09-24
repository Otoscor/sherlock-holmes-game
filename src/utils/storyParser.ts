interface OriginalTextData {
  id: string
  title: string
  keyScenes: KeyScene[]
  characters: Record<string, Character>
  gameFlow: GameFlow
  vocabulary: Vocabulary
  atmosphere: Atmosphere
}

interface KeyScene {
  id: string
  title: string
  chapterRef: string
  originalText: string
  gameContent: string
  keyElements: string[]
  evidence?: string[]
}

interface Character {
  name: string
  avatar: string
  description: string
  personality: string
  quotes: string[]
}

interface GameFlow {
  introduction: {
    scene: string
    setup: string
    trigger: string
  }
  investigation: {
    phases: string[]
  }
  resolution: {
    revelation: string
    method: string
    motive: string
  }
}

interface Vocabulary {
  victorianTerms: string[]
  forensicTerms: string[]
}

interface Atmosphere {
  setting: string
  mood: string
  weather: string
}

export class StoryParser {
  private originalData: OriginalTextData | null = null

  async loadOriginalData(caseId: string): Promise<void> {
    try {
      const response = await fetch(`/src/data/cases/${caseId}-original.json`)
      this.originalData = await response.json()
    } catch (error) {
      console.error('원문 데이터 로드 실패:', error)
    }
  }

  // 사용자 입력을 분석해서 관련 원문 내용을 찾기
  findRelevantContent(userInput: string, currentScene: string): string[] {
    if (!this.originalData) return []

    const input = userInput.toLowerCase()
    const relevantContent: string[] = []

    // 키워드 기반 매칭
    if (input.includes('rache') || input.includes('라헤')) {
      const racheScene = this.originalData.keyScenes.find(scene => scene.id === 'rache-revelation')
      if (racheScene) {
        relevantContent.push(racheScene.gameContent)
      }
    }

    if (input.includes('시체') || input.includes('body') || input.includes('죽음')) {
      const crimeScene = this.originalData.keyScenes.find(scene => scene.id === 'crime-scene-discovery')
      if (crimeScene) {
        relevantContent.push(crimeScene.gameContent)
      }
    }

    if (input.includes('추론') || input.includes('관찰') || input.includes('deduction')) {
      const deductionScene = this.originalData.keyScenes.find(scene => scene.id === 'holmes-deduction')
      if (deductionScene) {
        relevantContent.push(deductionScene.gameContent)
      }
    }

    return relevantContent
  }

  // 캐릭터별 응답 생성
  generateCharacterResponse(character: string, context: string, userInput: string): string {
    if (!this.originalData) return "죄송합니다. 데이터를 불러올 수 없습니다."

    const char = this.originalData.characters[character]
    if (!char) return "알 수 없는 캐릭터입니다."

    const relevantContent = this.findRelevantContent(userInput, context)
    const randomQuote = char.quotes[Math.floor(Math.random() * char.quotes.length)]

    // 캐릭터 성격에 맞는 응답 생성
    if (character === 'holmes') {
      if (userInput.includes('어떻게') || userInput.includes('왜')) {
        return `${randomQuote}\n\n${relevantContent.join(' ')} 이는 단순한 관찰과 논리적 추론의 결과입니다.`
      } else if (relevantContent.length > 0) {
        return `흥미롭군요, 왓슨. ${relevantContent[0]} 이 사실을 놓치지 마십시오.`
      } else {
        return `${randomQuote} 더 자세한 관찰이 필요합니다.`
      }
    } else if (character === 'watson') {
      if (relevantContent.length > 0) {
        return `${randomQuote}\n\n${relevantContent[0]} 정말 놀라운 발견이군요!`
      } else {
        return `${randomQuote} 홈즈, 좀 더 설명해 주시겠습니까?`
      }
    } else if (character === 'lestrade') {
      if (relevantContent.length > 0) {
        return `${randomQuote}\n\n${relevantContent[0]} 하지만 이것만으로는 법정에서 통하지 않을 것입니다.`
      } else {
        return `${randomQuote} 구체적인 증거가 필요합니다.`
      }
    }

    return `${char.name}: ${randomQuote}`
  }


  // 증거 발견 시 원문 기반 설명 생성
  generateEvidenceDescription(evidence: string): string {
    if (!this.originalData) return `${evidence}을(를) 발견했습니다.`

    const evidenceDescriptions: Record<string, string> = {
      '외상 없는 시체': '시체에는 외상의 흔적이 전혀 없습니다. 얼굴은 평온해 보이지만 입가에 미세한 거품이 있어 독살을 의심케 합니다.',
      '벽에 피로 쓰인 RACHE': '벽의 한 모서리, 벗겨진 회반죽 위에 피로 쓰인 "RACHE"라는 글자가 있습니다. 글씨체가 불안정한 것으로 보아 서둘러 쓴 것 같습니다.',
      '여자의 반지': '바닥에서 금으로 만든 여자용 결혼반지를 발견했습니다. 안쪽에 "A.C.에서 E.C.에게"라는 각인이 있습니다.',
      '독에 의한 죽음': '시체의 상태로 보아 독에 의한 죽음으로 추정됩니다. 특별한 외상 없이 갑작스럽게 죽었을 가능성이 높습니다.'
    }

    return evidenceDescriptions[evidence] || `${evidence}에 대한 자세한 관찰이 필요합니다.`
  }

  // 빅토리아 시대 분위기 텍스트 생성
  generateAtmosphericText(scene: string): string {
    if (!this.originalData) return ""

    const { setting, mood, weather } = this.originalData.atmosphere

    const atmosphericTexts: Record<string, string> = {
      'street': `${weather}가 런던 거리를 덮고 있습니다. ${setting}의 전형적인 모습이 눈앞에 펼쳐집니다.`,
      'indoor': `${mood}가 실내를 감싸고 있습니다. 가스등의 희미한 불빛이 그림자를 만들어냅니다.`,
      'crime-scene': `현장에는 ${mood}가 감돌고 있습니다. ${weather} 속에서도 진실을 찾아야 합니다.`
    }

    return atmosphericTexts[scene] || atmosphericTexts['indoor']
  }

  // 원문에서 인용구 추출
  getOriginalQuote(context: string): string {
    // 실제 구현에서는 원문 텍스트 파일에서 관련 구문을 찾아 반환
    const quotes: Record<string, string> = {
      'deduction': '"불가능한 것을 제거하면, 남은 것이 아무리 믿기 어려워도 그것이 진실이다."',
      'observation': '"보는 것과 관찰하는 것은 다르다, 왓슨."',
      'mystery': '"모든 미스터리에는 해답이 있다. 단지 우리가 아직 찾지 못했을 뿐이다."'
    }

    return quotes[context] || '"진실은 항상 단순하다."'
  }
}
