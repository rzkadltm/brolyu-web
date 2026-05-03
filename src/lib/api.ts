export interface Identity {
  provider: string
  email: string | null
  linkedAt: string
}

export interface User {
  id: string
  email: string
  emailVerified: boolean
  username: string
  name: string
  avatarUrl: string | null
  bio: string | null
  status: 'online' | 'away' | 'offline' | 'in_room'
  createdAt: string
  // Only present on /auth/me; auth flows omit it.
  identities?: Identity[]
}

export interface AuthSuccess {
  token: string
  user: User
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const TOKEN_KEY = 'brolyu_token'

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function send<T>(path: string, init: RequestInit, jsonBody: boolean): Promise<T> {
  const headers = new Headers(init.headers)
  if (jsonBody && init.body && !headers.has('Content-Type')) {
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

function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  return send<T>(path, init, true)
}

function requestRaw<T>(path: string, init: RequestInit = {}): Promise<T> {
  return send<T>(path, init, false)
}

export const api = {
  register: (email: string, name?: string) =>
    request<AuthSuccess>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, ...(name ? { name } : {}) }),
    }),
  login: (email: string) =>
    request<AuthSuccess>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  me: () => request<User>('/auth/me'),
  updateProfile: (body: Partial<Pick<User, 'name' | 'bio'>>) =>
    request<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  uploadAvatar: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return requestRaw<User>('/auth/me/avatar', { method: 'POST', body: fd })
  },
  deleteAvatar: () => requestRaw<User>('/auth/me/avatar', { method: 'DELETE' }),

  // Generic OAuth start. Add a provider on the server (one new file +
  // module entry) and you can call oauthStartUrl('github') here too.
  oauthStartUrl: (provider: string) => `${BASE}/auth/oauth/${provider}`,

  /** @deprecated use oauthStartUrl('google'). Kept for the alias route. */
  googleStartUrl: () => `${BASE}/auth/oauth/google`,
}
