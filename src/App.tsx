import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import AppPage from './pages/AppPage'
import MessagesPage from './pages/MessagesPage'
import RoomPage from './pages/RoomPage'
import AuthCallback from './pages/AuthCallback'
import AppShell from './layouts/AppShell'

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
        <Route element={<AppShell />}>
          <Route path="/app" element={<AppPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/room/:id" element={<RoomPageKeyed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
