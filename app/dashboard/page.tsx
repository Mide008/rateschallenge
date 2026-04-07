'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { SignOutButton } from '@/components/dashboard/SignOutButton'
import { FileText, TrendingUp, TrendingDown, Minus, ArrowRight, Clock, Loader2 } from 'lucide-react'

interface Analysis {
  id:               string
  postcode:         string
  description_text: string | null
  percentile:       number | null
  potential_saving: number | null
  paid:             boolean | null
  paid_tier:        string | null
  created_at:       string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function percentileColor(p: number): string {
  if (p > 70) return 'var(--danger)'
  if (p > 55) return 'var(--warning)'
  return 'var(--success)'
}

function percentileLabel(p: number): string {
  if (p > 70) return 'Likely overpaying'
  if (p > 55) return 'Borderline'
  return 'Looks fair'
}

export default function DashboardPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [user,     setUser]     = useState<any>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      // Check auth
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.replace('/auth')
        return
      }

      setUser(currentUser)

      // Fetch analyses
      try {
        const res  = await fetch('/api/dashboard', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId: currentUser.id }),
        })
        const data = await res.json()
        setAnalyses(data.analyses ?? [])
      } catch (err) {
        console.error('Failed to load analyses:', err)
        setAnalyses([])
      }

      setLoading(false)
    }

    load()
  }, [])

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight:      '60vh',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2
              size={24}
              style={{ animation: 'spin 0.8s linear infinite', color: 'var(--text-muted)', margin: '0 auto 0.75rem' }}
            />
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Loading your dashboard…
            </p>
          </div>
          <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    )
  }

  if (!user) return null

  const paidCount   = analyses.filter(a => a.paid).length
  const totalSaving = analyses
    .filter(a => a.paid && Number(a.potential_saving) > 0)
    .reduce((sum, a) => sum + Number(a.potential_saving), 0)

  return (
    <>
      <Navbar />
      <main style={{ paddingBlock: '2.5rem 5rem' }}>
        <div className="container-page">

          {/* ── Page header ── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem',
            marginBottom: '2.5rem', flexWrap: 'wrap',
          }}>
            <div>
              <p className="text-label" style={{ marginBottom: '0.375rem' }}>Dashboard</p>
              <h1 style={{
                fontSize: '1.625rem', fontWeight: 600,
                letterSpacing: '-0.025em', color: 'var(--text-primary)',
              }}>
                Your property checks
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                {user.email}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/check" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4375rem 1rem', borderRadius: 6,
                fontSize: '0.875rem', fontWeight: 500,
                background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              }}>
                New check
              </Link>
              <SignOutButton />
            </div>
          </div>

          {/* ── Summary stats ── */}
          {analyses.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px', background: 'var(--border)',
              border: '1px solid var(--border)', borderRadius: 8,
              overflow: 'hidden', marginBottom: '2rem',
            }}>
              {[
                { label: 'Properties checked',                value: String(analyses.length) },
                { label: 'Full analyses purchased',           value: String(paidCount) },
                { label: 'Total potential saving identified', value: totalSaving > 0 ? `£${Math.round(totalSaving).toLocaleString('en-GB')}` : '—' },
              ].map(stat => (
                <div key={stat.label} style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                    {stat.label}
                  </div>
                  <div className="font-data" style={{ fontSize: '1.375rem', fontWeight: 500 }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Analyses list ── */}
          {analyses.length === 0 ? (

            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              border: '1px solid var(--border)', borderRadius: 10,
              background: 'var(--bg-elevated)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <FileText size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                No checks yet
              </h2>
              <p style={{
                fontSize: '0.9375rem', color: 'var(--text-secondary)',
                marginBottom: '1.5rem', maxWidth: 360,
                marginInline: 'auto', lineHeight: 1.6,
              }}>
                Run a free property check to see if your business is overpaying on rates.
              </p>
              <Link href="/check" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.625rem 1.25rem', borderRadius: 8,
                fontSize: '0.9375rem', fontWeight: 500,
                background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              }}>
                Check my property free <ArrowRight size={15} />
              </Link>
            </div>

          ) : (

            <div style={{
              border: '1px solid var(--border)', borderRadius: 10,
              overflow: 'hidden',
            }}>

              {/* Header row — hidden on mobile */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 110px 130px 110px 90px',
                gap: '1rem', padding: '0.75rem 1.25rem',
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border)',
              }}>
                {['Property', 'Date', 'Signal', 'Saving', 'Status'].map(h => (
                  <div key={h} style={{
                    fontSize: '0.75rem', fontWeight: 500,
                    color: 'var(--text-muted)', letterSpacing: '0.02em',
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              {analyses.map((analysis, i) => {
                const p      = Number(analysis.percentile) || 0
                const saving = Number(analysis.potential_saving) || 0
                const color  = percentileColor(p)
                const label  = percentileLabel(p)
                const Icon   = p > 55 ? TrendingUp : p < 40 ? TrendingDown : Minus

                return (
                  <Link
                    key={analysis.id}
                    href={`/analysis/${analysis.id}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 110px 130px 110px 90px',
                      gap: '1rem', padding: '1rem 1.25rem',
                      background: i % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg)',
                      textDecoration: 'none', transition: 'background 120ms ease',
                      alignItems: 'center',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--data-highlight)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-elevated)' : 'var(--bg)')}
                  >
                    {/* Property */}
                    <div>
                      <div className="font-data" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {analysis.postcode}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                        {analysis.description_text || 'Commercial property'}
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(analysis.created_at)}
                      </span>
                    </div>

                    {/* Signal */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Icon size={13} style={{ color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color, fontWeight: 500 }}>
                        {label}
                      </span>
                    </div>

                    {/* Saving */}
                    <div className="font-data" style={{
                      fontSize: '0.8125rem',
                      color: saving > 0 ? 'var(--danger)' : 'var(--text-muted)',
                    }}>
                      {saving > 0 ? `£${Math.round(saving).toLocaleString('en-GB')}` : '—'}
                    </div>

                    {/* Status badge */}
                    <div>
                      {analysis.paid ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.1875rem 0.5rem', borderRadius: 9999,
                          fontSize: '0.6875rem', fontWeight: 500,
                          background: 'var(--success-subtle)', color: 'var(--success)',
                          border: '1px solid var(--success-border)', whiteSpace: 'nowrap',
                        }}>
                          <FileText size={10} />
                          {analysis.paid_tier === 'bundle' ? 'Bundle' : 'Analysis'}
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.1875rem 0.5rem', borderRadius: 9999,
                          fontSize: '0.6875rem', fontWeight: 500,
                          background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                          border: '1px solid var(--border)', whiteSpace: 'nowrap',
                        }}>
                          Free
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Only checks made while signed in appear here.
            Checks made anonymously before signing in from the last 24 hours are linked automatically.
          </p>

        </div>
      </main>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .container-page [style*="gridTemplateColumns: '1fr 110px"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  )
}