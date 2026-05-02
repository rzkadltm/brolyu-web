import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '../../components/Avatar/Avatar'
import { SEO } from '../../components/SEO'
import { useAuth } from '../../contexts/useAuth'
import { ApiError } from '../../lib/api'

const PRESET_COLORS: { value: string; label: string }[] = [
  { value: 'oklch(62% 0.22 265)', label: 'Indigo' },
  { value: 'oklch(62% 0.22 300)', label: 'Violet' },
  { value: 'oklch(68% 0.18 150)', label: 'Green' },
  { value: 'oklch(70% 0.18 70)', label: 'Amber' },
  { value: 'oklch(62% 0.22 25)', label: 'Red' },
  { value: 'oklch(62% 0.22 15)', label: 'Rose' },
  { value: 'oklch(64% 0.18 220)', label: 'Sky' },
  { value: 'oklch(60% 0.18 340)', label: 'Pink' },
  { value: 'oklch(58% 0.16 180)', label: 'Teal' },
  { value: 'oklch(50% 0.04 280)', label: 'Slate' },
]

const NAME_MAX = 60
const BIO_MAX = 240

const STATUS_LABELS: Record<'online' | 'away' | 'offline' | 'in_room', string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  in_room: 'In a room',
}

type FormState = {
  name: string
  bio: string
  avatarInitial: string
  avatarColor: string
}

function pickInitial(name: string, fallback: string): string {
  const trimmed = fallback.trim()
  if (trimmed) return trimmed[0].toUpperCase()
  const fromName = name.trim()[0]
  return (fromName ?? 'U').toUpperCase()
}

