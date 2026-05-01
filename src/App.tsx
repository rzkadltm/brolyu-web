import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import DiscoverPage from './features/discover/DiscoverPage'
import MessagesPage from './features/messages/MessagesPage'
import RoomPage from './pages/RoomPage'

function RoomPageKeyed() {
  const { id } = useParams()
  return <RoomPage key={id} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route element={<AppShell />}>
          <Route path="/app" element={<DiscoverPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>
        <Route path="/room/:id" element={<RoomPageKeyed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
