import { ApiError, tokenStore } from '../../lib/api'
import type { Room, TagColor } from '../../data/rooms'

export interface ApiRoom {
  publicId: string
  name: string
  description: string | null
  category: { slug: string; label: string } | null
  host: {
    id: string
    username: string
    name: string
    avatarUrl: string | null
  }
  primaryLangCode: string | null
  visibility: 'public' | 'unlisted' | 'private'
  status: 'live' | 'ended' | 'cancelled'
  gradientFrom: string | null
  gradientTo: string | null
  maxSpeakers: number
  allowVideo: boolean
  allowScreenShare: boolean
  isRecording: boolean
  speakerCount: number
  listenerCount: number
  startedAt: string | null
  endedAt: string | null
  lastActivityAt: string
  createdAt: string
}

export interface CreateRoomInput {
  name: string
  description?: string
  categorySlug?: string
  primaryLangCode?: string
  gradientFrom?: string
  gradientTo?: string
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

export const roomsApi = {
  list: (categorySlug?: string) =>
    request<ApiRoom[]>(
      `/rooms${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ''}`,
    ),
  get: (publicId: string) => request<ApiRoom>(`/rooms/${publicId}`),
  create: (input: CreateRoomInput) =>
    request<ApiRoom>('/rooms', { method: 'POST', body: JSON.stringify(input) }),
  end: (publicId: string) =>
    request<ApiRoom>(`/rooms/${publicId}/end`, { method: 'PATCH' }),
}

// Slug → frontend filter chip label. Anything not listed maps to itself.
const CATEGORY_LABEL_BY_SLUG: Record<string, string> = {
  'language-exchange': 'Language',
  study: 'Study',
  games: 'Games',
  friends: 'Friends',
  music: 'Music',
}

const FALLBACK_GRADIENT_FROM = '#6366f1'
const FALLBACK_GRADIENT_TO = '#8b5cf6'

// Map server room → existing UI Room shape. Speaker/tag arrays are
// synthesised from host + category until the participants slice lands and
// we have real per-participant data.
export function apiRoomToUiRoom(r: ApiRoom): Room {
  const from = r.gradientFrom ?? FALLBACK_GRADIENT_FROM
  const to = r.gradientTo ?? FALLBACK_GRADIENT_TO
  const initial = (r.host.name?.[0] ?? r.host.username[0] ?? '?').toUpperCase()
  const tagColor: TagColor = pickTagColor(r.category?.slug)

  return {
    id: r.publicId,
    name: r.name,
    live: r.status === 'live',
    strip: `linear-gradient(90deg,${from},${to})`,
    speakers: [
      {
        initial,
        color: from,
        name: r.host.name || r.host.username,
        speaking: r.status === 'live',
      },
    ],
    tags: r.category
      ? [{ label: r.category.label, color: tagColor }]
      : [],
    listeners: r.listenerCount,
    category: r.category ? CATEGORY_LABEL_BY_SLUG[r.category.slug] ?? r.category.label : '',
  }
}

function pickTagColor(slug: string | undefined): TagColor {
  switch (slug) {
    case 'language-exchange':
      return 'blue'
    case 'study':
      return 'amber'
    case 'games':
      return 'rose'
    case 'friends':
      return 'purple'
    case 'music':
      return 'green'
    default:
      return 'blue'
  }
}
