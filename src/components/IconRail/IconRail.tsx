import { NavLink } from 'react-router-dom'
import { useTheme } from '../../contexts/useTheme'

type RailItem = {
  icon: string
  label: string
  to?: string
  badge?: number
}

const ITEMS: RailItem[] = [
  { to: '/app', icon: '🏠', label: 'Discover' },
  { to: '/messages', icon: '💬', label: 'Messages', badge: 3 },
  { icon: '🔍', label: 'Explore' },
  { icon: '📚', label: 'Library' },
  { icon: '🎮', label: 'Games' },
]

function IconRail() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="ap-rail" aria-label="Primary">
      <div className="ap-rail-logo" aria-hidden="true">B</div>
      <div className="ap-rail-sep" />
      {ITEMS.map(item =>
        item.to ? (
          <NavLink
            key={item.label}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) => `ap-rail-btn${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.badge !== undefined && <div className="ap-rail-badge">{item.badge}</div>}
          </NavLink>
        ) : (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            className="ap-rail-btn"
          >
            {item.icon}
            {item.badge !== undefined && <div className="ap-rail-badge">{item.badge}</div>}
          </button>
        ),
      )}
      <div className="mt-auto flex flex-col items-center gap-2">
        <button
          type="button"
          aria-label="Toggle theme"
          className="ap-rail-btn"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button type="button" aria-label="Account" className="ap-rail-avatar">U</button>
      </div>
    </nav>
  )
}

export default IconRail
