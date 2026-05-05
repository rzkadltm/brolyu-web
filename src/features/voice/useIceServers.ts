import { useCallback, useEffect, useState } from 'react'
import { voiceApi, type IceServer } from './api'

interface State {
  iceServers: IceServer[] | null
  loading: boolean
  error: Error | null
}

// Mints short-lived ICE servers from the backend. The server controls TTL
// (default 1h). Call refresh() before reconnecting RTCPeerConnection.
export function useIceServers(enabled = true) {
  const [state, setState] = useState<State>({
    iceServers: null,
    loading: enabled,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const { iceServers } = await voiceApi.turnCredentials()
      setState({ iceServers, loading: false, error: null })
      return iceServers
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState({ iceServers: null, loading: false, error })
      throw error
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    voiceApi
      .turnCredentials()
      .then(({ iceServers }) => {
        if (!cancelled) setState({ iceServers, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const error = err instanceof Error ? err : new Error(String(err))
        setState({ iceServers: null, loading: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { ...state, refresh }
}
