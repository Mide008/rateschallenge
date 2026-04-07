import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import {
  ArrowRight, CheckCircle2, Shield, Database,
  TrendingDown, FileText, Search,
} from 'lucide-react'

export const metadata = {
  title: 'RatesChallenge — Is Your Business Overpaying on Rates?',
  description:
    'Compare your rateable value per m² against 2.1 million VOA properties nearby. Free instant check. Evidence bundle from £49.',
}

const STATS = [
  { value: '2.1M+',  label: 'Properties in the VOA 2023 list' },
  { value: '£279',   label: 'Average RV/m² across England' },
  { value: '240K+',  label: 'Successful appeals in the last cycle' },
  { value: '60 sec', label: 'To see if you\'re overpaying' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter your property details',
    body:  'Postcode, property type, floor area, and current rateable value. Four steps, under 90 seconds.',
    icon:  Search,
  },
  {
    step: '02',
    title: 'See your comparable analysis',
    body:  'We search the official VOA 2023 list for similar properties nearby and calculate where you sit on the RV/m² distribution.',
    icon:  TrendingDown,
  },
  {
    step: '03',
    title: 'Download your evidence bundle',
    body:  'A professionally formatted PDF with comparable evidence and grounds for challenge — ready to submit via the VOA Check and Challenge service.',
    icon:  FileText,
  },
]

const PRICING_TIERS = [
  {
    name:        'Free check',
    price:       '£0',
    per:         '',
    description: 'Instant signal — is it worth pursuing?',
    features: [
      '3 comparable properties',
      'Median RV/m² for your area',
      'Overpayment estimate',
      'No account required',
    ],
    cta:      'Check free',
    href:     '/check',
    featured: false,
  },
  {
    name:        'Full analysis',
    price:       '£29',
    per:         'one-off',
    description: 'Complete data, no PDF',
    features: [
      'All comparable properties',
      'RV/m² distribution chart',
      'Sortable comparables table',
      '12-month access',
    ],
    cta:      'Get full analysis',
    href:     '/check',
    featured: false,
  },
  {
    name:        'Evidence bundle',
    price:       '£49',
    per:         'one-off',
    description: 'Everything to challenge your assessment',
    features: [
      'Full analysis included',
      'Professional PDF evidence bundle',
      'Grounds for challenge narrative',
      'VOA submission guide',
    ],
    cta:      'Get evidence bundle',
    href:     '/check',
    featured: true,
  },
]

