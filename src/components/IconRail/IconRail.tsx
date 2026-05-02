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
    <>
      {/* Desktop side rail */}
      <nav className="ap-rail hidden md:flex" aria-label="Primary">
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

      {/* Mobile bottom nav */}
      <nav className="ap-rail-mobile md:hidden" aria-label="Primary">
        {ITEMS.map(item => (
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
