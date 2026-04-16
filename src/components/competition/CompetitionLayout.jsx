import { signOut } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../../firebase'

const BASE = import.meta.env.BASE_URL

export default function CompetitionLayout({ competition, user, children, infoChildren }) {
  const navigate = useNavigate()
  const { name, color, colorDark, image } = competition

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="comp-page">
      {/* ── Top bar ── */}
      <div className="comp-topbar">
        <Link to="/register" className="comp-topbar__back">
          ← All Competitions
        </Link>
        <div className="comp-topbar__user">
          <span>{user?.email}</span>
          <button className="btn btn--ghost" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>

      {/* ── Colored banner with cover image ── */}
      <header className="comp-banner" style={{ '--comp-color': color, '--comp-color-dark': colorDark }}>
        {image && (
          <img
            src={`${BASE}images/${image}`}
            alt=""
            className="comp-banner__cover"
            aria-hidden="true"
          />
        )}
        <div className="comp-banner__inner">
          <p className="comp-banner__event">SIKAPTALA 2026</p>
          <h1 className="comp-banner__title">{name}</h1>
        </div>
      </header>

      {/* ── Two-column body ── */}
      <div className="comp-body">
        <aside className="comp-info">
          {infoChildren}
        </aside>
        <main className="comp-form-col">
          {children}
        </main>
      </div>
    </div>
  )
}
