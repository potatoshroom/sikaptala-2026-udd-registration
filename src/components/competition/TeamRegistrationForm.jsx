import { useState, useEffect, useCallback } from 'react'
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { resolveTeamSize, formatTeamSize } from '../../data/competitions'
import { YEAR_LEVELS, PROGRAMS, getMajors, getBlocks } from '../../data/curriculum'
import { buildFullName, extractFbUsername } from '../../utils/nameUtils'

function MemberGrid({ prefix, values, onChange, onFbBlur, showEmail, email, locked }) {
  const majors = getMajors(values.yearLevel, values.program)
  const blocks = getBlocks(values.yearLevel, values.program, values.major)
  return (
    <div className="form-grid">
      <div className="form-field">
        <label htmlFor={`${prefix}-lastName`}>Last Name *</label>
        <input
          id={`${prefix}-lastName`} name="lastName" type="text"
          value={values.lastName} onChange={onChange}
          placeholder="e.g. Dela Cruz"
          required maxLength={60}
          readOnly={locked} className={locked ? 'input--readonly' : ''}
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-firstName`}>First Name *</label>
        <input
          id={`${prefix}-firstName`} name="firstName" type="text"
          value={values.firstName} onChange={onChange}
          placeholder="e.g. Juan"
          required maxLength={60}
          readOnly={locked} className={locked ? 'input--readonly' : ''}
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-middleName`}>
          Middle Name <span className="form-field__optional">(optional)</span>
        </label>
        <input
          id={`${prefix}-middleName`} name="middleName" type="text"
          value={values.middleName} onChange={onChange}
          placeholder="e.g. Santos"
          maxLength={60}
          readOnly={locked} className={locked ? 'input--readonly' : ''}
        />
        {!locked && (
          <span className="form-field__hint">Only your middle initial will be used (e.g. "S.").</span>
        )}
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-studentId`}>Student ID *</label>
        <input
          id={`${prefix}-studentId`} name="studentId" type="text"
          value={values.studentId} onChange={onChange}
          placeholder="e.g. 12-3456-789"
          required maxLength={11}
          readOnly={locked} className={locked ? 'input--readonly' : ''}
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-yearLevel`}>Year Level *</label>
        <select id={`${prefix}-yearLevel`} name="yearLevel" value={values.yearLevel} onChange={onChange} required disabled={locked}>
          <option value="">Select year level</option>
          {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor={`${prefix}-program`}>Program *</label>
        <select id={`${prefix}-program`} name="program" value={values.program} onChange={onChange} required disabled={locked || !values.yearLevel}>
          <option value="">Select program</option>
          {values.yearLevel && PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {majors && (
        <div className="form-field">
          <label htmlFor={`${prefix}-major`}>Major *</label>
          <select id={`${prefix}-major`} name="major" value={values.major} onChange={onChange} required disabled={locked}>
            <option value="">Select major</option>
            {majors.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}
      <div className="form-field">
        <label htmlFor={`${prefix}-block`}>Block *</label>
        <select id={`${prefix}-block`} name="block" value={values.block} onChange={onChange} required disabled={locked || blocks.length === 0}>
          <option value="">Select block</option>
          {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        {!locked && (
          <span className="form-field__hint">
            If you are irregular, select the block where you have the most major subjects enrolled in.
          </span>
        )}
      </div>
      <div className="form-field form-field--full">
        <label htmlFor={`${prefix}-facebookLink`}>Facebook Profile *</label>
        <div className="input-group">
          <span className="input-group__prefix">facebook.com/</span>
          <input
            id={`${prefix}-facebookLink`} name="facebookLink" type="text"
            value={values.facebookLink} onChange={onChange} onBlur={onFbBlur}
            placeholder="yourprofile"
            required maxLength={200}
            readOnly={locked} className={locked ? 'input--readonly' : ''}
          />
        </div>
        {!locked && (
          <span className="form-field__hint">Enter only your username (e.g. sch.123), not the full URL.</span>
        )}
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
  return { lastName: '', firstName: '', middleName: '', studentId: '', yearLevel: '', program: '', major: '', block: '', facebookLink: '' }
}

// Converts a stored Firestore member object back to form shape.
// Name is stored as "LastName, FirstName M." so we parse it back.
function memberFromFirestore(m) {
  const [lastName = '', rest = ''] = (m.name ?? '').split(', ')
  const parts = rest.trim().split(' ')
  const firstName = parts[0] ?? ''
  const middleName = parts[1]?.replace(/\.$/, '') ?? ''
  return {
    lastName,
    firstName,
    middleName,
    studentId: m.studentId ?? '',
    yearLevel: m.yearLevel ?? '',
    program: m.program ?? '',
    major: m.major ?? '',
    block: m.block ?? '',
    facebookLink: extractFbUsername(m.facebookLink ?? ''),
  }
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
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [regStatus, setRegStatus] = useState('pending')
  const [denialReason, setDenialReason] = useState(null)
  const [regData, setRegData] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

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

      const [regSnap, profileSnap] = await Promise.all([
        getDoc(doc(db, 'registrations', competitionId, 'entries', u.uid)),
        getDoc(doc(db, 'profiles', u.uid)),
      ])

      if (regSnap.exists()) {
        const data = regSnap.data()
        setRegStatus(data.status || 'pending')
        setDenialReason(data.denialReason || null)
        setRegData(data)
        setStatus('already-registered')
      } else {
        setStatus('idle')
      }

      if (profileSnap.exists()) {
        const p = profileSnap.data()
        setProfile(p)
        setLeader({
          lastName: p.lastName,
          firstName: p.firstName,
          middleName: p.middleName || '',
          studentId: p.studentId,
          yearLevel: p.yearLevel,
          program: p.program,
          major: p.major || '',
          block: p.block,
          facebookLink: extractFbUsername(p.facebookLink),
        })
      }
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

  function handleLeaderFbBlur() {
    setLeader((prev) => ({ ...prev, facebookLink: extractFbUsername(prev.facebookLink) }))
  }

  function handleMemberFbBlur(index) {
    setMembers((prev) => prev.map((m, i) => i === index ? { ...m, facebookLink: extractFbUsername(m.facebookLink) } : m))
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
    if (!leader.lastName.trim() || !leader.firstName.trim() || !leader.studentId.trim() || !leader.yearLevel || !leader.program || !leader.block || !leader.facebookLink.trim()) {
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
      if (!m.lastName.trim() || !m.firstName.trim() || !m.studentId.trim() || !m.yearLevel || !m.program || !m.block || !m.facebookLink.trim()) {
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
        const fbUrl = `https://www.facebook.com/${extractFbUsername(m.facebookLink)}`
        const out = {
          name: buildFullName(m.lastName, m.firstName, m.middleName),
          studentId: m.studentId.trim(),
          yearLevel: m.yearLevel,
          program: m.program,
          block: m.block,
          facebookLink: fbUrl,
        }
        if (getMajors(m.yearLevel, m.program)) out.major = m.major
        if (email != null) out.email = email
        return out
      }

      const regData = {
        uid: user.uid,
        competitionId,
        teamName: teamName.trim(),
        leader: buildMember(leader, leaderEmail),
        members: members.map((m) => buildMember(m, null)),
        totalMembers,
        status: 'pending',
        submittedAt: serverTimestamp(),
      }

      const writes = [setDoc(doc(db, 'registrations', competitionId, 'entries', user.uid), regData)]

      if (!profile) {
        const leaderFbUrl = `https://www.facebook.com/${extractFbUsername(leader.facebookLink)}`
        const profileData = {
          lastName: leader.lastName.trim(),
          firstName: leader.firstName.trim(),
          middleName: leader.middleName.trim(),
          studentId: leader.studentId.trim(),
          yearLevel: leader.yearLevel,
          program: leader.program,
          block: leader.block,
          facebookLink: leaderFbUrl,
          createdAt: serverTimestamp(),
        }
        if (leaderMajors) profileData.major = leader.major
        writes.push(setDoc(doc(db, 'profiles', user.uid), profileData))
      }

      await Promise.all(writes)
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
      if (regData) {
        setTeamName(regData.teamName ?? '')
        if (regData.members?.length) {
          setMembers(regData.members.map(memberFromFirestore))
        }
      }
      setStatus('idle')
    } catch (err) {
      console.error(err)
      setStatus('already-registered')
      setError('Withdrawal failed. Please check your connection and try again.')
    }
  }

  if (status === 'already-registered') {
    const statusConfig = {
      pending:  { symbol: '~',  iconColor: '#F59E0B', title: 'Registration Pending',  body: 'Your registration is under review. You will be notified once a decision has been made.' },
      approved: { symbol: '✓',  iconColor: color,     title: 'Registration Approved', body: 'Your registration has been approved. The selection committee will be in touch regarding the next steps.' },
      denied:   { symbol: '✕',  iconColor: '#EF4444', title: 'Registration Denied',   body: 'Your team registration for this competition has been denied.' },
    }
    const { symbol, iconColor, title, body } = statusConfig[regStatus] ?? statusConfig.pending
    return (
      <div className="reg-already">
        <div className="reg-already__icon" style={{ borderColor: iconColor, color: iconColor }}>{symbol}</div>
        <h3 className="reg-already__title">{title}</h3>
        <p className="reg-already__body">{body}</p>
        {regStatus === 'denied' && denialReason && (
          <div className="reg-already__denial">
            <p className="reg-already__denial-label">Reason</p>
            <p className="reg-already__denial-text">{denialReason}</p>
          </div>
        )}
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        <button
          type="button"
          className="btn-details"
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails ? 'Hide Registration Details' : 'Show Registration Details'}
        </button>
        {showDetails && regData && (
          <div className="reg-details">
            <p className="reg-details__label">Submitted Details</p>
            <div className="reg-details__grid">
              <RegDetailRow label="Team Name" value={regData.teamName} />
              {regData.submittedAt && (
                <RegDetailRow
                  label="Submitted"
                  value={regData.submittedAt.toDate().toLocaleString()}
                />
              )}
            </div>
            <p className="reg-details__section">Leader</p>
            <MemberDetailBlock member={regData.leader} email={regData.leader?.email} />
            {regData.members?.length > 0 && (
              <>
                <p className="reg-details__section">Members</p>
                {regData.members.map((m, i) => (
                  <MemberDetailBlock key={i} member={m} index={i + 1} />
                ))}
              </>
            )}
          </div>
        )}
        <button type="button" className="btn-withdraw" onClick={handleWithdraw}>
          Withdraw Registration
        </button>
      </div>
    )
  }

  const canAddMore = members.length < maxAdditional
  const canRemove = members.length > minAdditional
  const leaderLocked = !!profile

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
        {leaderLocked ? (
          <div className="profile-locked-notice">
            <i className="bi bi-lock-fill profile-locked-notice__icon" />
            <span>Your profile details are locked and reused across all your registrations.</span>
          </div>
        ) : (
          <div className="profile-first-notice">
            <i className="bi bi-info-circle profile-first-notice__icon" />
            <span>Your details will be saved and automatically filled in for your other registrations.</span>
          </div>
        )}
        <MemberGrid
          prefix="leader"
          values={leader}
          onChange={handleLeaderField}
          onFbBlur={handleLeaderFbBlur}
          showEmail
          email={leaderEmail}
          locked={leaderLocked}
        />
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
            onFbBlur={() => handleMemberFbBlur(index)}
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

function RegDetailRow({ label, value, link }) {
  return (
    <div className="reg-details__row">
      <span className="reg-details__key">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="reg-details__val reg-details__val--link">
          {value}
        </a>
      ) : (
        <span className="reg-details__val">{value}</span>
      )}
    </div>
  )
}

function MemberDetailBlock({ member, email, index }) {
  if (!member) return null
  return (
    <div className="reg-details__member">
      {index != null && <p className="reg-details__member-index">Member {index}</p>}
      <div className="reg-details__grid">
        <RegDetailRow label="Name"       value={member.name} />
        <RegDetailRow label="Student ID" value={member.studentId} />
        <RegDetailRow label="Year Level" value={member.yearLevel} />
        <RegDetailRow label="Program"    value={member.program} />
        {member.major && <RegDetailRow label="Major" value={member.major} />}
        <RegDetailRow label="Block"      value={member.block} />
        {email && <RegDetailRow label="Email" value={email} />}
        {member.facebookLink && (
          <RegDetailRow label="Facebook" value={member.facebookLink} link={member.facebookLink} />
        )}
      </div>
    </div>
  )
}
