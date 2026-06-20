const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function submitRsvp(payload) {
  const response = await fetch(`${API_BASE}/api/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export async function fetchRsvps(adminKey) {
  const response = await fetch(`${API_BASE}/api/rsvp`, {
    headers: {
      'x-admin-key': adminKey,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}
