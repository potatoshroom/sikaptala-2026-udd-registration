export default function TryoutSchedule({ competition }) {
  const { tryout, color } = competition
  if (!tryout) return null

  const { sessions, note } = tryout
  const multi = sessions.length > 1

  return (
    <div className="theme-callout" style={{ '--callout-color': color }}>
      <p className="theme-callout__label">Tryout Schedule</p>
      {note && <p className="theme-callout__text tryout-note">{note}</p>}
      <div className={multi ? 'tryout-sessions' : undefined}>
        {sessions.map((session, i) => (
          <div key={i} className={multi ? 'tryout-session' : undefined}>
            {session.label && <p className="tryout-session__name">{session.label}</p>}
            <p className="tryout-session__detail">{session.date}</p>
            <p className="tryout-session__detail">{session.time}</p>
            {session.venue && <p className="tryout-session__detail tryout-session__venue">{session.venue}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
