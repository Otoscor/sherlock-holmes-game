import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import redStudyData from '@/data/cases/red-study-original.json'
import romeoJulietData from '@/data/cases/romeo-and-juliet.json'

interface StoryData {
  id: string
  title: string
  author: string
  description: string
  year?: number
  englishTitle?: string
  setting?: {
    time: string
    location: string
    atmosphere: string
  }
  characters: any
  themes?: string[]
  story_progression?: any
  gameFlow?: any
}

const StoryDetailPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()

  // 스토리 데이터 가져오기
  const getStoryData = (id: string): StoryData | null => {
    switch (id) {
      case 'red-study':
        return redStudyData as StoryData
      case 'romeo-and-juliet':
        return romeoJulietData as StoryData
      default:
        return null
    }
  }

  const storyData = storyId ? getStoryData(storyId) : null

  if (!storyData) {
    return (
      <div className="min-h-screen bg-sherlock-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-sherlock-text mb-4">스토리를 찾을 수 없습니다</h1>
          <Link to="/" className="sherlock-button">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 캐릭터 리스트 생성
  const getCharacterList = (characters: any) => {
    const characterList: Array<{ id: string; name: string; description: string; avatar: string }> = []
    
    if (storyId === 'red-study') {
      Object.entries(characters).forEach(([key, char]: [string, any]) => {
        characterList.push({
          id: key,
          name: char.name,
          description: char.description,
          avatar: char.avatar
        })
      })
    } else if (storyId === 'romeo-and-juliet') {
      Object.values(characters).forEach((family: any) => {
        Object.entries(family).forEach(([key, char]: [string, any]) => {
          characterList.push({
            id: key,
            name: char.name,
            description: `${char.role} - ${char.personality}`,
            avatar: char.avatar
          })
        })
      })
    }
    
    return characterList
  }

  const characterList = getCharacterList(storyData.characters)

  return (
    <div className="min-h-screen bg-sherlock-dark">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sherlock-text-secondary hover:text-sherlock-text mb-6 transition-colors"
          >
            <span className="mr-2">←</span>
            뒤로 가기
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-sherlock-accent mb-2">
              {storyData.title}
            </h1>
            {storyData.englishTitle && (
              <p className="text-xl text-sherlock-text-secondary mb-2">
                {storyData.englishTitle}
              </p>
            )}
            <p className="text-lg text-sherlock-text mb-4">
              {storyData.author} {storyData.year && `(${storyData.year})`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 줄거리 */}
            <div className="sherlock-card">
              <h2 className="text-2xl font-bold text-sherlock-text mb-4">📖 줄거리</h2>
              <p className="text-sherlock-text-secondary leading-relaxed text-lg">
                {storyData.description}
              </p>
              
              {/* 배경 정보 (로미오와 줄리엣용) */}
              {storyData.setting && (
                <div className="mt-6 p-4 bg-sherlock-darker rounded-lg">
                  <h3 className="text-lg font-semibold text-sherlock-text mb-3">🏛️ 배경</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-sherlock-text-secondary">시대:</span>
                      <p className="text-sherlock-text">{storyData.setting.time}</p>
                    </div>
                    <div>
                      <span className="text-sherlock-text-secondary">장소:</span>
                      <p className="text-sherlock-text">{storyData.setting.location}</p>
                    </div>
                    <div>
                      <span className="text-sherlock-text-secondary">분위기:</span>
                      <p className="text-sherlock-text">{storyData.setting.atmosphere}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 주요 테마 */}
            {storyData.themes && (
              <div className="sherlock-card">
                <h2 className="text-2xl font-bold text-sherlock-text mb-4">🎭 주요 테마</h2>
                <div className="flex flex-wrap gap-3">
                  {storyData.themes.map((theme, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-sherlock-accent text-sherlock-dark rounded-full text-sm font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 스토리 진행 (로미오와 줄리엣용) */}
            {storyData.story_progression && (
              <div className="sherlock-card">
                <h2 className="text-2xl font-bold text-sherlock-text mb-4">📚 스토리 진행</h2>
                <div className="space-y-4">
                  {Object.entries(storyData.story_progression).map(([actKey, actData]: [string, any]) => (
                    <div key={actKey} className="border-l-4 border-sherlock-accent pl-4">
                      <h3 className="text-lg font-semibold text-sherlock-text mb-2">
                        {actData.title}
                      </h3>
                      <div className="space-y-2">
                        {actData.scenes?.map((scene: any, index: number) => (
                          <div key={scene.id} className="text-sm">
                            <span className="text-sherlock-accent font-medium">
                              {scene.title}
                            </span>
                            <p className="text-sherlock-text-secondary ml-2">
                              {scene.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 게임 정보 */}
            <div className="sherlock-card">
              <h2 className="text-2xl font-bold text-sherlock-text mb-4">🎮 게임 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-sherlock-text-secondary">장르:</span>
                  <p className="text-sherlock-text">
                    {storyId === 'red-study' ? '추리' : '로맨스/비극'}
                  </p>
                </div>
                <div>
                  <span className="text-sherlock-text-secondary">난이도:</span>
                  <p className={storyId === 'red-study' ? 'text-yellow-400' : 'text-red-400'}>
                    {storyId === 'red-study' ? '보통' : '어려움'}
                  </p>
                </div>
                <div>
                  <span className="text-sherlock-text-secondary">예상 시간:</span>
                  <p className="text-sherlock-text">
                    {storyId === 'red-study' ? '30-45분' : '45-60분'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-sherlock-darker rounded-lg">
                <p className="text-sherlock-text-secondary text-sm">
                  💡 이 게임은 AI와의 대화를 통해 진행됩니다. 
                  당신의 선택에 따라 이야기의 결말이 달라질 수 있습니다!
                </p>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 게임 시작 버튼 */}
            <div className="sherlock-card text-center">
              <h3 className="text-xl font-bold text-sherlock-text mb-4">모험을 시작하세요!</h3>
              <Link
                to={`/game/${storyId}`}
                className="block w-full sherlock-button py-4 text-lg font-semibold mb-4"
              >
                🚀 게임 시작하기
              </Link>
              <p className="text-sherlock-text-secondary text-sm">
                준비되셨나요? 클릭하여 이야기 속으로 들어가세요.
              </p>
            </div>

            {/* 등장인물 */}
            <div className="sherlock-card">
              <h3 className="text-xl font-bold text-sherlock-text mb-4">👥 주요 등장인물</h3>
              <div className="space-y-3">
                {characterList.slice(0, 6).map((character, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-sherlock-darker transition-colors">
                    <div className="w-8 h-8 bg-sherlock-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sherlock-dark font-bold text-sm">
                        {character.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sherlock-text font-medium text-sm">
                        {character.name}
                      </h4>
                      <p className="text-sherlock-text-secondary text-xs mt-1 leading-relaxed">
                        {character.description}
                      </p>
                      <button
                        onClick={() => navigate(`/story/${storyId}/chat/${character.id}`)}
                        className="mt-2 px-3 py-1 bg-sherlock-accent text-sherlock-dark text-xs font-medium rounded-full hover:bg-opacity-80 transition-colors"
                      >
                        💬 1:1 대화
                      </button>
                    </div>
                  </div>
                ))}
                {characterList.length > 6 && (
                  <p className="text-sherlock-text-secondary text-xs text-center mt-3">
                    그 외 {characterList.length - 6}명의 인물이 더 등장합니다
                  </p>
                )}
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="sherlock-card">
              <h3 className="text-xl font-bold text-sherlock-text mb-4">ℹ️ 추가 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-sherlock-text-secondary">상태:</span>
                  <span className="text-green-400 font-medium">플레이 가능</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sherlock-text-secondary">언어:</span>
                  <span className="text-sherlock-text">한국어</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sherlock-text-secondary">플랫폼:</span>
                  <span className="text-sherlock-text">웹 브라우저</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryDetailPage
