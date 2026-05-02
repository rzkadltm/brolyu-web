import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import HomePage from './prototypes/HomePage'
import AuthPage from './prototypes/AuthPage'
import AppPage from './prototypes/AppPage'
import MessagesPage from './prototypes/MessagesPage'
import RoomPage from './prototypes/RoomPage'
import AuthCallback from './pages/AuthCallback'
import AppShell from './layouts/AppShell'
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
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/app" element={<AppPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/room/:id" element={<RoomPageKeyed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
