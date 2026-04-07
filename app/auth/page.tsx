'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type Mode = 'signin' | 'signup' | 'reset'

// Component that uses useSearchParams - wrapped in Suspense
function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(redirectTo)
    })
  }, [router, supabase, redirectTo])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  async function handleSubmit() {
    if (!email.trim()) {
      setError('Enter your email address')
      return
    }
    if (mode !== 'reset' && !password) {
      setError('Enter your password')
      return
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    clearMessages()

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (err) {
        setError(err.message.includes('Invalid login') ? 'Incorrect email or password' : err.message)
        setLoading(false)
        return
      }
      await linkAnalyses(supabase)
      router.push(redirectTo)
      return
    }

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (err) {
        setError(err.message.includes('already registered') ? 'An account with this email already exists. Sign in instead.' : err.message)
        setLoading(false)
        return
      }
      // Auto sign in after signup
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (!signInErr) {
        await linkAnalyses(supabase)
        router.push(redirectTo)
        return
      }
      setSuccess('Account created. Check your email to verify, then sign in.')
      setMode('signin')
      setLoading(false)
      return
    }

    if (mode === 'reset') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password?redirect=${redirectTo}`,
      })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      setSuccess('Password reset email sent. Check your inbox.')
      setLoading(false)
      return
    }
  }

  async function linkAnalyses(supabase: any) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await fetch('/api/auth/link-analyses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
      }
    } catch {
      /* non-fatal */
    }
  }

  const TITLES: Record<Mode, string> = {
    signin: 'Sign in',
    signup: 'Create account',
    reset: 'Reset password',
  }

  const SUBTITLES: Record<Mode, string> = {
    signin: 'Welcome back to RatesChallenge',
    signup: 'Start checking your business rates for free',
    reset: "We'll email you a link to reset your password",
  }

  const inputStyle = {
    width: '100%',
    height: 48,
    padding: '0 1rem',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    fontSize: '15px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  } as React.CSSProperties

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.625rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            marginBottom: '0.375rem',
          }}
        >
          {TITLES[mode]}
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {SUBTITLES[mode]}
        </p>
      </div>

      {/* Feedback messages */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid var(--danger-border)',
            background: 'var(--danger-subtle)',
            fontSize: '0.875rem',
            color: 'var(--danger)',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid var(--success-border)',
            background: 'var(--success-subtle)',
            fontSize: '0.875rem',
            color: 'var(--success)',
            marginBottom: '1.25rem',
            lineHeight: 1.5,
          }}
        >
          {success}
        </div>
      )}

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Email */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            Email address
          </label>
          <input
            type="email"
            placeholder="you@company.co.uk"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearMessages()
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoComplete="email"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Password */}
        {mode !== 'reset' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.5rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}
              >
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset')
                    clearMessages()
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8125rem',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearMessages()
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={{ ...inputStyle, paddingRight: '3rem' }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent)'
                  e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 4,
                  display: 'flex',
                }}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 8,
            border: 'none',
            background: loading ? 'var(--border-strong)' : 'var(--accent)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background 150ms ease',
            fontFamily: 'inherit',
            marginTop: '0.25rem',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = 'var(--accent)'
          }}
        >
          {loading ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : mode === 'signin' ? (
            'Sign in'
          ) : mode === 'signup' ? (
            'Create account'
          ) : (
            'Send reset email'
          )}
        </button>
      </div>

      {/* Mode switcher */}
      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}
      >
        {mode === 'signin' && (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => {
                setMode('signup')
                clearMessages()
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              Create one free
            </button>
          </>
        )}
        {mode === 'signup' && (
          <>
            Already have an account?{' '}
            <button
              onClick={() => {
                setMode('signin')
                clearMessages()
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              Sign in
            </button>
          </>
        )}
        {mode === 'reset' && (
          <button
            onClick={() => {
              setMode('signin')
              clearMessages()
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          >
            ← Back to sign in
          </button>
        )}
      </div>

      {/* Legal */}
      <p
        style={{
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        By continuing you agree to our{' '}
        <Link href="/terms" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        .
      </p>
    </>
  )
}

// Loading fallback for Suspense
function AuthFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '2px solid var(--border)',
          borderTop: '2px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Minimal header */}
      <header
        style={{
          height: 'var(--navbar-height)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          paddingInline: '1.5rem',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Rates<span style={{ color: 'var(--accent)' }}>Challenge</span>
        </Link>
        <Link
          href="/"
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          ← Back
        </Link>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Suspense fallback={<AuthFallback />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}