import { AnimatePresence, motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import IconRail from '../components/IconRail/IconRail'
import { useTheme } from '../contexts/useTheme'

function AppShell() {
  const { theme } = useTheme()
  const location = useLocation()

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />
      <main className="flex flex-col flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default AppShell
