import { useState, useEffect, useCallback } from 'react'
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { resolveTeamSize, formatTeamSize } from '../../data/competitions'
import { YEAR_LEVELS, PROGRAMS, getMajors, getBlocks } from '../../data/curriculum'

function MemberGrid({ prefix, values, onChange, showEmail, email }) {
  const majors = getMajors(values.yearLevel, values.program)
  const blocks = getBlocks(values.yearLevel, values.program, values.major)
  return (
    <div className="form-grid">
      <div className="form-field form-field--full">
        <label htmlFor={`${prefix}-name`}>Full Name *</label>
        <input
          id={`${prefix}-name`} name="name" type="text"
          value={values.name} onChange={onChange}
          placeholder="Last Name, First Name M.I."
          required maxLength={100}
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-studentId`}>Student ID *</label>
        <input
          id={`${prefix}-studentId`} name="studentId" type="text"
          value={values.studentId} onChange={onChange}
          placeholder="e.g. 12-3456-789"
          required maxLength={11}
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-yearLevel`}>Year Level *</label>
        <select id={`${prefix}-yearLevel`} name="yearLevel" value={values.yearLevel} onChange={onChange} required>
          <option value="">Select year level</option>
          {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-program`}>Program *</label>
        <select id={`${prefix}-program`} name="program" value={values.program} onChange={onChange} required disabled={!values.yearLevel}>
          <option value="">Select program</option>
          {values.yearLevel && PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {majors && (
        <div className="form-field">
          <label htmlFor={`${prefix}-major`}>Major *</label>
          <select id={`${prefix}-major`} name="major" value={values.major} onChange={onChange} required>
            <option value="">Select major</option>
            {majors.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}
      <div className="form-field">
        <label htmlFor={`${prefix}-block`}>Block *</label>
        <select id={`${prefix}-block`} name="block" value={values.block} onChange={onChange} required disabled={blocks.length === 0}>
          <option value="">Select block</option>
          {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className="form-field__hint">
          If you are irregular, select the block where you have the most major subjects enrolled in.
        </span>
      </div>
      <div className="form-field form-field--full">
        <label htmlFor={`${prefix}-facebookLink`}>Facebook Profile *</label>
        <div className="input-group">
          <span className="input-group__prefix">facebook.com/</span>
          <input
            id={`${prefix}-facebookLink`} name="facebookLink" type="text"
            value={values.facebookLink} onChange={onChange}
            placeholder="yourprofile"
            required maxLength={200}
          />
        </div>
      </div>
      {showEmail && (
        <div className="form-field">
          <label htmlFor={`${prefix}-email`}>Email</label>
          <input
            id={`${prefix}-email`} name="email" type="email"
            value={email} readOnly className="input--readonly"
          />
          <span className="form-field__hint">From your Google account</span>
        </div>
      )}
    </div>
  )
}

function emptyMember() {
  return { name: '', studentId: '', yearLevel: '', program: '', major: '', block: '', facebookLink: '' }
}

function cascadeReset(prev, name, value) {
  const next = { ...prev, [name]: value }
  if (name === 'yearLevel') { next.program = ''; next.major = ''; next.block = '' }
  if (name === 'program')   { next.major = ''; next.block = '' }
  if (name === 'major')     { next.block = '' }
  return next
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
  const minAdditional = teamSize.min - 1
  const maxAdditional = teamSize.max - 1

  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const [teamName, setTeamName] = useState('')
  const [leader, setLeader] = useState(emptyMember())
  const [leaderEmail, setLeaderEmail] = useState('')
  const [members, setMembers] = useState(() => Array.from({ length: minAdditional }, emptyMember))

  const handleUserLoad = useCallback(onUserLoad, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUser(u)
      handleUserLoad?.(u)
      setLeaderEmail(u.email)
      const ref = doc(db, 'registrations', competitionId, 'entries', u.uid)
      const snap = await getDoc(ref)
      setStatus(snap.exists() ? 'already-registered' : 'idle')
    })
    return unsubscribe
  }, [competitionId, handleUserLoad])

  function handleLeaderField(e) {
    const { name, value } = e.target
    setLeader((prev) => cascadeReset(prev, name, value))
  }

  function handleMemberField(index, e) {
    const { name, value } = e.target
    setMembers((prev) => prev.map((m, i) => i === index ? cascadeReset(m, name, value) : m))
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

    const RE_STUDENT_ID = /^\d{2}-\d{4}-\d{3}$/

    if (!teamName.trim()) { setError('Please enter a team name.'); return }

    const leaderMajors = getMajors(leader.yearLevel, leader.program)
    if (!leader.name.trim() || !leader.studentId.trim() || !leader.yearLevel || !leader.program || !leader.block || !leader.facebookLink.trim()) {
      setError('Please complete all team leader fields.'); return
    }
    if (leaderMajors && !leader.major) {
      setError('Please select a major for the team leader.'); return
    }
    if (!RE_STUDENT_ID.test(leader.studentId.trim())) {
      setError('Team leader student ID must follow the format: 12-3456-789.'); return
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      const mMajors = getMajors(m.yearLevel, m.program)
      if (!m.name.trim() || !m.studentId.trim() || !m.yearLevel || !m.program || !m.block || !m.facebookLink.trim()) {
        setError(`Please complete all fields for Member ${i + 2}.`); return
      }
      if (mMajors && !m.major) {
        setError(`Please select a major for Member ${i + 2}.`); return
      }
      if (!RE_STUDENT_ID.test(m.studentId.trim())) {
        setError(`Member ${i + 2} student ID must follow the format: 12-3456-789.`); return
      }
    }

    const totalMembers = 1 + members.length
    if (totalMembers < teamSize.min || totalMembers > teamSize.max) {
      setError(`Team must have ${teamSizeLabel} member${teamSize.min === teamSize.max ? '' : 's'} (currently ${totalMembers}).`); return
    }

    setStatus('submitting')
    try {
      const buildMember = (m, email) => {
        const out = {
          name: m.name.trim(),
          studentId: m.studentId.trim(),
          yearLevel: m.yearLevel,
          program: m.program,
          block: m.block,
        }
        if (getMajors(m.yearLevel, m.program)) out.major = m.major
        out.facebookLink = `https://www.facebook.com/${m.facebookLink.trim().split('?')[0].replace(/#.*$/, '')}`
        if (email != null) out.email = email
        return out
      }

      await setDoc(doc(db, 'registrations', competitionId, 'entries', user.uid), {
        uid: user.uid,
        competitionId,
        teamName: teamName.trim(),
        leader: buildMember(leader, leaderEmail),
        members: members.map((m) => buildMember(m, null)),
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

  if (status === 'loading') return <div className="reg-form-loading">Checking registration status…</div>

  async function handleWithdraw() {
    if (!window.confirm('Are you sure you want to withdraw your team registration? This cannot be undone.')) return
    setStatus('loading')
    try {
      await deleteDoc(doc(db, 'registrations', competitionId, 'entries', user.uid))
      setStatus('idle')
    } catch (err) {
      console.error(err)
      setStatus('already-registered')
      setError('Withdrawal failed. Please check your connection and try again.')
    }
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
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        <button type="button" className="btn-withdraw" onClick={handleWithdraw}>
          Withdraw Registration
        </button>
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

      <div className="form-field">
        <label htmlFor="teamName">Team Name *</label>
        <input
          id="teamName" name="teamName" type="text"
          value={teamName} onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
          required maxLength={60}
        />
      </div>

      <div className="team-member-block team-member-block--leader" style={{ '--member-color': color }}>
        <p className="team-member-block__label">Member 1 — Team Leader (You)</p>
        <MemberGrid prefix="leader" values={leader} onChange={handleLeaderField} showEmail email={leaderEmail} />
      </div>

      {members.map((member, index) => (
        <div key={index} className="team-member-block" style={{ '--member-color': color }}>
          <div className="team-member-block__header">
            <p className="team-member-block__label">Member {index + 2}</p>
            {canRemove && (
              <button
                type="button" className="btn-remove-member"
                onClick={() => removeMember(index)}
                aria-label={`Remove member ${index + 2}`}
              >
                Remove
              </button>
            )}
          </div>
          <MemberGrid
            prefix={`member-${index}`}
            values={member}
            onChange={(e) => handleMemberField(index, e)}
          />
        </div>
      ))}

      {canAddMore && (
        <button type="button" className="btn-add-member" onClick={addMember} style={{ '--member-color': color }}>
          + Add member
          <span className="btn-add-member__count">{1 + members.length} / {teamSize.max}</span>
        </button>
      )}

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="form-actions">
        <p className="form-actions__note">* Required fields. Only the team leader submits once.</p>
        <button
          type="submit" className="btn btn--primary"
          disabled={status === 'submitting'}
          style={{ background: color, borderColor: color }}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Registration'}
        </button>
      </div>
    </form>
  )
}
