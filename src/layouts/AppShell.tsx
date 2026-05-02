import { Outlet } from 'react-router-dom'
import IconRail from '../components/IconRail/IconRail'
import { useTheme } from '../contexts/useTheme'

function AppShell() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />
      <main className="flex flex-col flex-1 overflow-hidden relative">
        <div className="ap-shell-cluster">
          <button
            type="button"
            className="ap-theme-btn"
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
