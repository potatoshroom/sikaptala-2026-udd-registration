import { useState } from 'react'
import { useCompetition } from '../../hooks/useCompetition'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TeamRegistrationForm from '../../components/competition/TeamRegistrationForm'
import EligibilityInfo from '../../components/competition/EligibilityInfo'
import TryoutSchedule from '../../components/competition/TryoutSchedule'

export default function GameJam() {
  const [user, setUser] = useState(null)
  const { competition } = useCompetition('game-jam')

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      infoChildren={
        <>
          <TryoutSchedule competition={competition} />
          <EligibilityInfo competition={competition} />
        </>
      }
    >
      <TeamRegistrationForm competition={competition} onUserLoad={setUser} />
    </CompetitionLayout>
  )
}
