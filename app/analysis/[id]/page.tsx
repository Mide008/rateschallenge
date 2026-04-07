import { query } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { AnalysisSummary } from '@/components/analysis/AnalysisSummary'
import { ComparablesTable } from '@/components/analysis/ComparablesTable'
import { FREE_COMPARABLES_LIMIT } from '@/lib/constants'
import { Lock, FileText, ExternalLink, AlertCircle } from 'lucide-react'

interface Props {
  params:      { id: string }
  searchParams: { paid?: string; stripe_pending?: string; stripe_error?: string }
}

export async function generateMetadata() {
  return { title: 'Business Rates Analysis — RatesChallenge' }
}

export default async function AnalysisPage({ params, searchParams }: Props) {
  const { id } = params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!id || !uuidRegex.test(id)) notFound()

  let analysis: any = null
  try {
    const rows = await query(`SELECT * FROM analyses WHERE id = $1 LIMIT 1`, [id])
    analysis = rows[0] ?? null
  } catch (err: any) {
    console.error('Analysis fetch error:', err.message)
    notFound()
  }

  if (!analysis) notFound()

  // If Stripe redirected back with ?paid=true and DB not yet updated,
  // update it now. This handles cases where the webhook was delayed or
  // the Stripe CLI wasn't running during development.
  if (searchParams.paid === 'true' && !analysis.paid) {
    try {
      await query(`
        UPDATE analyses
        SET paid = true, paid_tier = COALESCE(paid_tier, 'bundle')
        WHERE id = $1 AND paid IS NOT TRUE
      `, [id])
      analysis.paid      = true
      analysis.paid_tier = analysis.paid_tier ?? 'bundle'
      console.log('Marked paid via success redirect for analysis:', id)
    } catch (err: any) {
      console.error('Failed to mark paid on success redirect:', err.message)
    }
  }

  const stripeConfigured =
    !!process.env.STRIPE_SECRET_KEY &&
    (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ||
     process.env.STRIPE_SECRET_KEY.startsWith('sk_live_'))

  const paid        = analysis.paid
  const comparables = Array.isArray(analysis.comparables)
    ? analysis.comparables
    : (typeof analysis.comparables === 'string'
        ? JSON.parse(analysis.comparables)
        : [])

  const visible = paid ? comparables : comparables.slice(0, FREE_COMPARABLES_LIMIT)
  const locked  = Math.max(0, comparables.length - FREE_COMPARABLES_LIMIT)

  return (
    <>
      <Navbar />
      <main style={{ paddingBlock: '2.5rem 5rem' }}>
        <div className="container-page">

          {/* Stripe pending notice */}
          {searchParams.stripe_pending && (
            <div style={{
              display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: 8,
              border: '1px solid var(--warning-border)', background: 'var(--warning-subtle)',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Payments are not yet configured. Contact us to arrange access.
              </p>
            </div>
          )}

          {/* Payment success notice */}
          {searchParams.paid === 'true' && (
            <div style={{
              padding: '0.75rem 1.25rem', borderRadius: 8,
              border: '1px solid var(--success-border)', background: 'var(--success-subtle)',
              marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--success)',
            }}>
              Payment confirmed — your full analysis and evidence bundle are now unlocked.
            </div>
          )}

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap',
          }}>
            <div>
              <p className="font-data" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', letterSpacing: '0.02em' }}>
                {analysis.postcode} · {analysis.description_text}
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                {analysis.full_address || analysis.postcode}
              </h1>
            </div>
            <span className={`badge ${(analysis.percentile ?? 0) > 60 ? 'badge-danger' : 'badge-muted'}`}>
              {(analysis.percentile ?? 0) > 60 ? 'Potential case identified' : 'No strong case identified'}
            </span>
          </div>

          {/* No comparables warning */}
          {comparables.length === 0 && (
            <div style={{
              display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: 8,
              border: '1px solid var(--warning-border)', background: 'var(--warning-subtle)',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--warning)', marginBottom: '0.25rem' }}>
                  No comparables found
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  We couldn't find comparable properties near {analysis.postcode}.{' '}
                  <a href="/check" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Try another check</a>.
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          {comparables.length > 0 && (
            <AnalysisSummary
              userRvPerM2={Number(analysis.user_rv_per_m2) || 0}
              medianRvPerM2={Number(analysis.median_rv_per_m2) || 0}
              percentile={Number(analysis.percentile) || 50}
              potentialSaving={Number(analysis.potential_saving) || 0}
              comparableCount={Number(analysis.comparable_count) || 0}
              floorArea={Number(analysis.floor_area) || 0}
              rateableValue={Number(analysis.rateable_value) || 0}
            />
          )}

          {/* Comparables table */}
          {comparables.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
                  Comparable properties
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                    ({comparables.length} found)
                  </span>
                </h2>
                {!paid && comparables.length > FREE_COMPARABLES_LIMIT && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Showing {FREE_COMPARABLES_LIMIT} of {comparables.length}
                  </span>
                )}
              </div>

              <ComparablesTable comparables={visible} userRvPerM2={Number(analysis.user_rv_per_m2) || 0} />

              {/* Paywall */}
              {!paid && locked > 0 && (
                <div style={{
                  borderRadius: '0 0 8px 8px', border: '1px solid var(--border)', borderTop: 'none',
                  background: 'var(--bg-subtle)', padding: '2rem 1.5rem', textAlign: 'center',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--bg-muted)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 0.875rem',
                  }}>
                    <Lock size={15} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                    {locked} more comparable{locked > 1 ? 's' : ''} + evidence bundle
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: 420, marginInline: 'auto', lineHeight: 1.6 }}>
                    Unlock the full comparable dataset and a professionally formatted PDF evidence bundle.
                  </p>
                  <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {stripeConfigured ? (
                      <>
                        <a href={`/api/checkout?analysisId=${analysis.id}&tier=analysis`} style={{
                          display: 'inline-flex', alignItems: 'center', padding: '0.5625rem 1.125rem',
                          borderRadius: 6, fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none',
                          border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                        }}>
                          Full analysis · £29
                        </a>
                        <a href={`/api/checkout?analysisId=${analysis.id}&tier=bundle`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                          padding: '0.5625rem 1.125rem', borderRadius: 6, fontSize: '0.9375rem',
                          fontWeight: 500, textDecoration: 'none', background: 'var(--accent)', color: '#fff',
                        }}>
                          <FileText size={15} /> Evidence bundle · £49
                        </a>
                      </>
                    ) : (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Payments coming soon — PDF available free during beta
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PDF download — shown when paid */}
          {comparables.length > 0 && paid && (
            <div style={{
              marginTop: '1rem', padding: '1.125rem 1.5rem', borderRadius: 8,
              border: '1px solid var(--success-border)', background: 'var(--success-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--success)' }}>
                  Your evidence bundle is ready
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Formatted for VOA Check and Challenge submission
                </p>
              </div>
              <a href={`/api/pdf?analysisId=${analysis.id}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1rem', borderRadius: 6, fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', background: 'var(--success)', color: '#fff', whiteSpace: 'nowrap',
                }}>
                <FileText size={14} /> Download PDF
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="https://www.gov.uk/find-business-rates" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}>
              Check your valuation on GOV.UK <ExternalLink size={13} />
            </a>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 640 }}>
              <strong style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Data source:</strong>{' '}
              VOA 2023 Compiled Rating List. RatesChallenge provides data analysis only and is not a rating
              agent, surveyor, or legal adviser. For complex or high-value challenges, consult a
              RICS-accredited rating surveyor.
            </p>
          </div>

        </div>
      </main>
    </>
  )
}