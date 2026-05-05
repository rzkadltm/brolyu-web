import { ApiError, tokenStore } from '../../lib/api'

export interface IceServer {
  urls: string[]
  username?: string
  credential?: string
}

export interface IceServersResponse {
  iceServers: IceServer[]
}

const BASE =
  (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '') +
  '/api/v1'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const text = await res.text()
  const data: unknown = text ? JSON.parse(text) : null

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : null) ?? `Request failed (${res.status})`
    throw new ApiError(res.status, msg)
  }
  return data as T
}

export const voiceApi = {
  turnCredentials: () =>
    request<IceServersResponse>('/turn/credentials', { method: 'POST' }),
}
