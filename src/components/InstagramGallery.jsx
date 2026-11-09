import { site } from '../config/site.js'
import { socialImages } from '../data/content.js'
import { InstagramIcon } from './Icons.jsx'
import Picture from './Picture.jsx'

export default function InstagramGallery() {
  const { url, handle } = site.instagram
  const Tile = url ? 'a' : 'div'
  const tileProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <section className="social section" aria-labelledby="social-title">
      <div className="container">
        <header className="section-head" data-reveal>
          <p className="eyebrow eyebrow--olive">Journal</p>
          <h2 id="social-title" className="display">Follow the journey.</h2>
          <p className="section-head__sub">
            Discover the details, inspiration, and stories behind Sevelian.
          </p>
        </header>

        <ul className="social__grid">
          {socialImages.map((s, i) => (
            <li key={s.image} data-reveal style={{ '--d': `${(i % 3) * 0.08}s` }}>
              <Tile className="social__tile" {...tileProps} aria-label={url ? `${s.alt} — view on Instagram` : undefined}>
                <Picture name={s.image} alt={url ? '' : s.alt} sizes="(min-width: 960px) 16vw, 46vw" />
                {url && (
                  <span className="social__hover" aria-hidden="true">
                    <InstagramIcon width="22" height="22" />
                  </span>
                )}
              </Tile>
            </li>
          ))}
        </ul>

        {url && (
          <div className="social__cta" data-reveal>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
              <InstagramIcon /> Follow @{(handle || 'sevelian').toUpperCase()}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
