import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'
import { YEAR_LEVELS, PROGRAMS, getMajors, getBlocks } from '../../data/curriculum'
import { buildFullName, extractFbUsername } from '../../utils/nameUtils'

export default function IndividualRegistrationForm({ competition, onUserLoad }) {
  const navigate = useNavigate()
  const { id: competitionId, name: competitionName, color } = competition

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [regStatus, setRegStatus] = useState('pending')
  const [denialReason, setDenialReason] = useState(null)
  const [regData, setRegData] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    studentId: '',
    yearLevel: '',
    program: '',
    major: '',
    block: '',
    facebookLink: '',
    email: '',
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUser(u)
      onUserLoad?.(u)

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
        setForm((prev) => ({
          ...prev,
          lastName: p.lastName,
          firstName: p.firstName,
          middleName: p.middleName || '',
          studentId: p.studentId,
          yearLevel: p.yearLevel,
          program: p.program,
          major: p.major || '',
          block: p.block,
          facebookLink: extractFbUsername(p.facebookLink),
          email: u.email,
        }))
      } else {
        setForm((prev) => ({ ...prev, email: u.email }))
      }
    })
    return unsubscribe
  }, [competitionId, onUserLoad])

  function handleField(e) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'yearLevel') { next.program = ''; next.major = ''; next.block = '' }
      if (name === 'program')   { next.major = ''; next.block = '' }
      if (name === 'major')     { next.block = '' }
      return next
    })
  }

  function handleFbBlur() {
    setForm((prev) => ({ ...prev, facebookLink: extractFbUsername(prev.facebookLink) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const RE_STUDENT_ID = /^\d{2}-\d{4}-\d{3}$/
    const majors = getMajors(form.yearLevel, form.program)

    if (!form.lastName.trim() || !form.firstName.trim() || !form.studentId.trim() || !form.yearLevel || !form.program || !form.block || !form.facebookLink.trim()) {
      setError('Please fill in all required fields.'); return
    }
    if (majors && !form.major) {
      setError('Please select a major.'); return
    }
    if (!RE_STUDENT_ID.test(form.studentId.trim())) {
      setError('Student ID must follow the format: 12-3456-789.'); return
    }

    const facebookLink = `https://www.facebook.com/${extractFbUsername(form.facebookLink)}`
    const fullName = buildFullName(form.lastName, form.firstName, form.middleName)

    setStatus('submitting')
    try {
      const regData = {
        uid: user.uid,
        competitionId,
        name: fullName,
        studentId: form.studentId.trim(),
        yearLevel: form.yearLevel,
        program: form.program,
        block: form.block,
        facebookLink,
        email: form.email,
        status: 'pending',
        submittedAt: serverTimestamp(),
      }
      if (majors) regData.major = form.major

      const writes = [setDoc(doc(db, 'registrations', competitionId, 'entries', user.uid), regData)]

      if (!profile) {
        const profileData = {
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim(),
          studentId: form.studentId.trim(),
          yearLevel: form.yearLevel,
          program: form.program,
          block: form.block,
          facebookLink,
          createdAt: serverTimestamp(),
        }
        if (majors) profileData.major = form.major
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
    if (!window.confirm('Are you sure you want to withdraw your registration? This cannot be undone.')) return
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
    const statusConfig = {
      pending:  { symbol: '~',  iconColor: '#F59E0B', title: 'Registration Pending',  body: 'Your registration is under review. You will be notified once a decision has been made.' },
      approved: { symbol: '✓',  iconColor: color,     title: 'Registration Approved', body: 'Your registration has been approved. The selection committee will be in touch regarding the next steps.' },
      denied:   { symbol: '✕',  iconColor: '#EF4444', title: 'Registration Denied',   body: 'Your registration for this competition has been denied.' },
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
              <RegDetailRow label="Name"       value={regData.name} />
              <RegDetailRow label="Student ID" value={regData.studentId} />
              <RegDetailRow label="Year Level" value={regData.yearLevel} />
              <RegDetailRow label="Program"    value={regData.program} />
              {regData.major && <RegDetailRow label="Major" value={regData.major} />}
              <RegDetailRow label="Block"      value={regData.block} />
              <RegDetailRow label="Email"      value={regData.email} />
              <RegDetailRow
                label="Facebook"
                value={regData.facebookLink}
                link={regData.facebookLink}
              />
              {regData.submittedAt && (
                <RegDetailRow
                  label="Submitted"
                  value={regData.submittedAt.toDate().toLocaleString()}
                />
              )}
            </div>
          </div>
        )}
        <button type="button" className="btn-withdraw" onClick={handleWithdraw}>
          Withdraw Registration
        </button>
      </div>
    )
  }

  const majors = getMajors(form.yearLevel, form.program)
  const blocks = getBlocks(form.yearLevel, form.program, form.major)
  const locked = !!profile

  return (
    <form className="reg-form" onSubmit={handleSubmit} noValidate>
      <h2 className="reg-form__title">Registration Form</h2>
      <p className="reg-form__subtitle">Individual entry — one submission per student.</p>

      {locked ? (
        <div className="profile-locked-notice">
          <i className="bi bi-lock-fill profile-locked-notice__icon" />
          <span>Your profile details are locked and reused across all your registrations.</span>
        </div>
      ) : (
        <div className="profile-first-notice">
          <i className="bi bi-info-circle profile-first-notice__icon" />
          <span>Your name, student ID, year, program, block, and Facebook profile will be saved and automatically filled in for your other registrations.</span>
        </div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName" name="lastName" type="text"
            value={form.lastName} onChange={handleField}
            placeholder="e.g. Dela Cruz"
            required maxLength={60}
            readOnly={locked} className={locked ? 'input--readonly' : ''}
          />
        </div>

        <div className="form-field">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName" name="firstName" type="text"
            value={form.firstName} onChange={handleField}
            placeholder="e.g. Juan"
            required maxLength={60}
            readOnly={locked} className={locked ? 'input--readonly' : ''}
          />
        </div>

        <div className="form-field">
          <label htmlFor="middleName">
            Middle Name <span className="form-field__optional">(optional)</span>
          </label>
          <input
            id="middleName" name="middleName" type="text"
            value={form.middleName} onChange={handleField}
            placeholder="e.g. Santos"
            maxLength={60}
            readOnly={locked} className={locked ? 'input--readonly' : ''}
          />
          {!locked && (
            <span className="form-field__hint">Only your middle initial will be used (e.g. "S.").</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="studentId">Student ID *</label>
          <input
            id="studentId" name="studentId" type="text"
            value={form.studentId} onChange={handleField}
            placeholder="e.g. 12-3456-789"
            required maxLength={11}
            readOnly={locked} className={locked ? 'input--readonly' : ''}
          />
        </div>

        <div className="form-field">
          <label htmlFor="yearLevel">Year Level *</label>
          <select id="yearLevel" name="yearLevel" value={form.yearLevel} onChange={handleField} required disabled={locked}>
            <option value="">Select year level</option>
            {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="program">Program *</label>
          <select id="program" name="program" value={form.program} onChange={handleField} required disabled={locked || !form.yearLevel}>
            <option value="">Select program</option>
            {form.yearLevel && PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {majors && (
          <div className="form-field">
            <label htmlFor="major">Major *</label>
            <select id="major" name="major" value={form.major} onChange={handleField} required disabled={locked}>
              <option value="">Select major</option>
              {majors.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        <div className="form-field">
          <label htmlFor="block">Block *</label>
          <select id="block" name="block" value={form.block} onChange={handleField} required disabled={locked || blocks.length === 0}>
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
          <label htmlFor="facebookLink">Facebook Profile *</label>
          <div className="input-group">
            <span className="input-group__prefix">facebook.com/</span>
            <input
              id="facebookLink" name="facebookLink" type="text"
              value={form.facebookLink} onChange={handleField} onBlur={handleFbBlur}
              placeholder="yourprofile"
              required maxLength={200}
              readOnly={locked} className={locked ? 'input--readonly' : ''}
            />
          </div>
          {!locked && (
            <span className="form-field__hint">Enter only your username (e.g. sch.123), not the full URL.</span>
          )}
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email"
            value={form.email} readOnly className="input--readonly"
          />
          <span className="form-field__hint">From your Google account — cannot be changed.</span>
        </div>
      </div>

      {error && <div className="alert alert--error" role="alert">{error}</div>}

      <div className="form-actions">
        <p className="form-actions__note">* Required fields. You can only submit once.</p>
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
