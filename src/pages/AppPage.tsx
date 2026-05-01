import IconRail from '../components/IconRail/IconRail'
import { useTheme } from '../contexts/useTheme'
import DiscoverPage from '../features/discover/DiscoverPage'

function AppPage() {
  const { theme } = useTheme()

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />
      <main className="flex flex-col flex-1 overflow-hidden">
        <DiscoverPage />
      </main>
    </div>
  )
}

export default AppPage
