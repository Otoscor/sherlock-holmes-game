import { Link } from 'react-router-dom'

const MenuPage = () => {
  return (
    <div className="min-h-screen bg-sherlock-dark p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-sherlock-accent mb-4">
            문학 속 모험
          </h1>
          <h2 className="text-2xl text-sherlock-text mb-4">
            인터랙티브 스토리 게임
          </h2>
          <p className="text-lg text-sherlock-text-secondary max-w-2xl mx-auto">
            고전 문학 작품 속 주인공이 되어 AI와 함께 새로운 이야기를 만들어보세요.
            당신의 선택이 이야기의 결말을 바꿀 수 있습니다.
          </p>
        </div>

        {/* Story Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 셜록 홈즈 - 첫 번째 */}
          <div className="sherlock-card relative overflow-hidden transition-all duration-300 hover:border-sherlock-accent cursor-pointer transform hover:-translate-y-1">
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                플레이 가능
              </span>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-sherlock-text mb-2">
                  🔍 주홍색 연구
                </h2>
                <p className="text-sherlock-accent text-sm">
                  아서 코난 도일
                </p>
              </div>

              <p className="text-sherlock-text-secondary mb-6 leading-relaxed">
                셜록 홈즈의 첫 번째 모험. 로리스턴 가든의 의문의 죽음을 조사하세요.
                세계 최고의 탐정이 되어 미스터리를 풀어보세요.
              </p>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sherlock-text-secondary">장르:</span>
                  <span className="text-sherlock-text">추리</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sherlock-text-secondary">난이도:</span>
                  <span className="text-yellow-400">보통</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sherlock-text-secondary">소요시간:</span>
                  <span className="text-sherlock-text">30-45분</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/story/red-study"
                  className="block w-full sherlock-button text-center bg-sherlock-gray hover:bg-sherlock-medium-gray text-sherlock-text border border-sherlock-border"
                >
                  📖 자세히 보기
                </Link>
                <Link
                  to="/game/red-study"
                  className="block w-full sherlock-button text-center"
                >
                  🚀 바로 시작하기
                </Link>
              </div>
            </div>
          </div>

          {/* 로미오와 줄리엣 - 두 번째 */}
          <div className="sherlock-card relative overflow-hidden transition-all duration-300 hover:border-sherlock-accent cursor-pointer transform hover:-translate-y-1">
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                플레이 가능
              </span>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-sherlock-text mb-2">
                  💕 로미오와 줄리엣
                </h2>
                <p className="text-sherlock-accent text-sm">
                  윌리엄 셰익스피어
                </p>
              </div>

              <p className="text-sherlock-text-secondary mb-6 leading-relaxed">
                베로나의 두 원수 가문 사이에서 피어난 비극적 사랑 이야기.
                다른 결말을 만들어 해피엔딩을 만들어보세요.
              </p>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sherlock-text-secondary">장르:</span>
                  <span className="text-sherlock-text">로맨스/비극</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sherlock-text-secondary">난이도:</span>
                  <span className="text-red-400">어려움</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sherlock-text-secondary">소요시간:</span>
                  <span className="text-sherlock-text">45-60분</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/story/romeo-and-juliet"
                  className="block w-full sherlock-button text-center bg-sherlock-gray hover:bg-sherlock-medium-gray text-sherlock-text border border-sherlock-border"
                >
                  📖 자세히 보기
                </Link>
                <Link
                  to="/game/romeo-and-juliet"
                  className="block w-full sherlock-button text-center"
                >
                  🚀 바로 시작하기
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="text-center space-y-4">
          <button className="sherlock-button text-lg px-6 py-3 opacity-50 cursor-not-allowed">
            💾 저장된 게임 불러오기 (준비 중)
          </button>
          
          <button className="sherlock-button text-lg px-6 py-3 opacity-50 cursor-not-allowed">
            ⚙️ 설정 (준비 중)
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
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

export default MenuPage
