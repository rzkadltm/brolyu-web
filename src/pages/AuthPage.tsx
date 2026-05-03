import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../contexts/useAuth'
// Email/manual auth disabled — Google-only for now
// import { useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { ApiError } from '../lib/api'

type Theme = 'dark' | 'light'

const POST_LOGIN_KEY = 'brolyu_post_login'

// interface AuthErrors {
//   name?: string
//   email?: string
//   form?: string
// }

function readFromState(state: unknown): string | null {
  if (state && typeof state === 'object' && 'from' in state) {
    const v = (state as { from?: unknown }).from
    if (typeof v === 'string' && v.startsWith('/')) return v
  }
  return null
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

interface SignInFormProps {
  // onSwitch: () => void  // tabs commented — Google-only auth for now
  redirectTo: string
}

function SignInForm({ redirectTo }: SignInFormProps) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  // Email/manual sign-in disabled — Google-only auth for now
  // const { signInWithEmail } = useAuth()
  // const [email, setEmail] = useState('')
  // const [errors, setErrors] = useState<AuthErrors>({})
  // const [success, setSuccess] = useState(false)
  // const formRef = useRef<HTMLDivElement>(null)
  // const navigate = useNavigate()
  //
  // function validate(): AuthErrors {
  //   const e: AuthErrors = {}
  //   if (!email) e.email = 'Email is required'
  //   else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address'
  //   return e
  // }
  //
  // async function handleSubmit(ev: React.FormEvent) {
  //   ev.preventDefault()
  //   const e = validate()
  //   setErrors(e)
  //   if (Object.keys(e).length > 0) {
  //     formRef.current?.classList.add('auth-shake')
  //     setTimeout(() => formRef.current?.classList.remove('auth-shake'), 400)
  //     return
  //   }
  //   setLoading(true)
  //   try {
  //     await signInWithEmail(email)
  //     setSuccess(true)
  //     navigate(redirectTo, { replace: true })
  //   } catch (err) {
  //     const msg =
  //       err instanceof ApiError && err.status === 404
  //         ? 'No account found for this email — try signing up.'
  //         : err instanceof Error
  //           ? err.message
  //           : 'Sign-in failed'
  //     setErrors({ form: msg })
  //     formRef.current?.classList.add('auth-shake')
  //     setTimeout(() => formRef.current?.classList.remove('auth-shake'), 400)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  function handleGoogleSignIn() {
    setLoading(true)
    localStorage.setItem(POST_LOGIN_KEY, redirectTo)
    signInWithGoogle()
  }

  // Inline success card (email flow) commented — Google OAuth redirects via /auth/callback
  // if (success) {
  //   return (
  //     <div className="auth-success-card auth-fade-in">
  //       <div className="auth-success-icon">✓</div>
  //       <div className="auth-success-title">Welcome back!</div>
  //       <div className="auth-success-sub">Signing you into Brolyu…<br />Redirecting to your rooms.</div>
  //       <button className="auth-submit-btn" style={{ marginTop: 8 }} onClick={() => navigate(redirectTo, { replace: true })}>
  //         Continue →
  //       </button>
  //     </div>
  //   )
  // }

  return (
    <div className="auth-card auth-fade-in">
      <div className="auth-card-header">
        <div className="auth-card-title">Welcome to Brolyu</div>
        <div className="auth-card-sub">Sign in with Google to continue</div>
      </div>

      {/* Sign In / Sign Up tabs commented — Google-only auth for now
      <div className="auth-tabs">
        <button className="auth-tab auth-tab-active" type="button">Sign In</button>
        <button className="auth-tab" type="button" onClick={onSwitch}>Sign Up</button>
      </div>
      */}

      <button className="auth-oauth-btn" type="button" onClick={handleGoogleSignIn} disabled={loading}>
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Email sign-in form commented — Google-only auth for now
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">or sign in with email</span>
        <div className="auth-divider-line" />
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="signin-email">Email address</label>
          <div className="auth-field-wrap">
            <span className="auth-field-icon" aria-hidden="true">✉</span>
            <input
              id="signin-email"
              className={`auth-field-input${errors.email ? ' auth-field-input-error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: '', form: '' })) }}
              autoComplete="email"
            />
          </div>
          {errors.email && <div className="auth-field-error" role="alert">⚠ {errors.email}</div>}
        </div>

        {errors.form && <div className="auth-field-error" role="alert">⚠ {errors.form}</div>}

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? <><div className="auth-spinner" /><span>Signing in...</span></> : 'Sign In →'}
        </button>
      </form>

      <div className="auth-terms-text">
        Don't have an account?{' '}
        <button type="button" className="auth-terms-link" onClick={onSwitch}>Create one free</button>
      </div>
      */}
    </div>
  )
}

// SignUpForm commented out entirely — Google-only auth for now.
// Re-enable when email/manual sign-up is brought back.
/*
interface SignUpFormProps {
  onSwitch: () => void
  redirectTo: string
}

function SignUpForm({ onSwitch, redirectTo }: SignUpFormProps) {
  const { registerWithEmail, signInWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<AuthErrors>({})
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  function validate(): AuthErrors {
    const e: AuthErrors = {}
    if (!name.trim()) e.name = 'Your name is required'
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address'
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      formRef.current?.classList.add('auth-shake')
      setTimeout(() => formRef.current?.classList.remove('auth-shake'), 400)
      return
    }
    setLoading(true)
    try {
      await registerWithEmail(email, name.trim())
      setSuccess(true)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 409
          ? 'An account with this email already exists — try signing in instead.'
          : err instanceof Error
            ? err.message
            : 'Sign-up failed'
      setErrors({ form: msg })
      formRef.current?.classList.add('auth-shake')
      setTimeout(() => formRef.current?.classList.remove('auth-shake'), 400)
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleSignUp() {
    setLoading(true)
    localStorage.setItem(POST_LOGIN_KEY, redirectTo)
    signInWithGoogle()
  }

  const firstName = name.split(' ')[0]

  if (success) {
    return (
      <div className="auth-success-card auth-fade-in">
        <div className="auth-success-icon">🎉</div>
        <div className="auth-success-title">You're in{firstName ? `, ${firstName}` : ''}!</div>
        <div className="auth-success-sub">Your Brolyu account is ready.<br />Let's find you some rooms to join.</div>
        <button className="auth-submit-btn" style={{ marginTop: 8 }} onClick={() => navigate(redirectTo, { replace: true })}>
          Continue →
        </button>
      </div>
    )
  }

  return (
    <div className="auth-card auth-fade-in" ref={formRef}>
      <div className="auth-card-header">
        <div className="auth-card-title">Create your account</div>
        <div className="auth-card-sub">Free forever · Open source · No password needed</div>
      </div>

      <div className="auth-tabs">
        <button className="auth-tab" type="button" onClick={onSwitch}>Sign In</button>
        <button className="auth-tab auth-tab-active" type="button">Sign Up</button>
      </div>

      <button className="auth-oauth-btn" type="button" onClick={handleGoogleSignUp} disabled={loading}>
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">or create with email</span>
        <div className="auth-divider-line" />
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="signup-name">Full name</label>
          <div className="auth-field-wrap">
            <span className="auth-field-icon" aria-hidden="true">👤</span>
            <input
              id="signup-name"
              className={`auth-field-input${errors.name ? ' auth-field-input-error' : ''}`}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '', form: '' })) }}
              autoComplete="name"
            />
          </div>
          {errors.name && <div className="auth-field-error" role="alert">⚠ {errors.name}</div>}
        </div>

        <div className="auth-field">
          <label className="auth-field-label" htmlFor="signup-email">Email address</label>
          <div className="auth-field-wrap">
            <span className="auth-field-icon" aria-hidden="true">✉</span>
            <input
              id="signup-email"
              className={`auth-field-input${errors.email ? ' auth-field-input-error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: '', form: '' })) }}
              autoComplete="email"
            />
          </div>
          {errors.email && <div className="auth-field-error" role="alert">⚠ {errors.email}</div>}
        </div>

        {errors.form && <div className="auth-field-error" role="alert">⚠ {errors.form}</div>}

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? <><div className="auth-spinner" /><span>Creating account...</span></> : 'Create Account →'}
        </button>
      </form>

      <div className="auth-terms-text">
        By signing up you agree to our{' '}
        <a href="#" className="auth-terms-link">Terms of Service</a> and{' '}
        <a href="#" className="auth-terms-link">Privacy Policy</a>.<br />
        100% open source · No data selling · No ads.
      </div>
    </div>
  )
}
*/

