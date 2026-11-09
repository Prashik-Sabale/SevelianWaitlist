import { materials } from '../data/content.js'
import Picture from './Picture.jsx'

export default function MaterialStory() {
  return (
    <section className="material section" aria-labelledby="material-title">
      <div className="container">
        <header className="section-head section-head--wide" data-reveal>
          <p className="eyebrow eyebrow--olive">The Material Story</p>
          <h2 id="material-title" className="display">
            Crafted for comfort.
            <br />
            <em>Designed for timelessness.</em>
          </h2>
        </header>

        <ol className="material__list">
          {materials.map((m, i) => (
            <li key={m.no} className="material__item" data-reveal style={{ '--d': `${i * 0.12}s` }}>
              <div className="frame frame--material">
                <Picture name={m.image} alt={m.alt} sizes="(min-width: 960px) 30vw, 92vw" />
              </div>
              <div className="material__text">
                <span className="material__no">{m.no}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
