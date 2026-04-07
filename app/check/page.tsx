'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PROPERTY_TYPES } from '@/lib/constants'

const schema = z.object({
  postcode:        z.string().min(5, 'Enter a valid UK postcode').max(8),
  address:         z.string().min(3, 'Enter your property address'),
  descriptionCode: z.string().min(2, 'Select a property type'),
  floorArea:       z.coerce.number().min(5, 'Minimum 5 m²').max(50000),
  rateableValue:   z.coerce.number().min(1, 'Enter your rateable value').max(10000000),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  { id: 'location', label: 'Location' },
  { id: 'type',     label: 'Property type' },
  { id: 'area',     label: 'Floor area' },
  { id: 'rv',       label: 'Rateable value' },
]

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: {
    x: 0, opacity: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -32 : 32, opacity: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
  }),
}

const inputBase: React.CSSProperties = {
  width:        '100%',
  height:       48,
  padding:      '0 1rem',
  borderRadius: 8,
  border:       '1px solid var(--border)',
  background:   'var(--bg-elevated)',
  fontSize:     '15px',
  color:        'var(--text-primary)',
  outline:      'none',
  transition:   'border-color 150ms ease, box-shadow 150ms ease',
  fontFamily:   'inherit',
}

const focusOn  = { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-subtle)' }
const focusOff = { borderColor: 'var(--border)',  boxShadow: 'none' }

