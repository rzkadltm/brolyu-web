import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppPage from './pages/AppPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
