import { site } from '../config/site.js'
import useCountdown from '../hooks/useCountdown.js'

const pad = (n) => String(n).padStart(2, '0')

function Unit({ value, label }) {
  return (
    <div className="count__unit">
      <span className="count__num" aria-hidden="true">
        {/* keyed so each change re-runs the soft fade */}
        <span key={value} className="count__digit">{value}</span>
      </span>
      <span className="count__label">{label}</span>
    </div>
  )
}

export default function LaunchCountdown() {
  const target = site.launchDate
  const time = useCountdown(target)

  const dateLabel = target
    ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).format(target)
    : null

  return (
    <section className="count section" aria-labelledby="count-title">
      <div className="container count__inner" data-reveal>
        <p className="eyebrow eyebrow--sand">The Launch</p>
        <h2 id="count-title" className="display display--light">
          The next chapter <em>begins soon.</em>
        </h2>

        {!time && (
          <p className="count__soon" role="status">Coming Soon</p>
        )}

        {time && !time.done && (
          <>
            <div className="count__grid">
              <Unit value={pad(time.days)} label={time.days === 1 ? 'Day' : 'Days'} />
              <Unit value={pad(time.hours)} label="Hours" />
              <Unit value={pad(time.minutes)} label="Minutes" />
              <Unit value={pad(time.seconds)} label="Seconds" />
            </div>
            <p className="sr-only">
              {`${time.days} days, ${time.hours} hours and ${time.minutes} minutes until launch.`}
            </p>
            <p className="count__date">Unveiling {dateLabel}</p>
          </>
        )}

        {time && time.done && (
          <div className="count__live">
            <p className="count__soon">The wait is over.</p>
            <a href={site.mainSiteUrl} className="btn btn--outline-light">Discover the Collection</a>
          </div>
        )}
      </div>
    </section>
  )
}
