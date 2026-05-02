import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

function parseHash() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const params = new URLSearchParams(hash)
  return { token: params.get('token'), error: params.get('error') }
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const { applyToken } = useAuth()
  const [{ token, error }] = useState(parseHash)
  const [exchangeError, setExchangeError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (error || !token) return
    applyToken(token)
      .then(() => {
        const stash = localStorage.getItem('brolyu_post_login')
        localStorage.removeItem('brolyu_post_login')
        const dest = stash && stash.startsWith('/') ? stash : '/app'
        window.history.replaceState({}, '', '/auth/callback')
        navigate(dest, { replace: true })
      })
      .catch((e: unknown) => setExchangeError(e instanceof Error ? e.message : 'Sign-in failed'))
  }, [applyToken, navigate, token, error])

  const finalError = error ? decodeURIComponent(error) : !token ? 'Missing token' : exchangeError

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui' }}>
      {finalError ? (
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <h2 style={{ marginBottom: 8 }}>Sign-in failed</h2>
          <p style={{ opacity: 0.7, marginBottom: 16 }}>{finalError}</p>
          <button onClick={() => navigate('/auth', { replace: true })} style={{ padding: '8px 16px' }}>
            Back to sign in
          </button>
        </div>
      ) : (
        <div>Signing you in…</div>
      )}
    </div>
  )
}
