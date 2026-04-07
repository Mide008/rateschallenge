'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing',      label: 'Pricing' },
  { href: '/methodology',   label: 'Methodology' },
]

export function Navbar() {
  const pathname                    = usePathname()
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  const isCheckPage =
    pathname?.startsWith('/check') || pathname?.startsWith('/analysis')

  return (
    <>
      <header style={{
        position:    'sticky',
        top:         0,
        zIndex:      50,
        height:      'var(--navbar-height)',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        backgroundColor: scrolled ? 'rgba(250,250,248,0.92)' : 'var(--bg)',
        backdropFilter:  scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition:  'border-color 200ms ease, background-color 200ms ease',
      }}>
        <div className="container-page" style={{
          height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
        }}>

          <Link href="/" style={{
            fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', textDecoration: 'none', flexShrink: 0,
          }}>
            Rates<span style={{ color: 'var(--accent)' }}>Challenge</span>
          </Link>

          {/* Desktop nav — globals.css controls visibility */}
          {!isCheckPage && (
            <nav className="nav-desktop">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} style={{
                  fontSize: '14px', color: 'var(--text-secondary)',
                  textDecoration: 'none', padding: '0.375rem 0.625rem',
                  borderRadius: '6px', transition: 'color 150ms ease, background 150ms ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-subtle)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                  {link.label}
                </Link>
              ))}
              {userEmail && (
                <Link
                  href="/dashboard"
                  style={{
                    fontSize: '14px', color: 'var(--text-secondary)',
                    textDecoration: 'none', padding: '0.375rem 0.625rem',
                    borderRadius: '6px', transition: 'color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-subtle)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginLeft: isCheckPage ? 'auto' : undefined,
          }}>
            {userEmail ? (
              <Link href="/dashboard" className="nav-signin-link" style={{
                fontSize: '14px', color: 'var(--text-secondary)',
                textDecoration: 'none', transition: 'color 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="nav-signin-link" style={{
                fontSize: '14px', color: 'var(--text-secondary)',
                textDecoration: 'none', transition: 'color 150ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Sign in
              </Link>
            )}

            <Link href="/check" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.4375rem 1rem', borderRadius: '6px',
              fontSize: '14px', fontWeight: 500,
              backgroundColor: 'var(--accent)', color: '#fff',
              textDecoration: 'none', whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px 0 rgb(29 78 216 / 0.3)',
              transition: 'background-color 150ms ease, transform 100ms ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Check my property
            </Link>

            {/* Mobile toggle — globals.css hides this above 768px */}
            {!isCheckPage && (
              <button className="nav-mobile-btn" onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
                style={{
                  alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 6,
                  border: '1px solid var(--border)', background: 'transparent',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                }}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 'var(--navbar-height)', left: 0, right: 0, zIndex: 49,
              background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
              padding: '0.75rem 1rem',
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div key={link.href}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.16 }}
              >
                <Link href={link.href} style={{
                  display: 'block', padding: '0.75rem', borderRadius: 6,
                  fontSize: '15px', color: 'var(--text-primary)', textDecoration: 'none',
                }}>
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <div style={{ height: 1, background: 'var(--border)', marginBlock: '0.5rem' }} />
            {userEmail ? (
              <Link href="/dashboard" style={{
                display: 'block', padding: '0.75rem', borderRadius: 6,
                fontSize: '15px', color: 'var(--text-secondary)', textDecoration: 'none',
              }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" style={{
                display: 'block', padding: '0.75rem', borderRadius: 6,
                fontSize: '15px', color: 'var(--text-secondary)', textDecoration: 'none',
              }}>
                Sign in
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}