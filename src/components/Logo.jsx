const BASE = `${import.meta.env.BASE_URL}images/`

/** The official SEVELIAN wordmark, in ivory or charcoal. */
export default function Logo({ tone = 'dark', className = '', ...rest }) {
  return (
    <img
      src={`${BASE}logo-${tone}.png`}
      alt="SEVELIAN"
      width="640"
      height="92"
      className={`logo ${className}`}
      {...rest}
    />
  )
}