const TRUST_ITEMS = [
  {
    icon:  Shield,
    title: 'Official VOA data',
    body:  'All analysis uses the 2023 Compiled Rating List — the same dataset your local council uses to calculate your bill.',
  },
  {
    icon:  Database,
    title: 'Transparent methodology',
    body:  'We compare RV/m² against similar property types within your postcode sector, widening to your district if fewer than 5 comparables exist.',
  },
  {
    icon:  CheckCircle2,
    title: 'Data analysis only',
    body:  'We are not a rating agent or surveyor. For complex or high-value challenges, we recommend a RICS-accredited rating surveyor.',
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      <style>{`
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          background-color: var(--accent);
          color: #fff;
          text-decoration: none;
          box-shadow: 0 1px 3px 0 rgb(29 78 216 / 0.25);
          transition: background-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
        }
        .btn-primary:hover {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px 0 rgb(29 78 216 / 0.25);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-size: 15px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 150ms ease, background 150ms ease;
        }
        .btn-ghost:hover {
          color: var(--text-primary);
          background: var(--bg-subtle);
        }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 1rem;
          border-radius: 6px;
          font-size: 0.9375rem;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid var(--border);
          color: var(--text-primary);
          background: transparent;
          transition: background 150ms ease;
          width: 100%;
        }
        .btn-outline:hover { background: var(--bg-subtle); }
        .btn-accent-full {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 1rem;
          border-radius: 6px;
          font-size: 0.9375rem;
          font-weight: 500;
          text-decoration: none;
          background: var(--accent);
          color: #fff;
          border: 1px solid transparent;
          transition: background 150ms ease;
          width: 100%;
        }
        .btn-accent-full:hover { background: var(--accent-hover); }
        .btn-small-outline {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid var(--border);
          color: var(--text-primary);
          background: transparent;
          transition: background 150ms ease;
          white-space: nowrap;
        }
        .btn-small-outline:hover { background: var(--bg-subtle); }
        .footer-link {
          font-size: 0.8125rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .footer-link:hover { color: var(--text-secondary); }
        .how-item {
          padding: 2rem;
          border-top: 1px solid var(--border);
        }
        .pricing-card {
          background: var(--bg-elevated);
          border-radius: 10px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
        }
      `}</style>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{
          paddingTop: '5rem', paddingBottom: '4rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div className="container-page">
            <div style={{ maxWidth: 640 }}>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.3125rem 0.75rem', borderRadius: '9999px',
                border: '1px solid var(--border)', fontSize: '0.75rem',
                color: 'var(--text-muted)', marginBottom: '1.75rem', fontWeight: 500,
              }}>
                <Database size={11} />
                Built on VOA 2023 Compiled Rating List · 2,193,029 properties
              </div>

              <h1 className="text-display animate-fade-up" style={{ marginBottom: '1.25rem' }}>
                Is your business<br />overpaying on rates?
              </h1>

              <p className="animate-fade-up stagger-1" style={{
                fontSize: '1.0625rem', color: 'var(--text-secondary)',
                lineHeight: 1.65, marginBottom: '2.25rem', maxWidth: 500,
              }}>
                Compare your rateable value per m² against similar properties in your area.
                See in 60 seconds if you have grounds to challenge — then download a
                professional evidence bundle.
              </p>

              <div className="animate-fade-up stagger-2" style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center',
              }}>
                <Link href="/check" className="btn-primary">
                  Check my property free <ArrowRight size={16} />
                </Link>
                <Link href="/#how-it-works" className="btn-ghost">
                  See how it works
                </Link>
              </div>

              <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No account needed for the free check · Full analysis from £29
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ─────────────────────────────────────────────────── */}
        <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="container-page">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
              className="md:grid-cols-4"
            >
              {STATS.map((stat, i) => (
                <div key={stat.label} style={{
                  padding: '1.5rem 1.25rem', textAlign: 'center',
                  borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                }}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="section-gap">
          <div className="container-page">
            <div style={{ marginBottom: '3rem' }}>
              <p className="text-label" style={{ marginBottom: '0.5rem' }}>The process</p>
              <h2 className="text-headline" style={{ maxWidth: 400 }}>
                From postcode to evidence bundle
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)' }}
              className="md:grid-cols-3"
            >
              {HOW_IT_WORKS.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="how-item" style={{
                    borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: '1.5rem',
                    }}>
                      <span className="font-data" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.step}
                      </span>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)',
                      }}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.625rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {item.body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────── */}
        <section id="pricing" className="section-gap" style={{
          borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)',
        }}>
          <div className="container-page">
            <div style={{ marginBottom: '3rem' }}>
              <p className="text-label" style={{ marginBottom: '0.5rem' }}>Pricing</p>
              <h2 className="text-headline">Pay only if there is a case</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.625rem' }}>
                The free check tells you whether it is worth pursuing. No account required.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}
              className="md:grid-cols-3"
            >
              {PRICING_TIERS.map((tier) => (
                <div key={tier.name} className="pricing-card" style={{
                  border: `1px solid ${tier.featured ? 'var(--accent)' : 'var(--border)'}`,
                  boxShadow: tier.featured
                    ? '0 0 0 1px var(--accent-border), var(--shadow-md)'
                    : 'var(--shadow-sm)',
                }}>
                  {tier.featured && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--accent)', color: '#fff',
                      fontSize: '0.6875rem', fontWeight: 600,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      padding: '0.25rem 0.75rem', borderRadius: 9999,
                      whiteSpace: 'nowrap',
                    }}>
                      Most popular
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                      {tier.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                      <span className="font-data" style={{ fontSize: '1.875rem', fontWeight: 500 }}>
                        {tier.price}
                      </span>
                      {tier.per && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{tier.per}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {tier.description}
                    </div>
                  </div>

                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {tier.features.map((f) => (
                      <li key={f} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        fontSize: '0.875rem', color: 'var(--text-secondary)',
                      }}>
                        <CheckCircle2 size={14} style={{
                          color: tier.featured ? 'var(--accent)' : 'var(--success)',
                          marginTop: 2, flexShrink: 0,
                        }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tier.href}
                    className={tier.featured ? 'btn-accent-full' : 'btn-outline'}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* Agency row */}
            <div style={{
              marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem',
            }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                  For rating agents and surveyors
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Unlimited checks · White-label PDF · Bulk upload · API access — from £149/month
                </div>
              </div>
              <Link href="/auth" className="btn-small-outline">
                Get in touch
              </Link>
            </div>
          </div>
        </section>

        {/* ── TRUST ─────────────────────────────────────────────────────── */}
        <section className="section-gap-sm" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="container-page">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '2rem' }}
              className="md:grid-cols-3"
            >
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} style={{ display: 'flex', gap: '0.875rem' }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      <Icon size={15} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.3125rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                        {item.body}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <div className="container-page" style={{
          paddingBlock: '2rem', display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 2 }}>
              Rates<span style={{ color: 'var(--accent)' }}>Challenge</span>
            </div>
            © {new Date().getFullYear()} RatesChallenge. Not a rating agent or legal service.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { href: '/methodology',                    label: 'Methodology' },
              { href: '/guide/business-rates-challenge', label: 'Challenge guide' },
              { href: '/privacy',                        label: 'Privacy' },
              { href: '/terms',                          label: 'Terms' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}