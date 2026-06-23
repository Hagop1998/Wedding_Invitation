import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'rsvps.json')

const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_KEY?.trim()
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

function mapFromDb(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    attending: row.attending,
    guestCount: row.guest_count,
    guestNames: row.guest_names || [],
    phone: row.phone || '',
    email: row.email || '',
    message: row.message || '',
  }
}

function mapToDb(record) {
  return {
    id: record.id,
    created_at: record.createdAt,
    name: record.name,
    attending: record.attending,
    guest_count: record.guestCount,
    guest_names: record.guestNames,
    phone: record.phone,
    email: record.email,
    message: record.message,
  }
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8')
  }
}

async function readRsvpsFromFile() {
  await ensureDataFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

async function writeRsvpsToFile(records) {
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

export function getStorageMode() {
  return supabase ? 'supabase' : 'file'
}

export async function readRsvps() {
  if (supabase) {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data.map(mapFromDb)
  }

  return readRsvpsFromFile()
}

export async function clearAllRsvps() {
  if (supabase) {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .not('id', 'is', null)

    if (error) {
      throw error
    }

    return
  }

  await writeRsvpsToFile([])
}

export async function addRsvp(record) {
  if (supabase) {
    const { data, error } = await supabase
      .from('rsvps')
      .insert(mapToDb(record))
      .select()
      .single()

    if (error) {
      throw error
    }

    return mapFromDb(data)
  }

  const records = await readRsvpsFromFile()
  records.push(record)
  await writeRsvpsToFile(records)
  return record
}

export async function initStorage() {
  if (supabase) {
    const { error } = await supabase.from('rsvps').select('id').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error.message)
    } else {
      console.log('Supabase connection OK')
    }
    return
  }

  await ensureDataFile()
}

export function getSupabaseErrorMessage(error) {
  return error?.message || error?.details || String(error)
}
