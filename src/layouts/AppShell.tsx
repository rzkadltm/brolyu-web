import { Outlet, useLocation } from 'react-router-dom'
import IconRail from '../components/IconRail/IconRail'
import { useTheme } from '../contexts/useTheme'

function AppShell() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const isMessages = pathname === '/messages'
  const isApp = pathname === '/app'

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />
      <main className="flex flex-col flex-1 overflow-hidden relative pb-[60px] md:pb-0">
        <div className={`ap-shell-cluster${isMessages ? ' hidden md:flex' : ''}`}>
          <button
            type="button"
            className={`ap-theme-btn ${isApp ? 'flex' : 'hidden md:flex'}`}
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" aria-label="Account" className="ap-rail-avatar">U</button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
