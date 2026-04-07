'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [ready,     setReady]     = useState(false)

  useEffect(() => {
    // Check we have a valid recovery session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        setError('This link has expired. Please request a new password reset.')
      }
    })
  }, [])

  async function handleUpdate() {
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.replace('/dashboard')
  }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     'var(--bg)',
      display:        'flex',
      flexDirection:  'column',
    }}>
      <header style={{
        height: 'var(--navbar-height)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', paddingInline: '1.5rem',
      }}>
        <Link href="/" style={{
          fontSize: '15px', fontWeight: 600,
          textDecoration: 'none', color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Rates<span style={{ color: 'var(--accent)' }}>Challenge</span>
        </Link>
      </header>

      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{
            fontSize: '1.625rem', fontWeight: 600,
            letterSpacing: '-0.025em', marginBottom: '0.375rem',
          }}>
            Set new password
          </h1>
          <p style={{
            fontSize: '0.9375rem', color: 'var(--text-secondary)',
            marginBottom: '2rem', lineHeight: 1.5,
          }}>
            Choose a strong password for your account.
          </p>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 8,
              border: '1px solid var(--danger-border)',
              background: 'var(--danger-subtle)',
              fontSize: '0.875rem', color: 'var(--danger)',
              marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          {ready && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.8125rem',
                  fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)',
                }}>
                  New password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                    autoComplete="new-password"
                    style={{
                      width: '100%', height: 48, padding: '0 3rem 0 1rem',
                      borderRadius: 8, border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)', fontSize: '15px',
                      color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--accent)'
                      e.target.style.boxShadow   = '0 0 0 3px var(--accent-subtle)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--border)'
                      e.target.style.boxShadow   = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 4, display: 'flex',
                    }}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpdate}
                disabled={loading}
                style={{
                  width: '100%', height: 48, borderRadius: 8, border: 'none',
                  background: loading ? 'var(--border-strong)' : 'var(--accent)',
                  color: '#fff', fontSize: '15px', fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', fontFamily: 'inherit',
                }}
              >
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : 'Update password'}
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}