import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../firebase'

/**
 * Reusable individual registration form for any competition.
 *
 * Props:
 *   competition  — competition object from competitions.js
 *   onUserLoad   — optional callback(user) called once auth resolves,
 *                  used by parent to access the user for the layout header
 */
export default function IndividualRegistrationForm({ competition, onUserLoad }) {
  const navigate = useNavigate()
  const { id: competitionId, name: competitionName, color } = competition

  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'idle' | 'already-registered' | 'submitting'
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: '',
    studentId: '',
    yearSection: '',
    email: '',
  })

  // Resolve auth and check for existing registration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return
      setUser(u)
      onUserLoad?.(u)
      setForm((prev) => ({ ...prev, email: u.email }))

      // Check if this user already registered for this specific competition
      const ref = doc(db, 'registrations', competitionId, 'entries', u.uid)
      const snap = await getDoc(ref)
      setStatus(snap.exists() ? 'already-registered' : 'idle')
    })
    return unsubscribe
  }, [competitionId, onUserLoad])

  function handleField(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.studentId.trim() || !form.yearSection.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setStatus('submitting')
    try {
      await setDoc(doc(db, 'registrations', competitionId, 'entries', user.uid), {
        uid: user.uid,
        competitionId,
        name: form.name.trim(),
        studentId: form.studentId.trim(),
        yearSection: form.yearSection.trim(),
        email: form.email,
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
          You have already submitted a registration for <strong>{competitionName}</strong>.
          The selection committee will be in touch.
        </p>
      </div>
    )
  }

  return (
    <form className="reg-form" onSubmit={handleSubmit} noValidate>
      <h2 className="reg-form__title">Registration Form</h2>
      <p className="reg-form__subtitle">Individual entry — one submission per student.</p>

      <div className="form-grid">
        <div className="form-field form-field--full">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleField}
            placeholder="Last Name, First Name M.I."
            required
            maxLength={100}
          />
        </div>

        <div className="form-field">
          <label htmlFor="studentId">Student ID *</label>
          <input
            id="studentId"
            name="studentId"
            type="text"
            value={form.studentId}
            onChange={handleField}
            placeholder="e.g. 2023-12345"
            required
            maxLength={20}
          />
        </div>

        <div className="form-field">
          <label htmlFor="yearSection">Year & Section *</label>
          <input
            id="yearSection"
            name="yearSection"
            type="text"
            value={form.yearSection}
            onChange={handleField}
            placeholder="e.g. 3-BSIT-A"
            required
            maxLength={30}
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            readOnly
            className="input--readonly"
          />
          <span className="form-field__hint">From your Google account — cannot be changed.</span>
        </div>
      </div>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <div className="form-actions">
        <p className="form-actions__note">* Required fields. You can only submit once.</p>
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
