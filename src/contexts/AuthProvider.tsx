import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, api, tokenStore, type User } from '../lib/api'
import { AuthContext, type AuthContextValue } from './AuthContext'

interface Props {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  // Only enter the loading state when there's a token to validate. Without
  // this, guest-accessible routes (e.g. /app) render their signed-out UI for
  // a tick before swapping in the authed UI on hydrate.
  const [loading, setLoading] = useState(() => tokenStore.get() !== null)

  useEffect(() => {
    if (!loading) return
    let cancelled = false
    async function hydrate() {
      try {
        const me = await api.me()
        if (!cancelled) setUser(me)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) tokenStore.clear()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
    // Hydration runs once on mount; `loading` is only read for the initial guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    const { token, user } = await api.login(email)
    tokenStore.set(token)
    setUser(user)
    return user
  }, [])

  const registerWithEmail = useCallback(async (email: string, name?: string) => {
    const { token, user } = await api.register(email, name)
    tokenStore.set(token)
    setUser(user)
    return user
  }, [])

  const signInWithOAuth = useCallback((provider: string) => {
    window.location.href = api.oauthStartUrl(provider)
  }, [])

  const signInWithGoogle = useCallback(() => signInWithOAuth('google'), [signInWithOAuth])

  const applyToken = useCallback(async (token: string) => {
    tokenStore.set(token)
    const me = await api.me()
    setUser(me)
    return me
  }, [])

  const signOut = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<Pick<User, 'name' | 'bio'>>) => {
      const updated = await api.updateProfile(patch)
      setUser(updated)
      return updated
    },
    [],
  )

  const uploadAvatar = useCallback(async (file: File) => {
    const updated = await api.uploadAvatar(file)
    setUser(updated)
    return updated
  }, [])

  const removeAvatar = useCallback(async () => {
    const updated = await api.deleteAvatar()
    setUser(updated)
    return updated
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithEmail,
      registerWithEmail,
      signInWithOAuth,
      signInWithGoogle,
      applyToken,
      signOut,
      updateProfile,
      uploadAvatar,
      removeAvatar,
    }),
    [
      user,
      loading,
      signInWithEmail,
      registerWithEmail,
      signInWithOAuth,
      signInWithGoogle,
      applyToken,
      signOut,
      updateProfile,
      uploadAvatar,
      removeAvatar,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
