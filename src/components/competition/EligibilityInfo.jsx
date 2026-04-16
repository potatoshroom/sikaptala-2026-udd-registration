/**
 * Renders the eligibility block for team competitions.
 * When competition.exclusiveWith is set, also shows the exclusivity warning.
 *
 * Props:
 *   competition — competition object from competitions.js
 */
export default function EligibilityInfo({ competition }) {
  const { color, teamSize, eligibilityNote, exclusiveWith } = competition

  return (
    <>
      {exclusiveWith && (
        <div className="exclusivity-warning">
          <p className="exclusivity-warning__icon" aria-hidden="true">⚠</p>
          <div>
            <p className="exclusivity-warning__title">One team only</p>
            <p className="exclusivity-warning__body">
              Each student may only join <strong>one team</strong> across the{' '}
              <strong>Game Jam</strong> and <strong>Hackathon</strong> competitions.
              Registering for this competition means you and your members may{' '}
              <strong>not</strong> also join the <strong>{exclusiveWith}</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="eligibility-note" style={{ '--note-color': color }}>
        <p className="eligibility-note__label">Eligibility</p>
        <p className="eligibility-note__text">{eligibilityNote}</p>
        <p className="eligibility-note__team-size">
          Team size: <strong>{teamSize.min}–{teamSize.max} members</strong>
        </p>
      </div>
    </>
  )
}
