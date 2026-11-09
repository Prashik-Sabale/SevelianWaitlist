import { site } from '../config/site.js'
import Logo from './Logo.jsx'

export default function BrandFooter() {
  const links = [
    { label: 'Home', href: site.mainSiteUrl },
    { label: 'Contact Us', href: site.contactUrl },
    site.privacyUrl && { label: 'Privacy Policy', href: site.privacyUrl },
    site.termsUrl && { label: 'Terms & Conditions', href: site.termsUrl },
    site.instagram.url && { label: 'Instagram', href: site.instagram.url, external: true },
  ].filter(Boolean)

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo tone="light" className="footer__logo" loading="lazy" />
          <p>Premium linen and cotton essentials. Beyond trends. Beyond seasons. Timeless by design.</p>
        </div>
        <nav className="footer__nav" aria-label="Footer">
          <ul>
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="link-underline"
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container footer__base">
        <p>&copy; {new Date().getFullYear()} Sevelian. All rights reserved.</p>
        <p>The Art of Effortless Elegance</p>
      </div>
    </footer>
  )
}
