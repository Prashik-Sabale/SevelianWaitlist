/**
 * Registration validation shared by the browser form and the reference API
 * server (server/index.mjs), so both sides enforce identical rules.
 * Plain ESM, no browser- or Node-specific APIs.
 */

export const COLLECTION_OPTIONS = [
  'The Linen Edit',
  'Everyday Essentials',
  'Timeless Classics',
  'The Everyday Oxford',
  'All of the collection',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normaliseRegistration(input = {}) {
  const str = (v) => (typeof v === 'string' ? v.trim() : '')
  return {
    fullName: str(input.fullName).replace(/\s+/g, ' '),
    email: str(input.email).toLowerCase(),
    mobile: str(input.mobile),
    preferredCollection: str(input.preferredCollection),
    consent: input.consent === true,
  }
}

/** Returns an object of field -> message. Empty object means valid. */
export function validateRegistration(input) {
  const data = normaliseRegistration(input)
  const errors = {}

  if (!data.fullName) errors.fullName = 'Please enter your full name.'
  else if (data.fullName.length < 2) errors.fullName = 'Please enter your full name.'
  else if (data.fullName.length > 100) errors.fullName = 'Please keep your name under 100 characters.'

  if (!data.email) errors.email = 'Please enter your email address.'
  else if (data.email.length > 254 || !EMAIL_RE.test(data.email))
    errors.email = 'Please enter a valid email address, e.g. name@example.com.'

  if (data.mobile) {
    const allowedChars = /^\+?[\d\s\-().]+$/.test(data.mobile)
    const digits = data.mobile.replace(/\D/g, '')
    if (!allowedChars || digits.length < 10 || digits.length > 15)
      errors.mobile = 'Please enter a valid mobile number (10–15 digits, country code optional).'
  }

  if (data.preferredCollection && !COLLECTION_OPTIONS.includes(data.preferredCollection))
    errors.preferredCollection = 'Please choose a collection from the list.'

  if (!data.consent) errors.consent = 'Please confirm you would like to receive early-access updates.'

  return errors
}
