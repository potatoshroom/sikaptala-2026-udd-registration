import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { COMPETITIONS, formatTeamSize } from '../data/competitions'

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
  const [viewMode, setViewMode] = useState('carousel')
  const [myRegistrations, setMyRegistrations] = useState([])
  const [regsLoading, setRegsLoading] = useState(true)

  const carouselRef = useRef(null)
  const isDragging = useRef(false)
  const isHovered = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const touchCooldown = useRef(null)

  // Auto-scroll via rAF; pauses while dragging or hovering
  useEffect(() => {
    if (viewMode !== 'carousel') return
    let frame
    let scrollPos = 0
    function tick() {
      const el = carouselRef.current
      if (el) {
        if (!isDragging.current && !isHovered.current) {
          const half = el.scrollWidth / 2
          // Sync on first tick after drag ends (momentum may have crossed the boundary)
          scrollPos = scrollPos % half
          scrollPos += 0.4
          if (scrollPos >= half) scrollPos -= half
          el.scrollLeft = scrollPos
        } else {
          // Keep accumulator in sync so resume doesn't snap
          scrollPos = el.scrollLeft
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(touchCooldown.current)
    }
  }, [viewMode])

  function onMouseDown(e) {
    isDragging.current = true
    dragStartX.current = e.pageX
    dragScrollLeft.current = carouselRef.current.scrollLeft
    carouselRef.current.classList.add('comp-carousel--dragging')
  }

  function onMouseMove(e) {
    if (!isDragging.current) return
    const walk = (e.pageX - dragStartX.current) * 1.5
    const el = carouselRef.current
    let next = dragScrollLeft.current - walk
    const half = el.scrollWidth / 2
    if (next < 0) next += half
    if (next >= half) next -= half
    el.scrollLeft = next
  }

  function onMouseUp() {
    isDragging.current = false
    carouselRef.current?.classList.remove('comp-carousel--dragging')
  }

  function onTouchStart() {
    clearTimeout(touchCooldown.current)
    isDragging.current = true
  }

  function onTouchEnd() {
    // Delay re-enabling auto-scroll so browser momentum scroll can finish
    // without the rAF loop fighting it
    touchCooldown.current = setTimeout(() => {
      isDragging.current = false
    }, 800)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) { setRegsLoading(false); return }
      const results = await Promise.all(
        COMPETITIONS.map(async (comp) => {
          const snap = await getDoc(doc(db, 'registrations', comp.id, 'entries', u.uid))
          return snap.exists() ? { comp, data: snap.data() } : null
        })
      )
      setMyRegistrations(results.filter(Boolean))
      setRegsLoading(false)
    })
    return unsubscribe
  }, [])

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="register-page">

      {/* ── Topbar ── */}
      <div className="comp-topbar">
        <span className="register-topbar__brand">SIKAPTALA 2026 · UdD Internal Selection</span>
        <div className="comp-topbar__user">
          <span>{user?.email}</span>
          <button className="btn btn--ghost" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div className="register-hero">
        <div className="register-hero__inner">
          <p className="register-hero__label">Universidad de Dagupan · SITE</p>
          <h1 className="register-hero__title">
            Represent UdD at<br />SIKAPTALA 2026
          </h1>
          <p className="register-hero__body">
            DLSU-D is hosting <strong>SIKAPTALA 2026</strong>, and we are looking for Universidad de Dagupan's
            finest to carry our banner. This portal is the official internal screening —
            students who make the final roster will have all competition expenses{' '}
            <strong>fully covered by the university</strong>, and will receive{' '}
            <strong>review sessions and coaching</strong> from SITE faculty members.
            Official representatives may also receive classwork incentives or
            exemptions in related courses <em>based on their performance</em>.
          </p>
          {/* <a
            href="https://canva.link/7de8v2ub1i7749w"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--guidelines"
          >
            View SIKAPTALA 2026 Official Guidelines (DLSU-D) ↗
          </a> */}
        </div>
      </div>

      {/* ── My Registrations ── */}
      {(regsLoading || myRegistrations.length > 0) && (
        <div className="my-regs-section">
          <h2 className="competitions-section-title">My Registrations</h2>
          {regsLoading ? (
            <p className="my-regs__loading">Checking registrations…</p>
          ) : (
            <div className="my-regs-list">
              {myRegistrations.map(({ comp, data }) => (
                <MyRegRow
                  key={comp.id}
                  comp={comp}
                  data={data}
                  route={COMPETITION_ROUTES[comp.id]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Section heading ── */}
      <div className="register-body">
        <div className="register-body__heading">
          <div className="register-body__heading-row">
            <div>
              <h2 className="competitions-section-title">Competitions</h2>
              <p className="competitions-intro">
                Choose a competition below to view details and register.
                You may register for multiple competitions individually.
              </p>
            </div>
            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === 'carousel' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('carousel')}
                title="Carousel view"
              >
                <i className="bi bi-collection" />
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <i className="bi bi-grid-3x3-gap-fill" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Competition cards ── */}
      {viewMode === 'carousel' ? (
        <div
          className="comp-carousel"
          ref={carouselRef}
          onMouseEnter={() => { isHovered.current = true }}
          onMouseLeave={() => { isHovered.current = false; onMouseUp() }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div className="comp-carousel__track">
            {[...COMPETITIONS, ...COMPETITIONS].map((comp, i) => (
              <CompCard key={`${comp.id}-${i}`} comp={comp} route={COMPETITION_ROUTES[comp.id]} base={BASE} />
            ))}
          </div>
        </div>
      ) : (
        <div className="register-body">
          <div className="competitions-grid-cards">
            {COMPETITIONS.map((comp) => (
              <CompCard key={comp.id} comp={comp} route={COMPETITION_ROUTES[comp.id]} base={BASE} />
            ))}
          </div>
        </div>
      )}

      <div style={{ paddingBottom: '5rem' }} />
    </div>
  )
}

function MyRegRow({ comp, data, route }) {
  const statusConfig = {
    pending:  { label: 'Pending',  cls: 'my-reg-badge--pending' },
    approved: { label: 'Approved', cls: 'my-reg-badge--approved' },
    denied:   { label: 'Denied',   cls: 'my-reg-badge--denied' },
  }
  const { label, cls } = statusConfig[data.status] ?? statusConfig.pending

  return (
    <div className="my-reg-row" style={{ '--reg-color': comp.color }}>
      <div className="my-reg-row__accent" />
      <div className="my-reg-row__info">
        <span className="my-reg-row__name">{comp.name}</span>
        {data.teamName && (
          <span className="my-reg-row__team">{data.teamName}</span>
        )}
      </div>
      {comp.tryout?.sessions?.[0]?.date && (
        <span className="my-reg-row__dates">{comp.tryout.sessions[0].date}</span>
      )}
      <span className={`my-reg-badge ${cls}`}>{label}</span>
      {route && (
        <Link to={route} className="my-reg-row__link">View →</Link>
      )}
    </div>
  )
}

function CompCard({ comp, route, base }) {
  return (
    <div
      className="comp-card"
      style={{ '--card-color': comp.color, '--card-color-dark': comp.colorDark }}
    >
      <div className="comp-card__cover">
        {comp.image && (
          <img
            src={`${base}images/${comp.image}`}
            alt=""
            className="comp-card__cover-img"
            aria-hidden="true"
          />
        )}
        <div className="comp-card__cover-overlay" />
        {comp.registrationType === 'adviser' ? (
          <span className="badge badge--adviser comp-card__badge">See adviser</span>
        ) : comp.registrationOpen ? (
          <span className="badge badge--open comp-card__badge">Open</span>
        ) : (
          <span className="badge badge--soon comp-card__badge">Coming soon</span>
        )}
      </div>

      <div className="comp-card__body">
        <h3 className="comp-card__name">{comp.name}</h3>
        <p className="comp-card__desc">{comp.description}</p>
        {comp.type && (
          <span className="comp-card__type">
            {comp.type === 'individual'
              ? 'Individual'
              : comp.teamSize
              ? `Team · ${formatTeamSize(comp.teamSize)} members`
              : 'Team'}
          </span>
        )}
        {comp.adviserNote && (
          <p className="comp-card__adviser-note">{comp.adviserNote}</p>
        )}
      </div>

      {!comp.adviserNote && (
        <div className="comp-card__action">
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
}
