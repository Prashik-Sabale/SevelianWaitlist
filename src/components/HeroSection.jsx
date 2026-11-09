import Picture from './Picture.jsx'

export default function HeroSection() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media">
        <Picture
          name="hero-wide"
          art={{ name: 'hero-tall', media: '(max-width: 760px) and (orientation: portrait)', sizes: '100vw' }}
          alt="A man in a striped linen-cotton shirt walking through sunlit coastal grassland"
          sizes="100vw"
          priority
        />
      </div>
      <div className="hero__veil" aria-hidden="true" />

      <div className="hero__content container">
        <p className="eyebrow hero__in" style={{ '--d': '0.2s' }}>Sevelian Presents</p>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__in" style={{ '--d': '0.35s' }}>The wait is</span>
          <span className="hero__in" style={{ '--d': '0.5s' }}>
            almost <em>over.</em>
          </span>
        </h1>
        <p className="hero__lede hero__in" style={{ '--d': '0.7s' }}>
          A new expression of timeless elegance. Discover our upcoming collection of refined
          essentials, crafted for those who appreciate understated luxury.
        </p>
        <div className="hero__ctas hero__in" style={{ '--d': '0.85s' }}>
          <a href="#early-access" className="btn btn--light">Get Early Access</a>
          <a href="#philosophy" className="btn btn--outline-light">Discover Our Philosophy</a>
        </div>
        <p className="hero__note hero__in" style={{ '--d': '1s' }}>
          <span className="rule" aria-hidden="true" /> Limited First Release
        </p>
      </div>

      <a href="#philosophy" className="hero__scroll" aria-label="Scroll to our philosophy">
        <span />
      </a>
    </section>
  )
}
