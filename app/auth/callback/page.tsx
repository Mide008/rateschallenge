'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Stage = 'confirm' | 'processing' | 'success' | 'error'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [stage,  setStage]  = useState<Stage>('confirm')
  const [errMsg, setErrMsg] = useState('')
  const [redirectTo, setRedirectTo] = useState('/dashboard')

  // Read URL params on mount
  const [hasCode,    setHasCode]    = useState(false)
  const [hasHash,    setHasHash]    = useState(false)
  const [hasError,   setHasError]   = useState(false)
  const [errorText,  setErrorText]  = useState('')

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const hash   = new URLSearchParams(
      window.location.hash.replace('#', '')
    )

    // Get redirect URL from query param
    const redirect = search.get('redirect') || '/dashboard'
    setRedirectTo(redirect)

    const errorParam = search.get('error') || hash.get('error')
    const errorDesc  = search.get('error_description') || hash.get('error_description') || ''

    if (errorParam) {
      setErrorText(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
      setHasError(true)
      setStage('error')
      setTimeout(() => router.replace('/auth'), 4000)
      return
    }

    if (hash.get('access_token')) {
      setHasHash(true)
      setStage('confirm')
      return
    }

    if (search.get('code')) {
      setHasCode(true)
      setStage('confirm')
      return
    }

    // Nothing in URL — check if already signed in
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStage('success')
        linkAndGo(supabase, session.user.id, router, redirect)
      } else {
        setErrorText('No sign-in token found. Please request a new link.')
        setStage('error')
        setTimeout(() => router.replace('/auth'), 4000)
      }
    })
  }, [])

  async function handleConfirm() {
    setStage('processing')
    const supabase = createClient()

    // Implicit flow: Supabase already parsed the hash automatically.
    // Just check the session it created.
    if (hasHash) {
      // Give Supabase JS 500ms to process the hash token it detected
      await new Promise(r => setTimeout(r, 500))
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStage('success')
        await linkAndGo(supabase, session.user.id, router, redirectTo)
        return
      }

      // Manual fallback: parse hash and set session ourselves
      const hash         = new URLSearchParams(window.location.hash.replace('#', ''))
      const accessToken  = hash.get('access_token') ?? ''
      const refreshToken = hash.get('refresh_token') ?? ''

      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        })
        if (!error && data.session) {
          window.history.replaceState(null, '', window.location.pathname)
          setStage('success')
          await linkAndGo(supabase, data.session.user.id, router, redirectTo)
          return
        }
      }
    }

    // PKCE flow — code in query string
    if (hasCode) {
      const code = new URLSearchParams(window.location.search).get('code') ?? ''
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.session) {
        setStage('success')
        await linkAndGo(supabase, data.session.user.id, router, redirectTo)
        return
      }
    }

    setErrMsg('Sign-in could not be completed. Please request a new link.')
    setStage('error')
    setTimeout(() => router.replace('/auth'), 4000)
  }

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'var(--bg)',
      fontFamily:     'DM Sans, system-ui, sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth:  340,
        padding:   '0 1.5rem',
        width:     '100%',
      }}>

        <div style={{
          fontSize:      '15px',
          fontWeight:    600,
          letterSpacing: '-0.02em',
          marginBottom:  '2.5rem',
          color:         'var(--text-primary)',
        }}>
          Rates<span style={{ color: 'var(--accent)' }}>Challenge</span>
        </div>

        {stage === 'confirm' && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.375rem',
            }}>
              ✉️
            </div>
            <h1 style={{
              fontSize: '1.125rem', fontWeight: 600,
              letterSpacing: '-0.02em', marginBottom: '0.5rem',
            }}>
              Confirm sign in
            </h1>
            <p style={{
              fontSize: '0.9375rem', color: 'var(--text-secondary)',
              lineHeight: 1.6, marginBottom: '1.75rem',
            }}>
              Click below to sign in to your RatesChallenge account.
            </p>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%', height: 48, borderRadius: 8,
                border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: '15px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Sign in to RatesChallenge
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              This link is for your use only and expires in 1 hour.
            </p>
          </>
        )}

        {stage === 'processing' && (
          <>
            <div style={{
              width: 40, height: 40,
              border: '2px solid var(--border)', borderTop: '2px solid var(--accent)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.25rem',
            }} />
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Signing you in…
            </p>
          </>
        )}

        {stage === 'success' && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--success-subtle)', border: '1px solid var(--success-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.25rem', color: 'var(--success)',
            }}>
              ✓
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--success)', marginBottom: '0.375rem' }}>
              Signed in
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Taking you to your dashboard…
            </p>
          </>
        )}

        {stage === 'error' && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.125rem',
              color: 'var(--danger)', fontWeight: 600,
            }}>
              ✕
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--danger)', marginBottom: '0.5rem' }}>
              Link expired
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '0.75rem' }}>
              {errorText || errMsg || 'This link has expired or already been used.'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Sending you back to request a new one…
            </p>
          </>
        )}

      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

async function linkAndGo(supabase: any, userId: string, router: any, redirectTo: string) {
  try {
    await fetch('/api/auth/link-analyses', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId }),
    })
  } catch {
    // Non-fatal
  }
  router.replace(redirectTo)
}