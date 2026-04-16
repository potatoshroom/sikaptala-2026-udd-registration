export default function CompetitionCard({ competition, selected, onToggle }) {
  const { id, name, color, colorDark, description } = competition

  return (
    <label
      className={`competition-card ${selected ? 'competition-card--selected' : ''}`}
      style={{
        '--card-color': color,
        '--card-color-dark': colorDark,
      }}
      htmlFor={`comp-${id}`}
    >
      <input
        type="checkbox"
        id={`comp-${id}`}
        checked={selected}
        onChange={() => onToggle(id)}
        className="competition-card__checkbox"
      />
      <div className="competition-card__accent" />
      <div className="competition-card__body">
        <h3 className="competition-card__name">{name}</h3>
        <p className="competition-card__description">{description}</p>
      </div>
      {selected && (
        <div className="competition-card__check" aria-hidden="true">✓</div>
      )}
    </label>
  )
}
