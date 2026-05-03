import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '../../components/Avatar/Avatar'
import { SEO } from '../../components/SEO'
import { useAuth } from '../../contexts/useAuth'
import { ApiError } from '../../lib/api'

const NAME_MAX = 60
const BIO_MAX = 240

const STATUS_LABELS: Record<'online' | 'away' | 'offline' | 'in_room', string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  in_room: 'In a room',
}

const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const ACCEPT_ATTR = ACCEPTED_MIME.join(',')
const MAX_AVATAR_BYTES = 5 * 1024 * 1024

type FormState = {
  name: string
  bio: string
}

function readErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return fallback
}

function ProfilePage() {
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth()

  const initialForm = useMemo<FormState>(() => {
    if (!user) return { name: '', bio: '' }
    return { name: user.name, bio: user.bio ?? '' }
  }, [user])

  const [form, setForm] = useState<FormState>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const savedTimerRef = useRef<number | null>(null)

  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSavedAt, setAvatarSavedAt] = useState<number | null>(null)
  const avatarSavedTimerRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      if (avatarSavedTimerRef.current !== null) window.clearTimeout(avatarSavedTimerRef.current)
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

  const previewInitial = (user.name.trim()[0] ?? '?').toUpperCase()

  const dirty = form.name !== initialForm.name || form.bio !== initialForm.bio
  const trimmedName = form.name.trim()
  const canSave = dirty && trimmedName.length > 0 && !saving

  function flashAvatarSaved() {
    setAvatarSavedAt(Date.now())
    if (avatarSavedTimerRef.current !== null) window.clearTimeout(avatarSavedTimerRef.current)
    avatarSavedTimerRef.current = window.setTimeout(() => setAvatarSavedAt(null), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await updateProfile({
        name: trimmedName,
        bio: form.bio.trim() || null,
      })
      setSavedAt(Date.now())
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current)
      savedTimerRef.current = window.setTimeout(() => setSavedAt(null), 2000)
    } catch (err) {
      setError(readErrorMessage(err, 'Could not save changes. Try again.'))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm(initialForm)
    setError(null)
    setSavedAt(null)
  }

  function handlePickPhoto() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const file = input.files?.[0] ?? null
    // Reset so picking the same file again still triggers change.
    input.value = ''
    if (!file) return

    setAvatarError(null)
    if (!ACCEPTED_MIME.includes(file.type)) {
      setAvatarError('Unsupported format. Use PNG, JPEG, WebP, or GIF.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Image too large. Max 5 MB.')
      return
    }

    setAvatarBusy(true)
    try {
      await uploadAvatar(file)
      flashAvatarSaved()
    } catch (err) {
      setAvatarError(readErrorMessage(err, 'Upload failed. Try again.'))
    } finally {
      setAvatarBusy(false)
    }
  }

  async function handleRemovePhoto() {
    if (!user?.avatarUrl) return
    if (!window.confirm('Remove your profile photo?')) return
    setAvatarBusy(true)
    setAvatarError(null)
    try {
      await removeAvatar()
      flashAvatarSaved()
    } catch (err) {
      setAvatarError(readErrorMessage(err, 'Could not remove photo. Try again.'))
    } finally {
      setAvatarBusy(false)
    }
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

          {/* Avatar card — uploads commit immediately, separate from the form below. */}
          <section className="pf-card">
            <div className="pf-card-title">Avatar</div>

            {avatarError && (
              <div className="pf-banner pf-banner-error" role="alert">
                {avatarError}
              </div>
            )}
            {avatarSavedAt !== null && !avatarError && (
              <div className="pf-banner pf-banner-success" role="status">
                Saved
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex justify-center md:justify-start">
                <Avatar
                  initial={previewInitial}
                  src={user.avatarUrl}
                  size={104}
                  className="rounded-full flex items-center justify-center font-display font-bold text-white"
                  style={{
                    fontSize: 38,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  }}
                />
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="pf-btn pf-btn-primary"
                    onClick={handlePickPhoto}
                    disabled={avatarBusy}
                  >
                    {avatarBusy ? 'Working…' : user.avatarUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                  {user.avatarUrl && (
                    <button
                      type="button"
                      className="pf-btn pf-btn-ghost"
                      onClick={handleRemovePhoto}
                      disabled={avatarBusy}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                <p className="pf-help">PNG, JPEG, WebP, or GIF. Up to 5 MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </section>

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
