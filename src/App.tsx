import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'

import AppPage from './pages/AppPage'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'

function RoomPageKeyed() {
  const { id } = useParams()
  return <RoomPage key={id} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/room/:id" element={<RoomPageKeyed />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
