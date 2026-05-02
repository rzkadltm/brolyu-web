import { NavLink } from 'react-router-dom'

type RailItem = {
  icon: string
  label: string
  to: string
  badge?: number
}

const ITEMS: RailItem[] = [
  { to: '/app', icon: '🏠', label: 'Discover' },
  { to: '/messages', icon: '💬', label: 'Messages', badge: 3 },
]

function IconRail() {
  return (
    <nav className="ap-rail" aria-label="Primary">
      <div className="ap-rail-logo" aria-hidden="true">B</div>
      <div className="ap-rail-sep" />
      {ITEMS.map(item => (
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
  )
}

export default IconRail
