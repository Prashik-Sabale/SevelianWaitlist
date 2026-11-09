import { site } from '../config/site.js'

export class RegistrationError extends Error {
  constructor(message, { kind = 'error', fieldErrors = null } = {}) {
    super(message)
    this.kind = kind // 'error' | 'duplicate' | 'not-configured'
    this.fieldErrors = fieldErrors
  }
}

/**
 * Sends a registration to the configured backend.
 * Resolves only when the server confirms with a 2xx response;
 * every other outcome throws a RegistrationError.
 */
export async function submitRegistration(payload) {
  const url = site.api.earlyAccessUrl
  if (!url) {
    throw new RegistrationError(
      'Registrations are not open yet. Please check back shortly.',
      { kind: 'not-configured' },
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), site.api.timeoutMs)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...payload,
        source: 'pre-order-landing',
        submittedAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    })
  } catch (err) {
    throw new RegistrationError(
      err?.name === 'AbortError'
        ? 'The request took too long. Please check your connection and try again.'
        : 'We could not reach our server. Please check your connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    /* non-JSON body: fall through to status handling */
  }

  if (response.ok) return body

  if (response.status === 409) {
    throw new RegistrationError(
      body?.message || 'This email is already on the early access list.',
      { kind: 'duplicate' },
    )
  }
  if (response.status === 400 || response.status === 422) {
    throw new RegistrationError(body?.message || 'Please check the highlighted fields.', {
      fieldErrors: body?.errors || null,
    })
  }
  if (response.status === 429) {
    throw new RegistrationError('Too many attempts. Please wait a moment and try again.')
  }
  throw new RegistrationError('Something went wrong on our side. Please try again in a moment.')
}
