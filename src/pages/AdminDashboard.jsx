import { useEffect, useMemo, useState } from 'react'
import { fetchRsvps } from '../api/rsvp'
import './AdminDashboard.css'

const ADMIN_KEY_STORAGE = 'wedding-admin-key'
const DEFAULT_ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || '200626'

function normalizeRecord(record) {
  return {
    ...record,
    attending: String(record.attending || '').toLowerCase(),
    guestCount: Number(record.guestCount ?? record.guest_count ?? 0),
    guestNames: record.guestNames ?? record.guest_names ?? [],
  }
}
  const date = new Date(isoString)
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function downloadCsv(records) {
  const headers = ['Name', 'Status', 'Guest count', 'Guest names', 'Phone', 'Email', 'Message', 'Date']
  const rows = records.map((record) => [
    record.name,
    record.attending === 'yes' ? 'Accepted' : 'Declined',
    record.guestCount,
    Array.isArray(record.guestNames) ? record.guestNames.join(', ') : record.name,
    record.phone,
    record.email,
    record.message,
    formatDate(record.createdAt),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'wedding-guests.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboard() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) || '')
  const [inputPassword, setInputPassword] = useState('')
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem(ADMIN_KEY_STORAGE) ? 'loading' : 'login',
  )
  const [error, setError] = useState('')

  async function loadRecords(adminKey) {
    setStatus('loading')
    setError('')

    try {
      const data = await fetchRsvps(adminKey)
      setRecords((data.records || []).map(normalizeRecord))
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey)
      setPassword(adminKey)
      setStatus('ready')
    } catch {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setPassword('')
      setStatus('login')
      setError('Wrong password')
    }
  }

  useEffect(() => {
    if (password) {
      loadRecords(password)
    }
  }, [])

  const stats = useMemo(() => {
    const accepted = records.filter((record) => record.attending === 'yes')
    const declined = records.filter((record) => record.attending === 'no')
    const totalGuests = accepted.reduce(
      (sum, record) => sum + Number(record.guestCount || 0),
      0,
    )

    return {
      acceptedCount: accepted.length,
      declinedCount: declined.length,
      totalGuests,
    }
  }, [records])

  const filteredRecords = useMemo(() => {
    if (filter === 'yes') {
      return records.filter((record) => record.attending === 'yes')
    }

    if (filter === 'no') {
      return records.filter((record) => record.attending === 'no')
    }

    return records
  }, [records, filter])

  function handleLogin(event) {
    event.preventDefault()
    loadRecords(inputPassword.trim() || DEFAULT_ADMIN_KEY)
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE)
    setPassword('')
    setInputPassword('')
    setRecords([])
    setStatus('login')
  }

  if (!password || status === 'login') {
    return (
      <div className="admin">
        <div className="admin-login">
          <h1>Guest list</h1>
          <p>Admin access for Hagop & Ashkhen</p>

          <form onSubmit={handleLogin}>
            <label className="admin-login__field">
              <span>Password</span>
              <input
                type="password"
                value={inputPassword}
                onChange={(event) => setInputPassword(event.target.value)}
                placeholder="Enter password"
              />
            </label>

            {error && <p className="admin-login__error">{error}</p>}

            <button type="submit" className="admin-login__button">
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <div>
          <h1>RSVP responses</h1>
          <p>See who accepted and who declined</p>
        </div>
        <div className="admin-header__actions">
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={() => loadRecords(password)}
          >
            Refresh
          </button>
          <button type="button" className="admin-button admin-button--light" onClick={() => downloadCsv(records)}>
            Download CSV
          </button>
          <button type="button" className="admin-button admin-button--ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article className="admin-stat admin-stat--yes">
          <span className="admin-stat__label">Accepted</span>
          <strong className="admin-stat__value">{stats.acceptedCount}</strong>
          <span className="admin-stat__meta">{stats.totalGuests} guests total</span>
        </article>

        <article className="admin-stat admin-stat--no">
          <span className="admin-stat__label">Declined</span>
          <strong className="admin-stat__value">{stats.declinedCount}</strong>
          <span className="admin-stat__meta">cannot attend</span>
        </article>
      </section>

      <div className="admin-filters">
        <button
          type="button"
          className={`admin-filter${filter === 'all' ? ' admin-filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({records.length})
        </button>
        <button
          type="button"
          className={`admin-filter${filter === 'yes' ? ' admin-filter--active' : ''}`}
          onClick={() => setFilter('yes')}
        >
          Accepted ({stats.acceptedCount})
        </button>
        <button
          type="button"
          className={`admin-filter${filter === 'no' ? ' admin-filter--active' : ''}`}
          onClick={() => setFilter('no')}
        >
          Declined ({stats.declinedCount})
        </button>
      </div>

      {status === 'loading' ? (
        <p className="admin-empty">Loading...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="admin-empty">No responses yet</p>
      ) : (
        <section className="admin-list">
          {filteredRecords.map((record) => (
            <article
              key={record.id}
              className={`admin-card admin-card--${record.attending === 'yes' ? 'yes' : 'no'}`}
            >
              <div className="admin-card__top">
                <h2>{record.name}</h2>
                <span className={`admin-badge admin-badge--${record.attending}`}>
                  {record.attending === 'yes' ? 'Accepted' : 'Declined'}
                </span>
              </div>

              <dl className="admin-card__details">
                {record.attending === 'yes' && (
                  <div>
                    <dt>Guests</dt>
                    <dd>{record.guestCount}</dd>
                  </div>
                )}
                {record.attending === 'yes' && record.guestNames?.length > 0 && (
                  <div className="admin-card__message">
                    <dt>Guest names</dt>
                    <dd>{record.guestNames.join(', ')}</dd>
                  </div>
                )}
                {record.phone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>{record.phone}</dd>
                  </div>
                )}
                {record.email && (
                  <div>
                    <dt>Email</dt>
                    <dd>{record.email}</dd>
                  </div>
                )}
                {record.message && (
                  <div className="admin-card__message">
                    <dt>Message</dt>
                    <dd>{record.message}</dd>
                  </div>
                )}
                <div>
                  <dt>Responded</dt>
                  <dd>{formatDate(record.createdAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      )}

      <footer className="admin-footer">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault()
            window.location.hash = ''
          }}
        >
          ← Back to invitation
        </a>
      </footer>
    </div>
  )
}
