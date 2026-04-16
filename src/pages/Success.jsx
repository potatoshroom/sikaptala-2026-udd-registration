import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function Success() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-card__icon" aria-hidden="true">✓</div>
        <h1 className="success-card__title">Registration Submitted!</h1>
        <p className="success-card__body">
          Thank you for registering for <strong>SIKAPTALA 2026</strong>. Your application
          has been received by the UDD School of IT Education selection committee.
        </p>
        <p className="success-card__body">
          You will be contacted regarding the next steps. Good luck!
        </p>
        <hr className="success-card__divider" />
        <p className="success-card__note">
          Hosted by <strong>DLSU-D</strong> · Represented by <strong>Universidad de Dagupan</strong>
        </p>
        <button className="btn btn--secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
