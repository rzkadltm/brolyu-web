import { useState, type FormEvent } from 'react'
import { ApiError } from '../../lib/api'
import { roomsApi } from './api'
import type { ApiRoom } from './api'

interface Props {
  onCreated: (room: ApiRoom) => void
  onClose: () => void
}

const CATEGORIES: { slug: string; label: string; icon: string }[] = [
  { slug: 'language-exchange', label: 'Language', icon: '🌐' },
  { slug: 'study', label: 'Study', icon: '📚' },
  { slug: 'games', label: 'Games', icon: '🎮' },
  { slug: 'friends', label: 'Friends', icon: '👋' },
  { slug: 'music', label: 'Music', icon: '🎵' },
]

const LANGUAGES: { code: string; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
]

export function CreateRoomModal({ onCreated, onClose }: Props) {
  const [name, setName] = useState('')
  const [categorySlug, setCategorySlug] = useState<string>('')
  const [primaryLangCode, setPrimaryLangCode] = useState('en')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = !submitting && name.trim().length >= 2

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const room = await roomsApi.create({
        name: name.trim(),
        categorySlug: categorySlug || undefined,
        primaryLangCode: primaryLangCode || undefined,
      })
      onCreated(room)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not create room'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'oklch(0% 0 0 / 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'rp-fadeIn 0.2s ease both',
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md p-6 flex flex-col gap-5 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 24px)',
          boxShadow:
            '0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px var(--border2), 0 0 80px -20px var(--color-accent-glow)',
          animation: 'ap-card-in 0.32s cubic-bezier(0.34,1.1,0.64,1) both',
        }}
      >
        {/* accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: -80,
            left: -80,
            width: 240,
            height: 240,
            background:
              'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 65%)',
            filter: 'blur(8px)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            background:
              'radial-gradient(circle, oklch(62% 0.22 300 / 0.25) 0%, transparent 65%)',
            filter: 'blur(8px)',
          }}
        />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                boxShadow: '0 8px 24px -8px var(--color-accent-glow)',
                fontSize: 20,
              }}
            >
              🎙️
            </div>
            <div className="flex flex-col">
              <h2
                className="font-display text-[20px] font-bold tracking-[-0.5px] leading-tight"
                style={{ color: 'var(--text)' }}
              >
                Start a Room
              </h2>
              <span
                className="text-[12px]"
                style={{ color: 'var(--text-m)' }}
              >
                Go live in seconds
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center cursor-pointer transition-all"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-m)',
              fontSize: 14,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface2)'
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.color = 'var(--text-m)'
            }}
          >
            ✕
          </button>
        </div>

        <label className="relative flex flex-col gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.6px]"
            style={{ color: 'var(--text-m)' }}
          >
            Room name
          </span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What are you talking about?"
            required
            minLength={2}
            maxLength={120}
            autoFocus
            className="rounded-xl border px-4 py-3 text-[14px] outline-none transition-colors"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--color-accent)'
              e.currentTarget.style.background = 'var(--surface2)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface)'
            }}
          />
        </label>

        <div className="relative flex flex-col gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.6px]"
            style={{ color: 'var(--text-m)' }}
          >
            Category <span style={{ color: 'var(--text-d)' }}>· optional</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const active = categorySlug === c.slug
              return (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() =>
                    setCategorySlug(active ? '' : c.slug)
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all"
                  style={{
                    background: active
                      ? 'oklch(62% 0.22 265 / 0.16)'
                      : 'var(--surface)',
                    border: `1px solid ${
                      active ? 'var(--color-accent)' : 'var(--border)'
                    }`,
                    color: active ? 'var(--color-accent)' : 'var(--text-m)',
                    boxShadow: active
                      ? '0 4px 16px -6px var(--color-accent-glow)'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative flex flex-col gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.6px]"
            style={{ color: 'var(--text-m)' }}
          >
            Primary language
          </span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(l => {
              const active = primaryLangCode === l.code
              return (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => setPrimaryLangCode(l.code)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all"
                  style={{
                    background: active
                      ? 'oklch(62% 0.22 265 / 0.16)'
                      : 'var(--surface)',
                    border: `1px solid ${
                      active ? 'var(--color-accent)' : 'var(--border)'
                    }`,
                    color: active ? 'var(--color-accent)' : 'var(--text-m)',
                    boxShadow: active
                      ? '0 4px 16px -6px var(--color-accent-glow)'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{l.flag}</span>
                  {l.label}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div
            className="relative text-[12px] rounded-lg px-3 py-2.5 border flex items-start gap-2"
            style={{
              background: 'oklch(62% 0.22 25 / 0.1)',
              borderColor: 'oklch(62% 0.22 25 / 0.25)',
              color: 'oklch(72% 0.18 25)',
            }}
          >
            <span style={{ fontSize: 13, lineHeight: '16px' }}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="relative flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border text-[13px] font-semibold cursor-pointer transition-colors"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer text-white transition-all"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))'
                : 'oklch(62% 0.22 265 / 0.4)',
              boxShadow: canSubmit
                ? '0 8px 24px -8px var(--color-accent-glow), inset 0 1px 0 rgba(255,255,255,0.18)'
                : 'none',
              opacity: canSubmit ? 1 : 0.7,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Starting…' : 'Go Live →'}
          </button>
        </div>
      </form>
    </div>
  )
}
