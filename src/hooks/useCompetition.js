import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { getCompetition } from '../data/competitions'

/**
 * Returns a single competition from Firestore by id.
 * Starts with the local static data as initial state so the page renders
 * immediately while Firestore responds.
 */
export function useCompetition(id) {
  const [competition, setCompetition] = useState(() => getCompetition(id))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'competitions', id),
      (snap) => {
        if (snap.exists()) {
          setCompetition({ id: snap.id, ...snap.data() })
        }
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [id])

  return { competition, loading }
}