const FEATURES = [
  { icon: '🎙️', cls: 'auth-fi-1', title: 'Voice rooms', desc: 'Drop into live rooms and talk instantly' },
  { icon: '🌐', cls: 'auth-fi-2', title: 'Language exchange', desc: 'Native speakers, real conversations' },
  { icon: '🎮', cls: 'auth-fi-3', title: 'Voice games', desc: 'Play word battles and trivia with strangers' },
  { icon: '🤖', cls: 'auth-fi-4', title: 'AI study partner', desc: 'Get help with anything, anytime' },
] as const

const SP_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#14b8a6'] as const
const SP_INITIALS = ['H', 'Y', 'P', 'Z', 'K'] as const

export default function AuthPage() {
  // Mode switching disabled — Google-only auth for now
  // const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [theme, setTheme] = useState<Theme>('dark')
  const { user, loading } = useAuth()
  const location = useLocation()
  const redirectTo = readFromState(location.state) ?? '/app'

  useEffect(() => {
    if (user) {
      // strip a stale post-login stash so a later Google redirect picks up the right target
      localStorage.removeItem(POST_LOGIN_KEY)
    }
  }, [user])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui', opacity: 0.6 }}>
        Loading…
      </div>
    )
  }

  if (user) return <Navigate to={redirectTo} replace />

  return (
    <div className="auth-root" data-theme={theme}>
      <SEO
        title="Sign In"
        description="Sign in to Brolyu with Google to join voice rooms, make friends, practice languages, and play games with people worldwide."
        path="/auth"
        noIndex
      />
      <div className="auth-bg-orb auth-bg-orb-1" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-2" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb-3" aria-hidden="true" />

      <button
        className="auth-theme-toggle"
        type="button"
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="auth-layout">
        <div className="auth-left">
          <div className="auth-left-top">
            <a href="/" className="auth-brand">
              <div className="auth-brand-dot">B</div>
              <div className="auth-brand-name">Brolyu</div>
            </a>

            <div>
              <div className="auth-left-heading">
                Talk your way<br />to <span className="auth-grad">anything.</span>
              </div>
              <div className="auth-left-sub">
                Join millions of learners, speakers, and friends on the world's most open talking platform.
              </div>
            </div>

            <div className="auth-feature-list">
              {FEATURES.map(f => (
                <div key={f.title} className="auth-feature-item">
                  <div className={`auth-feature-icon ${f.cls}`}>{f.icon}</div>
                  <div className="auth-feature-text">
                    <strong>{f.title}</strong> — {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="auth-social-proof">
              <div className="auth-sp-avatars">
                {SP_COLORS.map((color, i) => (
                  <div key={color} className="auth-sp-av" style={{ background: color }}>
                    {SP_INITIALS[i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="auth-sp-stars">★★★★★</div>
                <div className="auth-sp-text"><strong>2M+ learners</strong> already talking</div>
              </div>
            </div>
            <div className="auth-oss-badge">✦ 100% Open Source · No ads · No data selling</div>
          </div>
        </div>

        <div className="auth-right">
          <SignInForm redirectTo={redirectTo} />
          {/* Sign-up flow commented — Google-only auth for now
          {mode === 'signin'
            ? <SignInForm onSwitch={() => setMode('signup')} redirectTo={redirectTo} />
            : <SignUpForm onSwitch={() => setMode('signin')} redirectTo={redirectTo} />
          }
          */}
        </div>
      </div>
    </div>
  )
}
