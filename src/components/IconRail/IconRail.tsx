import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

type RailItem = {
  icon: string
  label: string
  to: string
  badge?: number
  requiresAuth?: boolean
}

const ITEMS: RailItem[] = [
  { to: '/app', icon: '🏠', label: 'Discover' },
  { to: '/messages', icon: '💬', label: 'Messages', badge: 3, requiresAuth: true },
]

function IconRail() {
  const { user } = useAuth()
  const items = ITEMS.filter(item => !item.requiresAuth || user)

  return (
    <>
      {/* Desktop side rail */}
      <nav className="ap-rail hidden md:flex" aria-label="Primary">
        <div className="ap-rail-logo" aria-hidden="true">B</div>
        <div className="ap-rail-sep" />
        {items.map(item => (
          <NavLink
            key={item.label}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) => `ap-rail-btn${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.badge !== undefined && <div className="ap-rail-badge">{item.badge}</div>}
          </NavLink>
        ))}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="ap-rail-mobile md:hidden" aria-label="Primary">
        {items.map(item => (
          <NavLink
            key={item.label}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) => `ap-rail-mobile-btn${isActive ? ' active' : ''}`}
          >
            <span className="ap-rail-mobile-icon">{item.icon}</span>
            <span className="ap-rail-mobile-label">{item.label}</span>
            {item.badge !== undefined && <div className="ap-rail-mobile-badge">{item.badge}</div>}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default IconRail
