import Picture from './Picture.jsx'

export default function BrandStatement() {
  return (
    <section className="statement" aria-labelledby="statement-title">
      <div className="statement__media">
        <Picture
          name="statement-wide"
          art={{ name: 'statement-tall', media: '(max-width: 760px) and (orientation: portrait)' }}
          alt="A man in a pale button-down shirt seated beside a vintage record player"
          sizes="100vw"
        />
      </div>
      <div className="statement__veil" aria-hidden="true" />
      <div className="statement__content container" data-reveal>
        <h2 id="statement-title" className="statement__title">
          Less, but better.
          <br />
          <em>Always timeless.</em>
        </h2>
        <p className="statement__sub">Sevelian — The Art of Effortless Elegance.</p>
      </div>
    </section>
  )
}
