import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

const ALLOWED_DOMAINS = ['@udd.edu.ph', '@cdd.edu.ph']
const GUIDELINES_URL = 'https://canva.link/7de8v2ub1i7749w'

export default function Login() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null) // 'udd.edu.ph' | 'cdd.edu.ph' | null
  const navigate = useNavigate()

  async function handleSignIn(hd) {
    setError(null)
    setLoading(hd)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ hd })

      const result = await signInWithPopup(auth, provider)
      const email = result.user.email

      const isAllowed = ALLOWED_DOMAINS.some((domain) => email.endsWith(domain))
      if (!isAllowed) {
        await auth.signOut()
        setError(
          `Only UdD (@udd.edu.ph) or CdD (@cdd.edu.ph) accounts are allowed. You signed in with: ${email}`
        )
        return
      }

      navigate('/register')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign-in failed. Please try again.')
        console.error(err)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="landing-page">
      {/* ── Left: announcement ── */}
      <div className="landing-hero">
        <div className="landing-hero__inner">
          <p className="landing-hero__label">SIKAPTALA 2026 · Internal Selection</p>
          <h1 className="landing-hero__title">
            Represent UdD at<br />SIKAPTALA 2026
          </h1>
          <p className="landing-hero__body">
            De La Salle University – Dasmariñas (DLSU-D) is hosting{' '}
            <strong>SIKAPTALA 2026</strong>, and <strong>Universidad de Dagupan</strong>{' '}
            is looking for its most capable representatives to carry our banner in the competition.
          </p>
          <p className="landing-hero__body">
            This portal is our official internal screening. Students who make the final
            roster will have all competition-related expenses{' '}
            <strong>fully covered and subsidized</strong> by the university.
          </p>

          <div className="landing-hero__cta-box">
            <p className="landing-hero__cta-label">Before you apply</p>
            <p className="landing-hero__cta-text">
              Read the official event mechanics, categories, and guidelines thoroughly
              before filling out any registration form.
            </p>
            <a
              href={GUIDELINES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--guidelines"
            >
              View Official Guidelines ↗
            </a>
          </div>

          <p className="landing-hero__footer">
            Universidad de Dagupan · School of Information Technology Education
          </p>
        </div>
      </div>

      {/* ── Right: sign-in card ── */}
      <div className="landing-signin">
        <div className="login-card">
          <div className="login-card__header">
            <p className="login-card__event-label">SIKAPTALA 2026</p>
            <h2 className="login-card__title">Sign In to Apply</h2>
            <p className="login-card__subtitle">
              Use your institutional Google account.
            </p>
          </div>

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <div className="login-card__buttons">
            <button
              className="btn btn--google"
              onClick={() => handleSignIn('udd.edu.ph')}
              disabled={loading !== null}
            >
              <GoogleIcon />
              {loading === 'udd.edu.ph' ? 'Signing in…' : 'Sign in with udd.edu.ph'}
            </button>

            <button
              className="btn btn--google"
              onClick={() => handleSignIn('cdd.edu.ph')}
              disabled={loading !== null}
            >
              <GoogleIcon />
              {loading === 'cdd.edu.ph' ? 'Signing in…' : 'Sign in with cdd.edu.ph'}
            </button>
          </div>

          <p className="login-card__note">
            Only <strong>@udd.edu.ph</strong> and <strong>@cdd.edu.ph</strong> accounts are accepted.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}
