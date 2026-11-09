import { useEffect, useRef, useState } from 'react'
import { site } from '../config/site.js'
import { nav } from '../data/content.js'
import { InstagramIcon } from './Icons.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const drawerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Drawer: lock page scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return
    const toggle = toggleRef.current
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector('a')?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && drawerRef.current) {
        const items = [toggle, ...drawerRef.current.querySelectorAll('a')]
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const onResize = () => window.innerWidth >= 960 && setOpen(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      toggle?.focus()
    }
  }, [open])

  const solid = scrolled || open
  const close = () => setOpen(false)

  return (
    <header className={`nav ${solid ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__brand" aria-label="SEVELIAN — back to top" onClick={close}>
          <Logo tone="light" className="nav__logo nav__logo--light" alt="" />
          <Logo tone="dark" className="nav__logo nav__logo--dark" alt="" />
          <span className="sr-only">SEVELIAN</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="link-underline">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          {site.instagram.url && (
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nav__icon"
              aria-label="SEVELIAN on Instagram (opens in a new tab)"
            >
              <InstagramIcon />
            </a>
          )}
          <a href="#early-access" className="btn btn--ghost btn--sm nav__cta">
            Join the Waitlist
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={drawerRef}
        className="drawer"
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <nav aria-label="Mobile">
          {nav.map((item, i) => (
            <a key={item.href} href={item.href} onClick={close} style={{ '--i': i }}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="drawer__foot">
          <a href="#early-access" className="btn btn--dark" onClick={close}>
            Join the Waitlist
          </a>
          {site.instagram.url && (
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="drawer__social">
              <InstagramIcon /> @{site.instagram.handle || 'instagram'}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
