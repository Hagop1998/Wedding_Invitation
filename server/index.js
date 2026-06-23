import express from 'express'
import cors from 'cors'
import { addRsvp, clearAllRsvps, getStorageMode, getSupabaseErrorMessage, initStorage, readRsvps } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_KEY = process.env.ADMIN_KEY || '200626'

app.use(cors())
app.use(express.json())

function validateRsvp(body) {
  const errors = []

  if (!body.name || body.name.trim().length < 2) {
    errors.push('Name is required')
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
  res.json({ ok: true, storage: getStorageMode() })
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
    name: req.body.name.trim(),
    attending: req.body.attending,
    guestCount,
    guestNames,
    phone: req.body.phone || '',
    email: req.body.email || '',
    message: req.body.message || '',
  }

  try {
    await addRsvp(record)
    res.status(201).json({ ok: true, id: record.id })
  } catch (error) {
    console.error('Failed to save RSVP:', error)
    res.status(500).json({ message: 'Failed to save RSVP', detail: getSupabaseErrorMessage(error) })
  }
})

app.get('/api/rsvp', async (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const records = await readRsvps()
    res.json({ count: records.length, records })
  } catch (error) {
    console.error('Failed to read RSVPs:', error)
    res.status(500).json({ message: 'Failed to load RSVPs', detail: getSupabaseErrorMessage(error) })
  }
})

app.delete('/api/rsvp', async (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const beforeCount = (await readRsvps()).length
    await clearAllRsvps()
    res.json({ ok: true, deleted: beforeCount })
  } catch (error) {
    console.error('Failed to clear RSVPs:', error)
    res.status(500).json({ message: 'Failed to clear RSVPs', detail: getSupabaseErrorMessage(error) })
  }
})

app.listen(PORT, async () => {
  await initStorage()
  console.log(`RSVP server running on http://localhost:${PORT}`)
  console.log(`Storage: ${getStorageMode()}`)
})
