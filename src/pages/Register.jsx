import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { COMPETITIONS } from '../data/competitions'

const BASE = import.meta.env.BASE_URL

// Maps competition id to its registration page path.
// Add entries here as each competition page is built.
const COMPETITION_ROUTES = {
  'quiz-bee': '/register/quiz-bee',
  'skills': '/register/skills',
  'web-design': '/register/web-design',
  'game-jam': '/register/game-jam',
  'hackathon': '/register/hackathon',
}

export default function Register() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="page-container">
      <header className="register-header">
        <div>
          <p className="register-header__event">SIKAPTALA 2026</p>
          <h1 className="register-header__title">Select a Competition</h1>
          <p className="register-header__subtitle">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <button className="btn btn--ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <p className="competitions-intro">
        Choose a competition below to view details and submit your registration.
        You can register for multiple competitions individually.
      </p>

      <div className="competitions-listing">
        {COMPETITIONS.map((comp) => {
          const route = COMPETITION_ROUTES[comp.id]
          return (
            <div
              key={comp.id}
              className="comp-listing-card"
              style={{ '--card-color': comp.color, '--card-color-dark': comp.colorDark }}
            >
              {comp.image && (
                <img
                  src={`${BASE}images/${comp.image}`}
                  alt=""
                  className="comp-listing-card__thumb"
                  aria-hidden="true"
                />
              )}
              <div className="comp-listing-card__accent" />
              <div className="comp-listing-card__body">
                <div className="comp-listing-card__header">
                  <h3 className="comp-listing-card__name">{comp.name}</h3>
                  {comp.registrationType === 'adviser' ? (
                    <span className="badge badge--adviser">See adviser</span>
                  ) : comp.registrationOpen ? (
                    <span className="badge badge--open">Open</span>
                  ) : (
                    <span className="badge badge--soon">Coming soon</span>
                  )}
                </div>
                <p className="comp-listing-card__desc">{comp.description}</p>
                {comp.type && (
                  <div className="comp-listing-card__meta">
                    <span className="comp-listing-card__type">
                      {comp.type === 'individual' ? 'Individual' : 'Team'}
                    </span>
                  </div>
                )}
                {comp.adviserNote && (
                  <p className="comp-listing-card__adviser-note">{comp.adviserNote}</p>
                )}
              </div>
              {!comp.adviserNote && (
                <div className="comp-listing-card__action">
                  {route ? (
                    <Link to={route} className="btn btn--register" style={{ background: comp.color }}>
                      Register →
                    </Link>
                  ) : (
                    <span className="btn btn--register btn--register-disabled">
                      Guidelines pending
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
