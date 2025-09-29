import { Routes, Route } from 'react-router-dom'
import MenuPage from '@/pages/MenuPage'
import GamePage from '@/pages/GamePage'
import StoryDetailPage from '@/pages/StoryDetailPage'
import ChatbotPage from '@/pages/ChatbotPage'

function App() {
  return (
    <div className="min-h-screen bg-sherlock-dark">
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/story/:storyId" element={<StoryDetailPage />} />
        <Route path="/story/:storyId/chat/:characterId" element={<ChatbotPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/:storyId" element={<GamePage />} />
      </Routes>
    </div>
  )
}

export default App
