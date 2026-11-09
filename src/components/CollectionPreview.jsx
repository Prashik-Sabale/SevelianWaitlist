import { collections } from '../data/content.js'
import Picture from './Picture.jsx'

export default function CollectionPreview() {
  return (
    <section className="collection section" id="collection" aria-labelledby="collection-title">
      <div className="container">
        <header className="section-head" data-reveal>
          <p className="eyebrow eyebrow--olive">Chapter One</p>
          <h2 id="collection-title" className="display">The First Edition</h2>
          <p className="section-head__sub">A curated collection of timeless essentials.</p>
        </header>

        <div className="collection__grid">
          {collections.map((c, i) => (
            <article
              key={c.id}
              className={`look look--${i + 1}`}
              data-reveal
              style={{ '--d': `${(i % 2) * 0.12}s` }}
            >
              <a href="#early-access" className="look__link" aria-label={`${c.name} — register for early access`}>
                <div className="look__media">
                  <Picture name={c.image} alt={c.alt} sizes="(min-width: 960px) 40vw, 92vw" className="look__img" />
                  <Picture
                    name={c.hoverImage}
                    alt=""
                    aria-hidden="true"
                    sizes="(min-width: 960px) 40vw, 92vw"
                    className="look__img look__img--alt"
                  />
                  <span className="look__badge">Coming Soon</span>
                </div>
                <div className="look__meta">
                  <span className="look__no">0{i + 1}</span>
                  <div>
                    <h3 className="look__name">{c.name}</h3>
                    <p className="look__line">{c.line}</p>
                    <p className="look__feat">{c.featuring}</p>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
