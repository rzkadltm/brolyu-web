import { Outlet } from 'react-router-dom'
import IconRail from '../components/IconRail/IconRail'
import { useTheme } from '../contexts/useTheme'

function AppShell() {
  const { theme } = useTheme()

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />
      <main className="flex flex-col flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
