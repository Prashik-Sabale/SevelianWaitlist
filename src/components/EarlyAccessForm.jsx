import { useId, useRef, useState } from 'react'
import { site } from '../config/site.js'
import { submitRegistration } from '../lib/api.js'
import { COLLECTION_OPTIONS, normaliseRegistration, validateRegistration } from '../lib/validation.js'
import { ArrowIcon } from './Icons.jsx'

const EMPTY = { fullName: '', email: '', mobile: '', preferredCollection: '', consent: false, company: '' }
const FIELD_ORDER = ['fullName', 'email', 'mobile', 'preferredCollection', 'consent']

function Field({ id, label, optional, error, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__opt">Optional</span>}
      </label>
      {children}
      <p id={`${id}-error`} className="field__error" aria-live="polite">
        {error || ''}
      </p>
    </div>
  )
}

export default function EarlyAccessForm() {
  const uid = useId()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [notice, setNotice] = useState(null) // { kind, message }
  const inflight = useRef(false)
  const formRef = useRef(null)
  const successRef = useRef(null)

  const id = (name) => `${uid}-${name}`

  const update = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    const next = { ...values, [name]: value }
    setValues(next)
    if (touched[name] || errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateRegistration(next)[name] }))
    }
  }

  const blur = (name) => () => {
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateRegistration(values)[name] }))
  }

  const focusFirstError = (errs) => {
    const first = FIELD_ORDER.find((f) => errs[f])
    if (first) formRef.current?.querySelector(`#${CSS.escape(id(first))}`)?.focus()
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (inflight.current || status === 'success') return // block double submits

    setNotice(null)
    const errs = validateRegistration(values)
    setErrors(errs)
    setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])))
    if (Object.keys(errs).length) {
      focusFirstError(errs)
      return
    }

    // Honeypot: real visitors never see or fill this field.
    if (values.company) return

    inflight.current = true
    setStatus('submitting')
    try {
      await submitRegistration(normaliseRegistration(values))
      setStatus('success')
      requestAnimationFrame(() => successRef.current?.focus())
    } catch (err) {
      setStatus('idle')
      if (err.fieldErrors) {
        setErrors(err.fieldErrors)
        focusFirstError(err.fieldErrors)
      }
      setNotice({ kind: err.kind === 'duplicate' ? 'info' : 'error', message: err.message })
    } finally {
      inflight.current = false
    }
  }

  const submitting = status === 'submitting'
  const describedBy = (name) => (errors[name] ? `${id(name)}-error` : undefined)

  const privacyLink = site.privacyUrl ? (
    <a href={site.privacyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
  ) : (
    'Privacy Policy'
  )

  return (
    <section className="access section" id="early-access" aria-labelledby="access-title">
      <div className="container access__grid">
        <div className="access__intro" data-reveal>
          <p className="eyebrow eyebrow--olive">Exclusive Early Access</p>
          <h2 id="access-title" className="display">
            Be first.
            <br />
            <em>Be Sevelian.</em>
          </h2>
          <span className="rule rule--long" aria-hidden="true" />
          <p className="body-lg">
            Get exclusive early access to our upcoming collection. Be among the first to discover
            timeless essentials before the official launch.
          </p>
          <ul className="access__perks">
            <li>First look at the collection</li>
            <li>Priority access on launch day</li>
            <li>Private updates, never spam</li>
          </ul>
        </div>

        <div className="access__panel" data-reveal style={{ '--d': '0.12s' }}>
          {status === 'success' ? (
            <div className="access__success" role="status" tabIndex={-1} ref={successRef}>
              <span className="access__mark" aria-hidden="true">S</span>
              <h3 className="display display--sm">You&rsquo;re on the list.</h3>
              <p>Thank you for joining Sevelian. We&rsquo;ll be in touch when the collection is ready.</p>
              {site.instagram.url && (
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="link-underline access__follow">
                  Meanwhile, follow @{site.instagram.handle || 'sevelian'}
                </a>
              )}
            </div>
          ) : (
            <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-busy={submitting}>
              <Field id={id('fullName')} label="Full Name" error={touched.fullName && errors.fullName}>
                <input
                  id={id('fullName')}
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={values.fullName}
                  onChange={update('fullName')}
                  onBlur={blur('fullName')}
                  aria-invalid={Boolean(touched.fullName && errors.fullName)}
                  aria-describedby={describedBy('fullName')}
                  disabled={submitting}
                />
              </Field>

              <Field id={id('email')} label="Email Address" error={touched.email && errors.email}>
                <input
                  id={id('email')}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  maxLength={254}
                  value={values.email}
                  onChange={update('email')}
                  onBlur={blur('email')}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={describedBy('email')}
                  disabled={submitting}
                />
              </Field>

              <div className="form__row">
                <Field id={id('mobile')} label="Mobile Number" optional error={touched.mobile && errors.mobile}>
                  <input
                    id={id('mobile')}
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    value={values.mobile}
                    onChange={update('mobile')}
                    onBlur={blur('mobile')}
                    aria-invalid={Boolean(touched.mobile && errors.mobile)}
                    aria-describedby={describedBy('mobile')}
                    disabled={submitting}
                  />
                </Field>

                <Field id={id('preferredCollection')} label="Preferred Collection" optional error={errors.preferredCollection}>
                  <div className="select">
                    <select
                      id={id('preferredCollection')}
                      name="preferredCollection"
                      value={values.preferredCollection}
                      onChange={update('preferredCollection')}
                      aria-invalid={Boolean(errors.preferredCollection)}
                      aria-describedby={describedBy('preferredCollection')}
                      disabled={submitting}
                    >
                      <option value="">Select a collection</option>
                      {COLLECTION_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>

              {/* Honeypot (hidden from people and assistive tech) */}
              <div className="hp" aria-hidden="true">
                <label htmlFor={id('company')}>Company</label>
                <input
                  id={id('company')}
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.company}
                  onChange={update('company')}
                />
              </div>

              <div className={`consent ${touched.consent && errors.consent ? 'consent--error' : ''}`}>
                <input
                  id={id('consent')}
                  type="checkbox"
                  checked={values.consent}
                  onChange={update('consent')}
                  aria-invalid={Boolean(touched.consent && errors.consent)}
                  aria-describedby={`${id('consent')}-error`}
                  disabled={submitting}
                />
                <label htmlFor={id('consent')}>
                  I&rsquo;d like to receive early-access updates from Sevelian by email
                  {values.mobile ? ' and phone' : ''}. I understand my details will be used as
                  described in the {privacyLink}, and I can unsubscribe at any time.
                </label>
                <p id={`${id('consent')}-error`} className="field__error" aria-live="polite">
                  {(touched.consent && errors.consent) || ''}
                </p>
              </div>

              {notice && (
                <div className={`notice notice--${notice.kind}`} role="alert">
                  {notice.message}
                </div>
              )}

              <button type="submit" className="btn btn--dark btn--block" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Joining…
                  </>
                ) : (
                  <>
                    Join the Exclusive List <ArrowIcon />
                  </>
                )}
              </button>

              <p className="form__fine">
                Be the first to know. No unnecessary emails, just exclusive updates from Sevelian.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
