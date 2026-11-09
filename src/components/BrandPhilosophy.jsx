import Picture from './Picture.jsx'

export default function BrandPhilosophy() {
  return (
    <section className="philosophy section" id="philosophy" aria-labelledby="philosophy-title">
      <div className="container philosophy__grid">
        <div className="philosophy__text" data-reveal>
          <p className="eyebrow eyebrow--olive">The Sevelian Philosophy</p>
          <h2 id="philosophy-title" className="display">
            Style that <em>transcends</em> time.
          </h2>
          <span className="rule rule--long" aria-hidden="true" />
          <p className="body-lg">
            At Sevelian, we believe true elegance is never defined by trends. It lives in
            simplicity, thoughtful details, exceptional comfort, and pieces that become timeless
            essentials.
          </p>
          <p className="philosophy__sign">Beyond trends. Beyond seasons. Timeless by design.</p>
        </div>

        <figure className="philosophy__media" data-reveal style={{ '--d': '0.15s' }}>
          <div className="frame frame--portrait">
            <Picture
              name="philosophy-detail"
              alt="Close-up of a finely striped shirt — natural fibres, soft drape, button-down collar"
              sizes="(min-width: 960px) 40vw, 90vw"
            />
          </div>
          <figcaption className="caption">Natural fibres, considered stripes, honest construction.</figcaption>
        </figure>
      </div>
    </section>
  )
}
