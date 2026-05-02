import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import IconRail from '../components/IconRail/IconRail'
import { useAuth } from '../contexts/useAuth'
import { useTheme } from '../contexts/useTheme'

function AppShell() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isMessages = pathname === '/messages'
  const isApp = pathname === '/app'

  const [menuOpen, setMenuOpen] = useState(false)
  const [trackedPath, setTrackedPath] = useState(pathname)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  // Close on route change. Comparing the tracked path against the live one
  // during render is React's documented "previous value" pattern and avoids
  // the cascading-render warning that an effect-based reset triggers.
  if (trackedPath !== pathname) {
    setTrackedPath(pathname)
    if (menuOpen) setMenuOpen(false)
  }

  // Close on outside click + Escape.
  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const initial = user?.avatarInitial ?? user?.name?.[0] ?? 'U'
  const avatarColor = user?.avatarColor ?? null

  function handleSignOut() {
    setMenuOpen(false)
    signOut()
    navigate('/auth')
  }

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />
      <main className="flex flex-col flex-1 overflow-hidden relative pb-[60px] md:pb-0">
        {!isMessages && (
        <div className="ap-shell-cluster">
          <button
            type="button"
            className={`ap-theme-btn ${isApp ? 'flex' : 'hidden md:flex'}`}
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-label="Account"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              className="ap-rail-avatar"
              style={avatarColor ? { background: avatarColor } : undefined}
              onClick={() => setMenuOpen(o => !o)}
            >
              {initial}
            </button>
            {menuOpen && (
              <div
                ref={menuRef}
                id={menuId}
                role="menu"
                aria-label="Account menu"
                className="pf-menu"
              >
                <NavLink
                  to="/profile"
                  role="menuitem"
                  className="pf-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="pf-menu-item-icon" aria-hidden="true">👤</span>
                  Profile
                </NavLink>
                <button
                  type="button"
                  role="menuitem"
                  className="pf-menu-item pf-menu-item-danger"
                  onClick={handleSignOut}
                >
                  <span className="pf-menu-item-icon" aria-hidden="true">↩</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
