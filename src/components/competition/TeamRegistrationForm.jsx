import { useState, useEffect, useCallback } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { resolveTeamSize, formatTeamSize } from '../../data/competitions'

const PROGRAMS = ['BSCS', 'BSIT']

function emptyMember() {
  return { name: '', studentId: '', yearSection: '', program: '' }
}

/**
 * Reusable team registration form.
 * Supports teamSize: { min, max } or { exact }.
 */
export default function TeamRegistrationForm({ competition, onUserLoad }) {
  const navigate = useNavigate()
  const { id: competitionId, name: competitionName, color } = competition
  const teamSize = resolveTeamSize(competition.teamSize)
  const teamSizeLabel = formatTeamSize(competition.teamSize)
  // Leader counts as one member, so additional slots are min-1 to max-1
  const minAdditional = teamSize.min - 1
  const maxAdditional = teamSize.max - 1

  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'idle' | 'already-registered' | 'submitting'
  const [error, setError] = useState(null)

  const [teamName, setTeamName] = useState('')
  const [leader, setLeader] = useState({ name: '', studentId: '', yearSection: '', program: '', email: '' })
  // Start with the minimum required additional members pre-populated
  const [members, setMembers] = useState(() => Array.from({ length: minAdditional }, emptyMember))

  const handleUserLoad = useCallback(onUserLoad, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUser(u)
      handleUserLoad?.(u)
      setLeader((prev) => ({ ...prev, email: u.email }))

      const ref = doc(db, 'registrations', competitionId, 'entries', u.uid)
      const snap = await getDoc(ref)
      setStatus(snap.exists() ? 'already-registered' : 'idle')
    })
    return unsubscribe
  }, [competitionId, handleUserLoad])

  function handleLeaderField(e) {
    const { name, value } = e.target
    setLeader((prev) => ({ ...prev, [name]: value }))
  }

  function handleMemberField(index, e) {
    const { name, value } = e.target
    setMembers((prev) => prev.map((m, i) => i === index ? { ...m, [name]: value } : m))
  }

  function addMember() {
    if (members.length >= maxAdditional) return
    setMembers((prev) => [...prev, emptyMember()])
  }

  function removeMember(index) {
    if (members.length <= minAdditional) return
    setMembers((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validate leader
    if (!teamName.trim()) { setError('Please enter a team name.'); return }
    if (!leader.name.trim() || !leader.studentId.trim() || !leader.yearSection.trim() || !leader.program) {
      setError('Please complete all team leader fields.'); return
    }
    // Validate all members
    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      if (!m.name.trim() || !m.studentId.trim() || !m.yearSection.trim() || !m.program) {
        setError(`Please complete all fields for Member ${i + 2}.`); return
      }
    }

    const totalMembers = 1 + members.length
    if (totalMembers < teamSize.min || totalMembers > teamSize.max) {
      setError(`Team must have ${teamSizeLabel} member${teamSize.min === teamSize.max ? '' : 's'} (currently ${totalMembers}).`); return
    }

    setStatus('submitting')
    try {
      await setDoc(doc(db, 'registrations', competitionId, 'entries', user.uid), {
        uid: user.uid,
        competitionId,
        teamName: teamName.trim(),
        leader: {
          name: leader.name.trim(),
          studentId: leader.studentId.trim(),
          yearSection: leader.yearSection.trim(),
          program: leader.program,
          email: leader.email,
        },
        members: members.map((m) => ({
          name: m.name.trim(),
          studentId: m.studentId.trim(),
          yearSection: m.yearSection.trim(),
          program: m.program,
        })),
        totalMembers,
        submittedAt: serverTimestamp(),
      })
      navigate('/success', { state: { competitionName } })
    } catch (err) {
      console.error(err)
      setStatus('idle')
      if (err.code === 'permission-denied') {
        setError('Submission rejected. You may have already registered, or your account is not eligible.')
      } else {
        setError('Submission failed. Please check your connection and try again.')
      }
    }
  }

  if (status === 'loading') {
    return <div className="reg-form-loading">Checking registration status…</div>
  }

  if (status === 'already-registered') {
    return (
      <div className="reg-already">
        <div className="reg-already__icon" style={{ borderColor: color, color }}>✓</div>
        <h3 className="reg-already__title">Already Registered</h3>
        <p className="reg-already__body">
          You have already submitted a team registration for <strong>{competitionName}</strong>.
          The selection committee will be in touch.
        </p>
      </div>
    )
  }

  const canAddMore = members.length < maxAdditional
  const canRemove = members.length > minAdditional

  return (
    <form className="reg-form" onSubmit={handleSubmit} noValidate>
      <h2 className="reg-form__title">Team Registration</h2>
      <p className="reg-form__subtitle">
        {teamSizeLabel} members · The person submitting this form is the team leader.
      </p>

      {/* Team name */}
      <div className="form-field">
        <label htmlFor="teamName">Team Name *</label>
        <input
          id="teamName"
          name="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
          required
          maxLength={60}
        />
      </div>

      {/* Leader */}
      <div className="team-member-block team-member-block--leader" style={{ '--member-color': color }}>
        <p className="team-member-block__label">Member 1 — Team Leader (You)</p>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label htmlFor="leaderName">Full Name *</label>
            <input
              id="leaderName"
              name="name"
              type="text"
              value={leader.name}
              onChange={handleLeaderField}
              placeholder="Last Name, First Name M.I."
              required
              maxLength={100}
            />
          </div>
          <div className="form-field">
            <label htmlFor="leaderStudentId">Student ID *</label>
            <input
              id="leaderStudentId"
              name="studentId"
              type="text"
              value={leader.studentId}
              onChange={handleLeaderField}
              placeholder="e.g. 2023-12345"
              required
              maxLength={20}
            />
          </div>
          <div className="form-field">
            <label htmlFor="leaderYearSection">Year & Section *</label>
            <input
              id="leaderYearSection"
              name="yearSection"
              type="text"
              value={leader.yearSection}
              onChange={handleLeaderField}
              placeholder="e.g. 3-BSIT-A"
              required
              maxLength={30}
            />
          </div>
          <div className="form-field">
            <label htmlFor="leaderProgram">Program *</label>
            <select
              id="leaderProgram"
              name="program"
              value={leader.program}
              onChange={handleLeaderField}
              required
            >
              <option value="">Select program</option>
              {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="leaderEmail">Email</label>
            <input
              id="leaderEmail"
              name="email"
              type="email"
              value={leader.email}
              readOnly
              className="input--readonly"
            />
            <span className="form-field__hint">From your Google account</span>
          </div>
        </div>
      </div>

      {/* Additional members */}
      {members.map((member, index) => (
        <div key={index} className="team-member-block" style={{ '--member-color': color }}>
          <div className="team-member-block__header">
            <p className="team-member-block__label">Member {index + 2}</p>
            {canRemove && (
              <button
                type="button"
                className="btn-remove-member"
                onClick={() => removeMember(index)}
                aria-label={`Remove member ${index + 2}`}
              >
                Remove
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="form-field form-field--full">
              <label htmlFor={`member-${index}-name`}>Full Name *</label>
              <input
                id={`member-${index}-name`}
                name="name"
                type="text"
                value={member.name}
                onChange={(e) => handleMemberField(index, e)}
                placeholder="Last Name, First Name M.I."
                required
                maxLength={100}
              />
            </div>
            <div className="form-field">
              <label htmlFor={`member-${index}-studentId`}>Student ID *</label>
              <input
                id={`member-${index}-studentId`}
                name="studentId"
                type="text"
                value={member.studentId}
                onChange={(e) => handleMemberField(index, e)}
                placeholder="e.g. 2023-12345"
                required
                maxLength={20}
              />
            </div>
            <div className="form-field">
              <label htmlFor={`member-${index}-yearSection`}>Year & Section *</label>
              <input
                id={`member-${index}-yearSection`}
                name="yearSection"
                type="text"
                value={member.yearSection}
                onChange={(e) => handleMemberField(index, e)}
                placeholder="e.g. 3-BSIT-A"
                required
                maxLength={30}
              />
            </div>
            <div className="form-field">
              <label htmlFor={`member-${index}-program`}>Program *</label>
              <select
                id={`member-${index}-program`}
                name="program"
                value={member.program}
                onChange={(e) => handleMemberField(index, e)}
                required
              >
                <option value="">Select program</option>
                {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}

      {canAddMore && (
        <button type="button" className="btn-add-member" onClick={addMember} style={{ '--member-color': color }}>
          + Add member
          <span className="btn-add-member__count">
            {1 + members.length} / {teamSize.max}
          </span>
        </button>
      )}

      {error && (
        <div className="alert alert--error" role="alert">{error}</div>
      )}

      <div className="form-actions">
        <p className="form-actions__note">
          * Required fields. Only the team leader submits once.
        </p>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === 'submitting'}
          style={{ background: color, borderColor: color }}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Registration'}
        </button>
      </div>
    </form>
  )
}
