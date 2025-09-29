import React from 'react'
import { Link } from 'react-router-dom'

interface Story {
  id: string
  title: string
  author: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  genre: string
  estimatedTime: string
  isAvailable: boolean
}

const stories: Story[] = [
  {
    id: 'red-study',
    title: '주홍색 연구',
    author: '아서 코난 도일',
    description: '셜록 홈즈의 첫 번째 모험. 로리스턴 가든의 의문의 죽음을 조사하세요.',
    difficulty: 'medium',
    genre: '추리',
    estimatedTime: '30-45분',
    isAvailable: true
  },
  {
    id: 'romeo-and-juliet',
    title: '로미오와 줄리엣',
    author: '윌리엄 셰익스피어',
    description: '베로나의 두 원수 가문 사이에서 피어난 비극적 사랑 이야기. 다른 결말을 만들어보세요.',
    difficulty: 'hard',
    genre: '로맨스/비극',
    estimatedTime: '45-60분',
    isAvailable: true
  },
  {
    id: 'coming-soon-1',
    title: '오만과 편견',
    author: '제인 오스틴',
    description: '엘리자베스 베넷과 다아시의 사랑 이야기 (준비 중)',
    difficulty: 'medium',
    genre: '로맨스',
    estimatedTime: '40-50분',
    isAvailable: false
  },
  {
    id: 'coming-soon-2', 
    title: '위대한 개츠비',
    author: 'F. 스콧 피츠제럴드',
    description: '1920년대 미국을 배경으로 한 사랑과 꿈의 이야기 (준비 중)',
    difficulty: 'hard',
    genre: '드라마',
    estimatedTime: '50-70분',
    isAvailable: false
  }
]

const StorySelector: React.FC = () => {
  const getDifficultyColor = (difficulty: Story['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-sherlock-text-secondary'
    }
  }

  const getDifficultyText = (difficulty: Story['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '쉬움'
      case 'medium': return '보통'
      case 'hard': return '어려움'
      default: return '알 수 없음'
    }
  }

  return (
    <div className="min-h-screen bg-sherlock-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-sherlock-accent mb-4">
            문학 속 모험
          </h1>
          <p className="text-sherlock-text-secondary text-lg max-w-2xl mx-auto">
            고전 문학 작품 속 주인공이 되어 새로운 이야기를 만들어보세요. 
            AI와 함께하는 몰입감 있는 인터랙티브 스토리 경험을 즐겨보세요.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`sherlock-card relative overflow-hidden transition-all duration-300 ${
                story.isAvailable 
                  ? 'hover:border-sherlock-accent cursor-pointer transform hover:-translate-y-1' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Availability Badge */}
              <div className="absolute top-4 right-4">
                {story.isAvailable ? (
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    플레이 가능
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                    준비 중
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-sherlock-text mb-2">
                    {story.title}
                  </h2>
                  <p className="text-sherlock-accent text-sm">
                    {story.author}
                  </p>
                </div>

                <p className="text-sherlock-text-secondary mb-6 leading-relaxed">
                  {story.description}
                </p>

                {/* Story Info */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sherlock-text-secondary">장르:</span>
                    <span className="text-sherlock-text">{story.genre}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sherlock-text-secondary">난이도:</span>
                    <span className={getDifficultyColor(story.difficulty)}>
                      {getDifficultyText(story.difficulty)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sherlock-text-secondary">소요시간:</span>
                    <span className="text-sherlock-text">{story.estimatedTime}</span>
                  </div>
                </div>

                {/* Action Button */}
                {story.isAvailable ? (
                  <Link
                    to={`/game/${story.id}`}
                    className="block w-full sherlock-button text-center"
                  >
                    모험 시작하기
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full sherlock-button opacity-50 cursor-not-allowed text-center"
                  >
                    준비 중...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <div className="sherlock-card inline-block">
            <p className="text-sherlock-text-secondary text-sm">
              💡 각 이야기는 AI와의 대화를 통해 진행됩니다. 
              당신의 선택이 이야기의 결말을 바꿀 수 있습니다!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StorySelector

