/**
 * Central configuration for the SEVELIAN pre-launch page.
 *
 * Everything business-specific (launch date, API endpoint, social handle,
 * legal links) is read from environment variables so it can be changed per
 * deployment without touching code. See `.env.example` for every option.
 *
 * Anything left empty is treated as "not configured" and the UI degrades
 * honestly (e.g. no launch date -> "COMING SOON", no API -> registration
 * shows a clear "not open yet" error, no Instagram URL -> no social links).
 */
const env = import.meta.env

const clean = (value) => (typeof value === 'string' ? value.trim() : '')

function parseLaunchDate(raw) {
  const value = clean(raw)
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const instagramHandle = clean(env.VITE_INSTAGRAM_HANDLE).replace(/^@/, '')
const instagramUrl =
  clean(env.VITE_INSTAGRAM_URL) ||
  (instagramHandle ? `https://www.instagram.com/${instagramHandle}/` : '')

export const site = {
  brand: 'SEVELIAN',

  /** Main storefront. The pre-order page never modifies it. */
  mainSiteUrl: clean(env.VITE_MAIN_SITE_URL) || 'https://sevelian.com/',
  contactUrl: clean(env.VITE_CONTACT_URL) || 'https://sevelian.com/contact',

  /** Legal pages. Must be configured before going live; see README. */
  privacyUrl: clean(env.VITE_PRIVACY_URL),
  termsUrl: clean(env.VITE_TERMS_URL),

  /**
   * Launch moment as an ISO-8601 string with timezone offset,
   * e.g. 2027-03-01T10:00:00+05:30. Empty -> "COMING SOON".
   */
  launchDate: parseLaunchDate(env.VITE_LAUNCH_DATE),

  api: {
    /** Endpoint that receives early-access registrations (POST JSON). */
    earlyAccessUrl: clean(env.VITE_EARLY_ACCESS_API_URL),
    timeoutMs: 15000,
  },

  instagram: {
    handle: instagramHandle,
    url: instagramUrl,
  },
}
