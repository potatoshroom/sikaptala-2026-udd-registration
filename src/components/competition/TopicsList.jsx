export default function TopicsList({ topics, note, color }) {
  if (!topics || topics.length === 0) return null

  return (
    <div className="topics-list">
      <h2 className="topics-list__heading" style={{ color }}>
        Topics
      </h2>
      {note && <p className="topics-list__note">{note}</p>}
      <ul className="topics-list__items">
        {topics.map((topic) => (
          <li key={topic} className="topics-list__item">
            <span className="topics-list__bullet" style={{ background: color }} />
            {topic}
          </li>
        ))}
      </ul>
    </div>
  )
}
