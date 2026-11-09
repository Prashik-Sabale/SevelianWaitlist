# SEVELIAN — Pre-Order / Early Access Page

A standalone launch page for SEVELIAN's upcoming collection. It is completely
separate from the live store at https://sevelian.com/ and does not touch it.

Built with React 19 + Vite, plain modern CSS, self-hosted fonts
(Cormorant Garamond + Manrope), and responsive AVIF/WebP imagery.

## Quick start

```bash
npm install
npm run dev:api   # reference registration API on :8787 (stores to server/data/)
npm run dev       # page on http://localhost:5173 (proxies /api to :8787)
```

## Configuration

Everything business-specific lives in environment variables, read in one place:
`src/config/site.js`. Copy `.env.example` → `.env.production` and fill it in.

| Variable | Purpose | When empty |
|---|---|---|
| `VITE_LAUNCH_DATE` | ISO-8601 launch moment, e.g. `2027-03-01T10:00:00+05:30` | Shows **COMING SOON** (no fake countdown) |
| `VITE_EARLY_ACCESS_API_URL` | Registration endpoint (POST JSON) | Form says registrations aren't open; never shows success |
| `VITE_INSTAGRAM_HANDLE` / `VITE_INSTAGRAM_URL` | Official Instagram | Instagram icon, gallery links and "Follow" CTA are hidden |
| `VITE_PRIVACY_URL` / `VITE_TERMS_URL` | Legal pages | Footer links hidden; consent text shows "Privacy Policy" unlinked |
| `VITE_MAIN_SITE_URL` / `VITE_CONTACT_URL` | Store + contact page | Defaults to sevelian.com and sevelian.com/contact |
| `VITE_SITE_URL` | Public URL (canonical + Open Graph) | Defaults to `https://sevelian.com/pre-order/` |
| `VITE_BASE_PATH` | Sub-path the build is served from | `/` (use `/pre-order/` for sevelian.com/pre-order) |

Copy and collection groupings live in `src/data/content.js`.

### Before going live — checklist

- [ ] Set `VITE_PRIVACY_URL` (the current store has no privacy page) — required for consent.
- [ ] Set `VITE_TERMS_URL`.
- [ ] Confirm and set the official Instagram handle (none was found on the live site).
- [ ] Set `VITE_LAUNCH_DATE` once the date is decided.
- [ ] Deploy the registration API (or an equivalent) and set `VITE_EARLY_ACCESS_API_URL`.
- [ ] Confirm usage rights for all photography (see *Imagery* below).

## Registration API contract

`POST {VITE_EARLY_ACCESS_API_URL}` with JSON:

```json
{ "fullName": "…", "email": "…", "mobile": "…", "preferredCollection": "…",
  "consent": true, "source": "pre-order-landing", "submittedAt": "ISO date" }
```

| Response | Meaning shown to the visitor |
|---|---|
| `2xx` | Success → "YOU'RE ON THE LIST." |
| `409` | Already registered (informational, not success) |
| `400` / `422` `{ errors: { field: message } }` | Field errors highlighted |
| `429` | Too many attempts |
| anything else / network / 15 s timeout | Generic error, visitor can retry |

`server/index.mjs` is a dependency-free reference implementation: shared
validation (`src/lib/validation.js`), case-insensitive duplicate detection,
per-IP rate limiting, CORS allow-list (`API_ALLOWED_ORIGINS`), and JSON Lines
storage in `server/data/registrations.jsonl`. Run with `npm start`. For larger
volumes, swap the storage for a database or point the page at your CRM/ESP
endpoint that honours the same contract.

Paid pre-orders are deliberately **not** implemented: they need inventory,
pricing, a payment gateway, shipping and order confirmation first.

## Imagery

All photography and the logo come from the live sevelian.com site.
Originals are in `assets-src/`; `npm run images` regenerates every crop,
size and format into `public/images/`, plus favicons and `public/og-image.jpg`.
Crops are defined in `scripts/optimize-images.mjs`.

Note: some images on the live site carry other brands' marks (a "JOAREL"
watermark and printed third-party T-shirts). Those were excluded here.
Please confirm SEVELIAN holds rights to the remaining campaign photos
(`outfitmen.jpg`, `bluesky.jpg`, `category3.jpg`) before launch.

## Deploying

`npm run build` → static files in `dist/`. Serve them under `/pre-order/`
(set `VITE_BASE_PATH=/pre-order/`) via a reverse-proxy rule on sevelian.com,
or on a subdomain with `VITE_BASE_PATH=/`.
