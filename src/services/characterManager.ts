import { Character, StoryData } from '@/types/story'

export class CharacterManager {
  private characters: Record<string, Character> = {}
  private storyData: StoryData | null = null

  // 스토리 데이터 로드
  async loadStoryData(storyId: string): Promise<void> {
    try {
      // 동적으로 스토리 데이터 로드
      const storyModule = await this.loadStoryModule(storyId)
      this.storyData = storyModule
      this.characters = storyModule.characters
    } catch (error) {
      console.error(`Failed to load story data for ${storyId}:`, error)
      throw error
    }
  }

  private async loadStoryModule(storyId: string): Promise<StoryData> {
    switch (storyId) {
      case 'red-study':
        return this.loadSherlockData()
      case 'romeo-and-juliet':
        return this.loadRomeoData()
      default:
        throw new Error(`Unknown story ID: ${storyId}`)
    }
  }

  private async loadSherlockData(): Promise<StoryData> {
    return {
      id: 'red-study',
      title: '주홍색 연구',
      author: '아서 코난 도일',
      description: '셜록 홈즈의 첫 번째 모험',
      setting: {
        time: '1881년 빅토리아 시대',
        location: '런던',
        atmosphere: '미스터리하고 추리적인'
      },
      characters: {
        'holmes': {
          id: 'holmes',
          name: '셜록 홈즈',
          role: '세계 최고의 탐정',
          personality: '냉철하고 논리적이며 관찰력이 뛰어난',
          avatar: 'H'
        },
        'watson': {
          id: 'watson',
          name: '왓슨 박사',
          role: '홈즈의 조력자이자 친구',
          personality: '따뜻하고 실용적이며 의료진',
          avatar: 'W'
        },
        'lestrade': {
          id: 'lestrade',
          name: '레스트레이드 경감',
          role: '스코틀랜드 야드 경찰',
          personality: '현실적이고 때로는 의존적인',
          avatar: 'L'
        },
        'witness': {
          id: 'witness',
          name: '목격자',
          role: '사건 관련 인물',
          personality: '다양한 성격',
          avatar: 'N'
        }
      },
      storyProgression: {
        acts: {
          'investigation': {
            title: '수사 시작',
            scenes: [
              {
                id: 'crime-scene',
                title: '범죄 현장',
                description: '로리스턴 가든의 의문의 죽음',
                keywords: ['rache', '시체', '현장조사', '단서'],
                progress: 25
              },
              {
                id: 'evidence-analysis',
                title: '증거 분석',
                description: '발견된 단서들을 분석',
                keywords: ['반지', '독', '추리', '분석'],
                progress: 50
              }
            ],
            progressRange: [0, 50]
          },
          'deduction': {
            title: '추리와 해결',
            scenes: [
              {
                id: 'final-deduction',
                title: '최종 추리',
                description: '모든 단서를 종합한 결론',
                keywords: ['범인', '동기', '해결', '진실'],
                progress: 100
              }
            ],
            progressRange: [51, 100]
          }
        },
        totalScenes: 3,
        keywordSystem: {
          categories: {
            'investigation': {
              name: '수사',
              keywords: ['rache', '시체', '현장조사', '단서', '반지', '독'],
              weight: 1.0
            },
            'deduction': {
              name: '추리',
              keywords: ['추리', '분석', '범인', '동기', '해결', '진실'],
              weight: 1.5
            }
          },
          totalKeywords: 12,
          progressPerKeyword: 8.33 // 100 / 12
        }
      },
      gameConfig: {
        playerRole: 'single',
        difficulty: 'medium',
        estimatedTime: '30-45분',
        genre: '추리'
      },
      themes: ['추리', '정의', '논리적 사고', '관찰력']
    }
  }

