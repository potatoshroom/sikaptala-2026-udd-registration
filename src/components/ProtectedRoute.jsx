import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Navigate } from 'react-router-dom'
import { auth } from '../firebase'

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  if (user === undefined) {
    return <div className="loading-screen">Checking authentication…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
