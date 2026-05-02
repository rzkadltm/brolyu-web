import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import HomePage from './prototypes/HomePage'
import AuthPage from './prototypes/AuthPage'
import AppPage from './prototypes/AppPage'
import MessagesPage from './prototypes/MessagesPage'
import RoomPage from './prototypes/RoomPage'
import AuthCallback from './pages/AuthCallback'
import { RequireAuth } from './components/RequireAuth'

function RoomPageKeyed() {
  const { id } = useParams()
  return <RoomPage key={id} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/app" element={<RequireAuth><AppPage /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/room/:id" element={<RequireAuth><RoomPageKeyed /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