  private async loadRomeoData(): Promise<StoryData> {
    return {
      id: 'romeo-and-juliet',
      title: '로미오와 줄리엣',
      author: '윌리엄 셰익스피어',
      description: '베로나의 두 원수 가문 사이의 사랑 이야기',
      setting: {
        time: '중세 후기 이탈리아',
        location: '베로나',
        atmosphere: '로맨틱하면서도 비극적인'
      },
      characters: {
        'romeo': {
          id: 'romeo',
          name: '로미오',
          role: '몬태규 가의 아들',
          personality: '열정적이고 로맨틱한 젊은 귀족',
          avatar: 'R',
          faction: 'montague'
        },
        'juliet': {
          id: 'juliet',
          name: '줄리엣',
          role: '캐퓰릿 가의 딸',
          personality: '순수하면서도 의지가 강한 소녀',
          avatar: 'J',
          faction: 'capulet'
        },
        'nurse': {
          id: 'nurse',
          name: '유모',
          role: '줄리엣의 유모',
          personality: '따뜻하고 수다스러운',
          avatar: 'N',
          faction: 'capulet'
        },
        'friar': {
          id: 'friar',
          name: '로렌스 신부',
          role: '프란체스코회 수사',
          personality: '지혜롭고 자비로운',
          avatar: 'F',
          faction: 'neutral'
        },
        'mercutio': {
          id: 'mercutio',
          name: '머큐쇼',
          role: '로미오의 친구',
          personality: '재치 있고 장난기 많은',
          avatar: 'Me',
          faction: 'neutral'
        },
        'tybalt': {
          id: 'tybalt',
          name: '티볼트',
          role: '줄리엣의 사촌',
          personality: '호전적이고 가문의 명예를 중시하는',
          avatar: 'T',
          faction: 'capulet'
        }
      },
      storyProgression: {
        acts: {
          'meeting': {
            title: '운명적 만남',
            scenes: [
              {
                id: 'party',
                title: '캐퓰릿 가의 파티',
                description: '가면무도회에서의 첫 만남',
                keywords: ['파티', '가면무도회', '만남', '첫눈에', '사랑'],
                progress: 20
              },
              {
                id: 'balcony',
                title: '발코니 장면',
                description: '발코니에서의 사랑 고백',
                keywords: ['발코니', '사랑고백', '달', '별', '맹세'],
                progress: 40
              }
            ],
            progressRange: [0, 40]
          },
          'marriage': {
            title: '비밀 결혼',
            scenes: [
              {
                id: 'wedding',
                title: '비밀 결혼식',
                description: '로렌스 신부의 주례로 비밀 결혼',
                keywords: ['결혼', '비밀', '로렌스', '신부', '교회'],
                progress: 60
              }
            ],
            progressRange: [41, 60]
          },
          'conflict': {
            title: '갈등과 비극',
            scenes: [
              {
                id: 'duel',
                title: '결투',
                description: '머큐쇼와 티볼트의 결투',
                keywords: ['결투', '죽음', '머큐쇼', '티볼트', '복수'],
                progress: 80
              },
              {
                id: 'ending',
                title: '결말',
                description: '사랑의 결말을 결정하는 순간',
                keywords: ['결말', '선택', '희생', '화해', '사랑'],
                progress: 100
              }
            ],
            progressRange: [61, 100]
          }
        },
        totalScenes: 5,
        keywordSystem: {
          categories: {
            'love': {
              name: '사랑',
              keywords: ['사랑', '만남', '첫눈에', '사랑고백', '맹세', '결혼'],
              weight: 1.2
            },
            'conflict': {
              name: '갈등',
              keywords: ['갈등', '결투', '죽음', '복수', '가문', '원수'],
              weight: 1.0
            },
            'resolution': {
              name: '해결',
              keywords: ['화해', '희생', '선택', '결말', '평화'],
              weight: 1.5
            }
          },
          totalKeywords: 17,
          progressPerKeyword: 5.88 // 100 / 17
        }
      },
      gameConfig: {
        playerRole: 'multiple_choice',
        availableCharacters: ['romeo', 'juliet'],
        difficulty: 'hard',
        estimatedTime: '45-60분',
        genre: '로맨스/비극'
      },
      themes: ['사랑과 증오', '운명과 선택', '가족과 개인', '청춘의 열정']
    }
  }

  // 캐릭터 정보 조회
  getCharacter(characterId: string): Character | null {
    return this.characters[characterId] || null
  }

  // 모든 캐릭터 조회
  getAllCharacters(): Record<string, Character> {
    return this.characters
  }

  // 가문/진영별 캐릭터 조회
  getCharactersByFaction(faction: string): Character[] {
    return Object.values(this.characters).filter(char => char.faction === faction)
  }

  // 플레이어 캐릭터 조회
  getPlayerCharacters(): Character[] {
    if (!this.storyData?.gameConfig.availableCharacters) {
      return []
    }
    return this.storyData.gameConfig.availableCharacters
      .map(id => this.characters[id])
      .filter(char => char !== undefined)
  }

  // 스토리 데이터 조회
  getStoryData(): StoryData | null {
    return this.storyData
  }

  // 캐릭터의 대화 스타일 조회
  getCharacterDialogueStyle(characterId: string): string {
    const character = this.getCharacter(characterId)
    if (!character) return 'neutral'

    // 캐릭터별 대화 스타일 매핑
    const styleMap: Record<string, string> = {
      'holmes': 'analytical_detective',
      'watson': 'supportive_friend',
      'lestrade': 'official_police',
      'romeo': 'romantic_youth',
      'juliet': 'innocent_maiden',
      'nurse': 'caring_elder',
      'friar': 'wise_counselor',
      'mercutio': 'witty_friend',
      'tybalt': 'aggressive_noble'
    }

    return styleMap[characterId] || 'neutral'
  }
}