export default function CheckPage() {
  const [step,       setStep]       = useState(0)
  const [direction,  setDirection]  = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [userId,     setUserId]     = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Redirect to auth page, then come back here
        router.push('/auth?redirect=/check')
      } else {
        setUserId(user.id)
        setLoading(false)
      }
    })
  }, [router, supabase])

  const {
    register, handleSubmit, watch, setValue, trigger,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  const descriptionCode = watch('descriptionCode')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>Checking authentication...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const validateAndNext = async (fields: (keyof FormData)[]) => {
    const ok = await trigger(fields)
    if (ok) go(step + 1)
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    const parts  = data.postcode.trim().toUpperCase().split(' ')
    const sector = parts.length === 2 ? `${parts[0]} ${parts[1][0]}` : parts[0]
    
    try {
      const res = await fetch('/api/analyses', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          postcode:        data.postcode.toUpperCase(),
          postcodeSector:  sector,
          fullAddress:     data.address,
          descriptionCode: data.descriptionCode,
          descriptionText: PROPERTY_TYPES.find((t) => t.code === data.descriptionCode)?.label ?? '',
          floorArea:       data.floorArea,
          rateableValue:   data.rateableValue,
          userId:          userId,
        }),
      })
      const { id } = await res.json()
      router.push(`/analysis/${id}`)
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Minimal header */}
      <header style={{
        height: 'var(--navbar-height)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', paddingInline: '1.5rem', flexShrink: 0,
      }}>
        <a href="/" style={{
          fontSize: '15px', fontWeight: 600, textDecoration: 'none',
          color: 'var(--text-primary)', letterSpacing: '-0.02em',
        }}>
          Rates<span style={{ color: 'var(--accent)' }}>Challenge</span>
        </a>
      </header>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: 520, width: '100%', marginInline: 'auto',
        padding: '3rem 1.5rem 4rem',
      }}>

        {/* Step progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{
                height:          3,
                width:           i === step ? 28 : 16,
                borderRadius:    2,
                backgroundColor: i <= step ? 'var(--accent)' : 'var(--border)',
                opacity:         i > step ? 0.4 : 1,
                transition:      'all 300ms cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          ))}
          <span style={{
            marginLeft: '0.5rem', fontSize: '0.75rem',
            color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace',
          }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Step content */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1 }}>
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── STEP 0: LOCATION ── */}
            {step === 0 && (
              <motion.div key="s0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                    Where is your property?
                  </h1>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    We search for comparable properties within your postcode area.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Postcode
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        placeholder="e.g. GU47 0QE"
                        style={{ ...inputBase, paddingLeft: '2.5rem', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}
                        onFocus={(e) => Object.assign(e.target.style, focusOn)}
                        {...register('postcode', { 
                          onChange: (e) => setValue('postcode', e.target.value.toUpperCase()),
                          onBlur: (e) => Object.assign(e.target.style, focusOff)
                        })}
                      />
                    </div>
                    {errors.postcode && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>{errors.postcode.message}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Property address
                    </label>
                    <input
                      placeholder="e.g. Unit 3, 45 High Street, Sandhurst"
                      style={inputBase}
                      onFocus={(e) => Object.assign(e.target.style, focusOn)}
                      {...register('address', {
                        onBlur: (e) => Object.assign(e.target.style, focusOff)
                      })}
                    />
                    <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      This appears on your evidence bundle — it doesn't need to be exact.
                    </p>
                    {errors.address && <p style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>{errors.address.message}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => validateAndNext(['postcode', 'address'])}
                  style={{
                    marginTop: '2rem', width: '100%', height: 48, borderRadius: 8,
                    border: 'none', background: 'var(--accent)', color: '#fff',
                    fontSize: '15px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background 150ms ease', fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 1: PROPERTY TYPE ── */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                    What type of property?
                  </h1>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                    Used to find comparable properties of the same type.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {PROPERTY_TYPES.map((type) => {
                    const selected = descriptionCode === type.code
                    return (
                      <button
                        key={type.code}
                        type="button"
                        onClick={() => { setValue('descriptionCode', type.code); setTimeout(() => go(2), 150) }}
                        style={{
                          textAlign: 'left', padding: '0.875rem', borderRadius: 8,
                          border:     `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          background: selected ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                          cursor: 'pointer', transition: 'all 150ms ease', fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-subtle)' } }}
                        onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)' } }}
                      >
                        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: selected ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '0.125rem' }}>
                          {type.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {type.description}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button" onClick={() => go(0)}
                  style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: FLOOR AREA ── */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                    What is the floor area?
                  </h1>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    In square metres (m²). Find this on your VOA valuation notice or via{' '}
                    <a href="https://www.gov.uk/find-business-rates" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      gov.uk/find-business-rates
                    </a>.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Floor area
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" placeholder="e.g. 120"
                      style={{ ...inputBase, paddingRight: '3.5rem', fontFamily: 'DM Mono, monospace' }}
                      onFocus={(e) => Object.assign(e.target.style, focusOn)}
                      {...register('floorArea', {
                        onBlur: (e) => Object.assign(e.target.style, focusOff)
                      })}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', pointerEvents: 'none' }}>
                      m²
                    </span>
                  </div>
                  {errors.floorArea && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>{errors.floorArea.message}</p>}
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    A rough estimate within 20% is fine for the free check.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => go(1)}
                    style={{ flex: '0 0 auto', height: 48, padding: '0 1.125rem', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'background 150ms ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="button" onClick={() => validateAndNext(['floorArea'])}
                    style={{ flex: 1, height: 48, borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 150ms ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: RATEABLE VALUE ── */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                    What is your rateable value?
                  </h1>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Your rateable value (RV) is on your business rates bill from your local council.
                    Look for <strong style={{ fontWeight: 500 }}>Rateable Value</strong> followed by a £ figure.
                    It is not the amount you pay — it is the assessed value used to calculate your bill.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Rateable value
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', pointerEvents: 'none' }}>
                      £
                    </span>
                    <input
                      type="number" placeholder="e.g. 24000"
                      style={{ ...inputBase, paddingLeft: '2rem', fontFamily: 'DM Mono, monospace' }}
                      onFocus={(e) => Object.assign(e.target.style, focusOn)}
                      {...register('rateableValue', {
                        onBlur: (e) => Object.assign(e.target.style, focusOff)
                      })}
                    />
                  </div>
                  {errors.rateableValue && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--danger)' }}>{errors.rateableValue.message}</p>}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => go(2)}
                    style={{ flex: '0 0 auto', height: 48, padding: '0 1.125rem', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'background 150ms ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{ flex: 1, height: 48, borderRadius: 8, border: 'none', background: submitting ? 'var(--border-strong)' : 'var(--accent)', color: '#fff', fontSize: '15px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 150ms ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--accent-hover)' }}
                    onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--accent)' }}
                  >
                    {submitting ? (
                      <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Searching comparables…</>
                    ) : (
                      <>Analyse my property <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>

                <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  You must be signed in to save your analysis. Sign in is free and takes 30 seconds.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}