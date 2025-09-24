import { Link } from 'react-router-dom'

const MenuPage = () => {
  return (
    <div className="sherlock-container min-h-screen flex flex-col justify-center items-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-sherlock-accent mb-2">
            셜록 홈즈
          </h1>
          <h2 className="text-2xl text-sherlock-text">
            추리 게임
          </h2>
          <p className="text-lg text-sherlock-text-secondary max-w-2xl">
            빅토리아 시대 런던에서 펼쳐지는 미스터리한 사건들을 해결해보세요.
            당신이 바로 세계 최고의 탐정, 셜록 홈즈입니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/game" className="block sherlock-button text-xl px-8 py-4">
            주홍색 연구 시작
          </Link>
          
          <button className="block sherlock-button text-xl px-8 py-4 opacity-50 cursor-not-allowed">
            저장된 게임 불러오기 (준비 중)
          </button>
          
          <button className="block sherlock-button text-xl px-8 py-4 opacity-50 cursor-not-allowed">
            설정 (준비 중)
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuPage
