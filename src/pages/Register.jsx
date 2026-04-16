import { useState, useEffect } from 'react'
import { collection, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { COMPETITIONS } from '../data/competitions'
import CompetitionCard from '../components/CompetitionCard'

export default function Register() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: '',
    studentId: '',
    yearSection: '',
    email: '',
    competitions: [],
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        // Pre-fill email from Google account
        setForm((prev) => ({ ...prev, email: u.email }))
        // Check if this user already registered (by email as document ID)
        const ref = doc(db, 'registrations', u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setAlreadyRegistered(true)
        }
      }
    })
    return unsubscribe
  }, [])

  function handleField(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleCompetition(id) {
    setForm((prev) => {
      const has = prev.competitions.includes(id)
      return {
        ...prev,
        competitions: has
          ? prev.competitions.filter((c) => c !== id)
          : [...prev.competitions, id],
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.studentId.trim() || !form.yearSection.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.competitions.length === 0) {
      setError('Please select at least one competition.')
      return
    }

    setSubmitting(true)
    try {
      // Use the Firebase UID as the document ID — this enforces one doc per user
      // in Firestore rules via the exists() check on request.resource.data.uid.
      await setDoc(doc(db, 'registrations', user.uid), {
        uid: user.uid,
        name: form.name.trim(),
        studentId: form.studentId.trim(),
        yearSection: form.yearSection.trim(),
        email: form.email,
        competitions: form.competitions,
        submittedAt: serverTimestamp(),
      })
      navigate('/success')
    } catch (err) {
      console.error(err)
      if (err.code === 'permission-denied') {
        setError(
          'Submission rejected. You may have already registered, or your account is not eligible.'
        )
      } else {
        setError('Submission failed. Please check your connection and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  if (alreadyRegistered) {
    return (
      <div className="page-container">
        <div className="already-registered">
          <h2>You have already registered.</h2>
          <p>
            Your registration for SIKAPTALA 2026 was successfully submitted. The
            selection committee will contact you for next steps.
          </p>
          <button className="btn btn--secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <header className="register-header">
        <div>
          <h1 className="register-header__title">SIKAPTALA 2026 Registration</h1>
          <p className="register-header__subtitle">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <button className="btn btn--ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2 className="form-section__title">Student Information</h2>
          <div className="form-grid">
            <div className="form-field">
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
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                readOnly
                className="input--readonly"
              />
              <span className="form-field__hint">From your Google account</span>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Competition(s) to Join</h2>
          <p className="form-section__desc">
            Select all competitions you wish to be considered for. Specific eligibility
            and team requirements will be communicated by the selection committee.
          </p>
          <div className="competitions-grid">
            {COMPETITIONS.map((comp) => (
              <CompetitionCard
                key={comp.id}
                competition={comp}
                selected={form.competitions.includes(comp.id)}
                onToggle={toggleCompetition}
              />
            ))}
          </div>
        </section>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          <p className="form-actions__note">
            * Required fields. You can only submit once.
          </p>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  )
}
