import { useState } from 'react'
import { getCompetition } from '../../data/competitions'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TopicsList from '../../components/competition/TopicsList'
import IndividualRegistrationForm from '../../components/competition/IndividualRegistrationForm'

const competition = getCompetition('quiz-bee')

export default function QuizBee() {
  const [user, setUser] = useState(null)

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      infoChildren={
        <TopicsList
          topics={competition.topics}
          note={competition.topicsNote}
          color={competition.color}
        />
      }
    >
      <IndividualRegistrationForm
        competition={competition}
        onUserLoad={setUser}
      />
    </CompetitionLayout>
  )
}
