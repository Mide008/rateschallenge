'use client'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  userRvPerM2:    number
  medianRvPerM2:  number
  percentile:     number
  potentialSaving: number
  comparableCount: number
  floorArea:       number
  rateableValue:   number
}

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 900
    const start    = performance.now()
    const from     = 0

    const tick = (now: number) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out expo
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(from + (value - from) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

export function AnalysisSummary({
  userRvPerM2, medianRvPerM2, percentile,
  potentialSaving, comparableCount, floorArea, rateableValue,
}: Props) {
  const isOverpaying  = percentile > 60
  const isUnderpaying = percentile < 40
  const diff          = userRvPerM2 - medianRvPerM2
  const diffPct       = Math.abs(Math.round((diff / medianRvPerM2) * 100))

  const accentColor = isOverpaying
    ? 'var(--danger)'
    : isUnderpaying
    ? 'var(--success)'
    : 'var(--text-muted)'

  const bgColor = isOverpaying
    ? 'var(--danger-subtle)'
    : isUnderpaying
    ? 'var(--success-subtle)'
    : 'var(--bg-subtle)'

  const borderColor = isOverpaying
    ? 'var(--danger-border)'
    : isUnderpaying
    ? 'var(--success-border)'
    : 'var(--border)'

  const Icon = isOverpaying ? TrendingUp : isUnderpaying ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 10,
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Primary verdict */}
      <div style={{ background: bgColor, padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: isOverpaying
                ? 'var(--danger-border)'
                : isUnderpaying
                ? 'var(--success-border)'
                : 'var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={18} style={{ color: accentColor }} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
              Your RV per m²
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                className="font-data"
                style={{ fontSize: '2.25rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}
              >
                £<AnimatedNumber value={userRvPerM2} decimals={2} />
              </span>
              <span
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: accentColor,
                }}
              >
                {isOverpaying
                  ? `${diffPct}% above median`
                  : isUnderpaying
                  ? `${diffPct}% below median`
                  : 'in line with median'}
              </span>
            </div>

            {isOverpaying && potentialSaving > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  marginTop: '0.625rem',
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}
              >
                Based on comparables, your rateable value may be overstated by{' '}
                <strong style={{ fontWeight: 600, color: 'var(--danger)' }}>
                  £<AnimatedNumber value={potentialSaving} />
                </strong>
                {'. '}
                At the 2024/25 multiplier, that is an estimated{' '}
                <strong style={{ fontWeight: 600 }}>
                  £<AnimatedNumber value={Math.round(potentialSaving * 0.512)} /> per year
                </strong>{' '}
                in excess rates paid.
              </motion.p>
            )}

            {isUnderpaying && (
              <p style={{ marginTop: '0.625rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Your assessment appears to be below the local comparable median. 
                A formal challenge is unlikely to succeed.
              </p>
            )}

            {!isOverpaying && !isUnderpaying && (
              <p style={{ marginTop: '0.625rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Your assessment is broadly consistent with comparable properties in this area.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          background: 'var(--bg-elevated)',
        }}
        className="md:grid-cols-4"
      >
        {[
          {
            label: 'Comparable median',
            value: `£${medianRvPerM2.toFixed(2)}/m²`,
            mono:  true,
          },
          {
            label: 'Your percentile',
            value: `${percentile}th`,
            mono:  true,
            hint:  'Higher = more likely overpaying',
          },
          {
            label: 'Comparables found',
            value: comparableCount.toString(),
            mono:  true,
          },
          {
            label: 'Your rateable value',
            value: `£${rateableValue.toLocaleString()}`,
            mono:  true,
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border)',
              borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {stat.label}
            </div>
            <div
              className={stat.mono ? 'font-data' : ''}
              style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {stat.value}
            </div>
            {stat.hint && (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                {stat.hint}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}