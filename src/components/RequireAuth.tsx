import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

interface Props {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui', opacity: 0.6 }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/auth" replace state={{ from }} />
  }

  return <>{children}</>
}
