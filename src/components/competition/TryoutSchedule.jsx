export default function TryoutSchedule({ competition }) {
  const { tryout, color } = competition
  if (!tryout) return null

  const { sessions, note } = tryout

  return (
    <div className="tryout-card" style={{ '--callout-color': color }}>
      <p className="tryout-card__label">Tryout Schedule</p>
      {note && <p className="tryout-card__note">{note}</p>}
      <div className="tryout-sessions">
        {sessions.map((session, i) => (
          <div key={i} className="tryout-session">
            {session.label && <p className="tryout-session__name">{session.label}</p>}
            <p className="tryout-session__date">{session.date}</p>
            <p className="tryout-session__time">{session.time}</p>
            {session.venue && (
              <span className="tryout-session__venue">{session.venue}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
