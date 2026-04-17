import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Temporary password — replace with proper auth when moving to production backend
const ADMIN_PASSWORD = 'sikaptala2026admin'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      navigate('/')
    } else {
      setError('Incorrect password.')
      setPassword('')
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-card__header">
          <p className="admin-login-card__label">SIKAPTALA 2026</p>
          <h1 className="admin-login-card__title">Admin Access</h1>
          <p className="admin-login-card__subtitle">Registration review portal</p>
        </div>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            required
          />
        </div>

        <button type="submit" className="btn btn--primary" style={{ width: '100%' }}>
          Sign In
        </button>

        <p className="admin-login-card__note">
          This portal is for authorized SITE faculty only.
        </p>
      </form>
    </div>
  )
}
