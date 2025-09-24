import { Routes, Route } from 'react-router-dom'
import MenuPage from '@/pages/MenuPage'
import GamePage from '@/pages/GamePage'

function App() {
  return (
    <div className="min-h-screen bg-sherlock-dark">
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </div>
  )
}

export default App
