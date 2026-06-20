import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me'
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json')

app.use(cors())
app.use(express.json())

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8')
  }
}

async function readRsvps() {
  await ensureDataFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

async function writeRsvps(records) {
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

function validateRsvp(body) {
  const errors = []

  if (!body.name || body.name.trim().length < 2) {
    errors.push('Name is required')
  }

  if (!['bride', 'groom'].includes(body.side)) {
    errors.push('Side is required')
  }

  if (!['yes', 'no'].includes(body.attending)) {
    errors.push('Attendance is required')
  }

  if (body.attending === 'yes') {
    const count = Number(body.guestCount)
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      errors.push('Guest count is invalid')
    }

    const guestNames = Array.isArray(body.guestNames)
      ? body.guestNames.map((name) => String(name).trim()).filter(Boolean)
      : []

    if (guestNames.length !== count) {
      errors.push('Guest names are required')
    }

    guestNames.forEach((name) => {
      if (name.length < 2) {
        errors.push('Guest name is invalid')
      }
    })
  }

  return errors
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/rsvp', async (req, res) => {
  const errors = validateRsvp(req.body)

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0] })
  }

  const guestCount = req.body.attending === 'yes' ? Number(req.body.guestCount) : 0
  const guestNames =
    req.body.attending === 'yes' && Array.isArray(req.body.guestNames)
      ? req.body.guestNames.map((name) => String(name).trim())
      : req.body.attending === 'yes'
        ? [req.body.name.trim()]
        : []

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    side: req.body.side,
    name: req.body.name.trim(),
    attending: req.body.attending,
    guestCount,
    guestNames,
    phone: req.body.phone || '',
    email: req.body.email || '',
    message: req.body.message || '',
  }

  const records = await readRsvps()
  records.push(record)
  await writeRsvps(records)

  res.status(201).json({ ok: true, id: record.id })
})

app.get('/api/rsvp', async (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const records = await readRsvps()
  res.json({ count: records.length, records })
})

app.listen(PORT, async () => {
  await ensureDataFile()
  console.log(`RSVP server running on http://localhost:${PORT}`)
  console.log(`Data file: ${DATA_FILE}`)
})
