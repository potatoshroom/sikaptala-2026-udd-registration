import { useState } from 'react'
import { getCompetition } from '../../data/competitions'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TeamRegistrationForm from '../../components/competition/TeamRegistrationForm'
import EligibilityInfo from '../../components/competition/EligibilityInfo'

const competition = getCompetition('game-jam')

export default function GameJam() {
  const [user, setUser] = useState(null)

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      infoChildren={<EligibilityInfo competition={competition} />}
    >
      <TeamRegistrationForm competition={competition} onUserLoad={setUser} />
    </CompetitionLayout>
  )
}
