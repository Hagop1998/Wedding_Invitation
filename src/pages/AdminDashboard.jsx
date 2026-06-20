import { useEffect, useMemo, useState } from 'react'
import { fetchRsvps } from '../api/rsvp'
import './AdminDashboard.css'

const ADMIN_KEY_STORAGE = 'wedding-admin-key'
const DEFAULT_ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || '200626'

const sideLabels = {
  bride: 'Հարսի կողմ',
  groom: 'Փեսայի կողմ',
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString('hy-AM', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function downloadCsv(records) {
  const headers = ['Անուն', 'Կողմ', 'Ներկայություն', 'Հյուրերի թիվ', 'Հյուրերի անուններ', 'Հեռախոս', 'Էլ․ հասցե', 'Հաղորդագրություն', 'Ամսաթիվ']
  const rows = records.map((record) => [
    record.name,
    sideLabels[record.side] || record.side,
    record.attending === 'yes' ? 'Կգա' : 'Չի գա',
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
      setRecords(data.records)
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey)
      setPassword(adminKey)
      setStatus('ready')
    } catch {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setPassword('')
      setStatus('login')
      setError('Գաղտնաբառը սխալ է')
    }
  }

  useEffect(() => {
    if (password) {
      loadRecords(password)
    }
  }, [])

  const stats = useMemo(() => {
    const coming = records.filter((record) => record.attending === 'yes')
    const notComing = records.filter((record) => record.attending === 'no')
    const totalGuests = coming.reduce((sum, record) => sum + record.guestCount, 0)

    return {
      comingCount: coming.length,
      notComingCount: notComing.length,
      totalGuests,
      brideGuests: coming
        .filter((record) => record.side === 'bride')
        .reduce((sum, record) => sum + record.guestCount, 0),
      groomGuests: coming
        .filter((record) => record.side === 'groom')
        .reduce((sum, record) => sum + record.guestCount, 0),
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
    loadRecords(inputPassword.trim())
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
          <h1>Հյուրերի ցանկ</h1>
          <p>Մուտք միայն հարսանիքի զույգի համար</p>

          <form onSubmit={handleLogin}>
            <label className="admin-login__field">
              <span>Գաղտնաբառ</span>
              <input
                type="password"
                value={inputPassword}
                onChange={(event) => setInputPassword(event.target.value)}
                placeholder="Մուտքագրեք գաղտնաբառը"
              />
            </label>

            {error && <p className="admin-login__error">{error}</p>}

            <button type="submit" className="admin-login__button">
              Մուտք
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
          <h1>Հյուրերի պատասխաններ</h1>
          <p>Այստեղ տեսնում եք, թե ով է գալիս և ով՝ ոչ</p>
        </div>
        <div className="admin-header__actions">
          <button type="button" className="admin-button admin-button--light" onClick={() => downloadCsv(records)}>
            Ներբեռնել Excel
          </button>
          <button type="button" className="admin-button admin-button--ghost" onClick={handleLogout}>
            Ելք
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article className="admin-stat admin-stat--yes">
          <span className="admin-stat__label">Կգան</span>
          <strong className="admin-stat__value">{stats.comingCount}</strong>
          <span className="admin-stat__meta">{stats.totalGuests} հյուր ընդամենը</span>
        </article>

        <article className="admin-stat admin-stat--no">
          <span className="admin-stat__label">Չեն կարող գալ</span>
          <strong className="admin-stat__value">{stats.notComingCount}</strong>
          <span className="admin-stat__meta">մերժված պատասխան</span>
        </article>

        <article className="admin-stat admin-stat--side">
          <span className="admin-stat__label">Հարսի կողմ</span>
          <strong className="admin-stat__value">{stats.brideGuests}</strong>
          <span className="admin-stat__meta">հյուր</span>
        </article>

        <article className="admin-stat admin-stat--side">
          <span className="admin-stat__label">Փեսայի կողմ</span>
          <strong className="admin-stat__value">{stats.groomGuests}</strong>
          <span className="admin-stat__meta">հյուր</span>
        </article>
      </section>

      <div className="admin-filters">
        <button
          type="button"
          className={`admin-filter${filter === 'all' ? ' admin-filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Բոլորը ({records.length})
        </button>
        <button
          type="button"
          className={`admin-filter${filter === 'yes' ? ' admin-filter--active' : ''}`}
          onClick={() => setFilter('yes')}
        >
          Կգան ({stats.comingCount})
        </button>
        <button
          type="button"
          className={`admin-filter${filter === 'no' ? ' admin-filter--active' : ''}`}
          onClick={() => setFilter('no')}
        >
          Չեն գալիս ({stats.notComingCount})
        </button>
      </div>

      {status === 'loading' ? (
        <p className="admin-empty">Բեռնվում է...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="admin-empty">Դեռ պատասխաններ չկան</p>
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
                  {record.attending === 'yes' ? 'Կգա' : 'Չի գա'}
                </span>
              </div>

              <dl className="admin-card__details">
                <div>
                  <dt>Կողմ</dt>
                  <dd>{sideLabels[record.side]}</dd>
                </div>
                {record.attending === 'yes' && (
                  <div>
                    <dt>Հյուրերի թիվ</dt>
                    <dd>{record.guestCount}</dd>
                  </div>
                )}
                {record.attending === 'yes' && record.guestNames?.length > 0 && (
                  <div className="admin-card__message">
                    <dt>Հյուրերի անուններ</dt>
                    <dd>{record.guestNames.join(', ')}</dd>
                  </div>
                )}
                {record.phone && (
                  <div>
                    <dt>Հեռախոս</dt>
                    <dd>{record.phone}</dd>
                  </div>
                )}
                {record.email && (
                  <div>
                    <dt>Էլ․ հասցե</dt>
                    <dd>{record.email}</dd>
                  </div>
                )}
                {record.message && (
                  <div className="admin-card__message">
                    <dt>Հաղորդագրություն</dt>
                    <dd>{record.message}</dd>
                  </div>
                )}
                <div>
                  <dt>Պատասխանել է</dt>
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
          ← Վերադառնալ հրավեր
        </a>
      </footer>
    </div>
  )
}
