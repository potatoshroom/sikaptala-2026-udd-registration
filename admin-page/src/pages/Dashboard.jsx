import { useNavigate } from 'react-router-dom'
import { COMPETITIONS, ENTRIES } from '../data/mock'

export default function Dashboard() {
  const navigate = useNavigate()

  function handleSignOut() {
    sessionStorage.removeItem('admin_auth')
    navigate('/login')
  }

  const totalEntries = Object.values(ENTRIES).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="admin-layout">
      <Sidebar onSignOut={handleSignOut} activeId={null} />

      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-topbar__title">Dashboard</h1>
            <p className="admin-topbar__subtitle">SIKAPTALA 2026 — Internal Registration Overview</p>
          </div>
          <div className="admin-topbar__meta">
            <span className="admin-badge admin-badge--info">{totalEntries} total entries</span>
          </div>
        </div>

        <div className="admin-content">
          <div className="admin-stat-grid">
            {COMPETITIONS.map((comp) => {
              const entries = ENTRIES[comp.id] ?? []
              const count = entries.length
              const latest = entries.length
                ? new Date(entries[entries.length - 1].submittedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : null

              return (
                <button
                  key={comp.id}
                  className="stat-card"
                  style={{ '--card-color': comp.color }}
                  onClick={() => navigate(`/competition/${comp.id}`)}
                >
                  <div className="stat-card__accent" />
                  <div className="stat-card__body">
                    <p className="stat-card__label">{comp.name}</p>
                    <p className="stat-card__count">{count}</p>
                    <p className="stat-card__sub">
                      {comp.type === 'team' ? 'team registrations' : 'individual entries'}
                    </p>
                    {latest && <p className="stat-card__latest">Last: {latest}</p>}
                    {count === 0 && <p className="stat-card__empty">No entries yet</p>}
                  </div>
                  <i className="bi bi-chevron-right stat-card__arrow" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ onSignOut, activeId }) {
  const navigate = useNavigate()
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <p className="admin-sidebar__event">SIKAPTALA 2026</p>
        <p className="admin-sidebar__role">Admin Portal</p>
      </div>

      <nav className="admin-sidebar__nav">
        <p className="admin-sidebar__nav-label">Overview</p>
        <button
          className={`admin-sidebar__link ${activeId === null ? 'admin-sidebar__link--active' : ''}`}
          onClick={() => navigate('/')}
        >
          <i className="bi bi-grid-1x2" />
          Dashboard
        </button>

        <p className="admin-sidebar__nav-label" style={{ marginTop: '1.25rem' }}>Competitions</p>
        {COMPETITIONS.map((comp) => (
          <button
            key={comp.id}
            className={`admin-sidebar__link ${activeId === comp.id ? 'admin-sidebar__link--active' : ''}`}
            style={{ '--nav-color': comp.color }}
            onClick={() => navigate(`/competition/${comp.id}`)}
          >
            <span className="admin-sidebar__dot" />
            {comp.name}
          </button>
        ))}
      </nav>

      <button className="admin-sidebar__signout" onClick={onSignOut}>
        <i className="bi bi-box-arrow-left" />
        Sign out
      </button>
    </aside>
  )
}