function ProfilePage() {
  const { user, updateProfile } = useAuth()

  const initialForm = useMemo<FormState>(() => {
    if (!user) {
      return { name: '', bio: '', avatarInitial: '', avatarColor: PRESET_COLORS[0].value }
    }
    return {
      name: user.name,
      bio: user.bio ?? '',
      avatarInitial: user.avatarInitial ?? '',
      avatarColor: user.avatarColor ?? PRESET_COLORS[0].value,
    }
  }, [user])

  const [form, setForm] = useState<FormState>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const savedTimerRef = useRef<number | null>(null)

  // Reset the form when the underlying user changes (post-hydration or after a
  // successful save). React's documented pattern: track the prior value in
  // useState and adjust during render rather than via setState in an effect.
  const [trackedBaseline, setTrackedBaseline] = useState(initialForm)
  if (trackedBaseline !== initialForm && !saving) {
    setTrackedBaseline(initialForm)
    setForm(initialForm)
  }

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current)
    }
  }, [])

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-[13px]" style={{ color: 'var(--text-m)' }}>
          Loading profile…
        </div>
      </div>
    )
  }

  const dirty =
    form.name !== initialForm.name ||
    form.bio !== initialForm.bio ||
    form.avatarInitial !== initialForm.avatarInitial ||
    form.avatarColor !== initialForm.avatarColor

  const trimmedName = form.name.trim()
  const canSave = dirty && trimmedName.length > 0 && !saving
  const previewInitial = pickInitial(form.name, form.avatarInitial)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await updateProfile({
        name: trimmedName,
        bio: form.bio.trim() || null,
        avatarInitial: form.avatarInitial.trim().toUpperCase().slice(0, 1) || null,
        avatarColor: form.avatarColor || null,
      })
      setSavedAt(Date.now())
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current)
      savedTimerRef.current = window.setTimeout(() => setSavedAt(null), 2000)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not save changes. Try again.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm(initialForm)
    setError(null)
    setSavedAt(null)
  }

  return (
    <>
      <SEO title="Profile" description="Edit your Brolyu profile, avatar, and bio." path="/profile" />

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-[18px] md:pt-[22px] pb-10 pr-[64px] md:pr-[110px]">
        <div className="max-w-[760px] mx-auto flex flex-col gap-5">
          <header className="flex flex-col gap-1">
            <h1
              className="font-display text-[22px] md:text-[26px] font-bold tracking-[-0.8px]"
              style={{ color: 'var(--text)' }}
            >
              Your <span className="text-accent">Profile</span>
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text-m)' }}>
              Update how you appear across Brolyu rooms and messages.
            </p>
          </header>

          {error && (
            <div className="pf-banner pf-banner-error" role="alert">
              {error}
            </div>
          )}
          {savedAt !== null && !error && (
            <div className="pf-banner pf-banner-success" role="status">
              Saved
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Avatar card */}
            <section className="pf-card">
              <div className="pf-card-title">Avatar</div>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex justify-center md:justify-start">
                  <Avatar
                    initial={previewInitial}
                    color={form.avatarColor}
                    size={88}
                    className="rounded-full flex items-center justify-center font-display font-bold text-white"
                    style={{
                      fontSize: 32,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="pf-field">
                    <label className="pf-label" htmlFor="pf-initial">
                      Initial
                    </label>
                    <input
                      id="pf-initial"
                      className="pf-input pf-input-mono"
                      maxLength={1}
                      value={form.avatarInitial}
                      placeholder={pickInitial(form.name, '')}
                      onChange={e =>
                        setForm(f => ({
                          ...f,
                          avatarInitial: e.target.value.toUpperCase().slice(0, 1),
                        }))
                      }
                    />
                    <div className="pf-help">A single character. Falls back to the first letter of your name.</div>
                  </div>

                  <div className="pf-field">
                    <span className="pf-label">Color</span>
                    <div className="pf-color-grid" role="radiogroup" aria-label="Avatar color">
                      {PRESET_COLORS.map(c => {
                        const selected = form.avatarColor === c.value
                        return (
                          <button
                            key={c.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={c.label}
                            title={c.label}
                            className={`pf-swatch${selected ? ' selected' : ''}`}
                            style={{ background: c.value }}
                            onClick={() => setForm(f => ({ ...f, avatarColor: c.value }))}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Identity card */}
            <section className="pf-card">
              <div className="pf-card-title">About you</div>
              <div className="flex flex-col gap-4">
                <div className="pf-field">
                  <label className="pf-label" htmlFor="pf-name">
                    Name <span className="pf-required">*</span>
                  </label>
                  <input
                    id="pf-name"
                    className="pf-input"
                    required
                    maxLength={NAME_MAX}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <div className="pf-counter">
                    {form.name.length}/{NAME_MAX}
                  </div>
                </div>

                <div className="pf-field">
                  <label className="pf-label" htmlFor="pf-bio">
                    Bio
                  </label>
                  <textarea
                    id="pf-bio"
                    className="pf-input pf-textarea"
                    rows={4}
                    maxLength={BIO_MAX}
                    placeholder="Tell people what you're learning, working on, or curious about."
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  />
                  <div className="pf-counter">
                    {form.bio.length}/{BIO_MAX}
                  </div>
                </div>
              </div>
            </section>

            {/* Read-only card */}
            <section className="pf-card">
              <div className="pf-card-title">Account</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="pf-readonly">
                  <div className="pf-readonly-label">Email</div>
                  <div className="pf-readonly-value" title={user.email}>
                    {user.email}
                  </div>
                </div>
                <div className="pf-readonly">
                  <div className="pf-readonly-label">Username</div>
                  <div className="pf-readonly-value">@{user.username}</div>
                </div>
                <div className="pf-readonly">
                  <div className="pf-readonly-label">Status</div>
                  <div className="pf-readonly-value">{STATUS_LABELS[user.status]}</div>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="pf-btn pf-btn-ghost"
                onClick={handleCancel}
                disabled={!dirty || saving}
              >
                Cancel
              </button>
              <button type="submit" className="pf-btn pf-btn-primary" disabled={!canSave}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
