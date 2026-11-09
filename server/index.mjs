/**
 * Reference early-access API for the SEVELIAN pre-order page.
 *
 * Zero dependencies (Node 18+). Stores registrations as JSON Lines in
 * server/data/registrations.jsonl, rejects duplicates (409), validates with
 * the same rules as the browser form, and applies a basic per-IP rate limit.
 *
 * It is intentionally small: for production you can run it behind a reverse
 * proxy, or replace it with any service that honours the same contract
 * (see README "Registration API contract").
 *
 *   node server/index.mjs            # PORT from API_PORT (default 8787)
 */
import { createServer } from 'node:http'
import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normaliseRegistration, validateRegistration } from '../src/lib/validation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.API_DATA_DIR || path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'registrations.jsonl')
const PORT = Number(process.env.API_PORT || 8787)
const ALLOWED = (process.env.API_ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const MAX_BODY = 8 * 1024

// --- storage ---------------------------------------------------------------
const emails = new Set()
let writeChain = Promise.resolve()

async function loadExisting() {
  await mkdir(DATA_DIR, { recursive: true })
  if (!existsSync(DATA_FILE)) return
  const text = await readFile(DATA_FILE, 'utf8')
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      emails.add(JSON.parse(line).email)
    } catch {
      /* skip corrupt line */
    }
  }
}

function save(record) {
  // Serialise writes so concurrent requests never interleave lines.
  writeChain = writeChain.then(() => appendFile(DATA_FILE, JSON.stringify(record) + '\n', 'utf8'))
  return writeChain
}

// --- rate limiting (in-memory, per IP) ---------------------------------------
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 8
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}
setInterval(() => {
  const now = Date.now()
  for (const [ip, list] of hits) if (list.every((t) => now - t >= WINDOW_MS)) hits.delete(ip)
}, WINDOW_MS).unref()

// --- http ------------------------------------------------------------------
function send(res, status, body, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  }
  if (origin && ALLOWED.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }
  res.writeHead(status, headers)
  res.end(body === null ? '' : JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('too large'), { status: 413 }))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin
  const url = new URL(req.url, 'http://localhost')

  if (req.method === 'OPTIONS') {
    if (!origin || !ALLOWED.includes(origin)) return send(res, 403, null)
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    })
    return res.end()
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    return send(res, 200, { ok: true }, origin)
  }

  if (url.pathname !== '/api/early-access') return send(res, 404, { message: 'Not found' }, origin)
  if (req.method !== 'POST') return send(res, 405, { message: 'Method not allowed' }, origin)
  if (origin && !ALLOWED.includes(origin)) return send(res, 403, { message: 'Origin not allowed' })
  if (!String(req.headers['content-type'] || '').includes('application/json'))
    return send(res, 415, { message: 'Expected application/json' }, origin)

  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
  if (limited(ip)) return send(res, 429, { message: 'Too many requests' }, origin)

  let input
  try {
    input = JSON.parse(await readBody(req))
  } catch (err) {
    return send(res, err.status || 400, { message: 'Invalid request body' }, origin)
  }

  const errors = validateRegistration(input)
  if (Object.keys(errors).length) {
    return send(res, 422, { message: 'Please check the highlighted fields.', errors }, origin)
  }

  const data = normaliseRegistration(input)
  if (emails.has(data.email)) {
    return send(res, 409, { message: 'This email is already on the early access list.' }, origin)
  }

  emails.add(data.email) // reserve before the async write to block races
  try {
    await save({
      ...data,
      source: typeof input.source === 'string' ? input.source.slice(0, 64) : 'pre-order-landing',
      createdAt: new Date().toISOString(),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    })
  } catch (err) {
    emails.delete(data.email)
    console.error('[early-access] write failed', err)
    return send(res, 500, { message: 'Could not save registration' }, origin)
  }

  return send(res, 201, { ok: true }, origin)
})

await loadExisting()
server.listen(PORT, () => {
  console.log(`[early-access] listening on http://localhost:${PORT}  (${emails.size} existing registrations)`)
})
