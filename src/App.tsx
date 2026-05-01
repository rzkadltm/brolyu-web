import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import HomePage from './prototypes/HomePage'
import AuthPage from './prototypes/AuthPage'
import AppPage from './prototypes/AppPage'
import MessagesPage from './prototypes/MessagesPage'
import RoomPage from './prototypes/RoomPage'

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
        <Route path="/app" element={<AppPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/room/:id" element={<RoomPageKeyed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
