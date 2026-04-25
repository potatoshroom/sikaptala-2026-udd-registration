import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { COMPETITIONS as LOCAL_COMPETITIONS } from '../data/competitions'

const ORDER = LOCAL_COMPETITIONS.map((c) => c.id)

function sortByOrder(competitions) {
  return [...competitions].sort(
    (a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)
  )
}

/**
 * Returns all competitions from Firestore, starting with the local list
 * as initial state so the Register page renders immediately.
 */
export function useCompetitions() {
  const [competitions, setCompetitions] = useState(LOCAL_COMPETITIONS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'competitions'),
      (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          setCompetitions(sortByOrder(data))
        }
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [])

  return { competitions, loading }
}
