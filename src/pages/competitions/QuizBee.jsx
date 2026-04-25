import { useState } from 'react'
import { useCompetition } from '../../hooks/useCompetition'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TopicsList from '../../components/competition/TopicsList'
import TryoutSchedule from '../../components/competition/TryoutSchedule'
import IndividualRegistrationForm from '../../components/competition/IndividualRegistrationForm'

export default function QuizBee() {
  const [user, setUser] = useState(null)
  const { competition } = useCompetition('quiz-bee')

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      infoChildren={
        <>
          <TryoutSchedule competition={competition} />
          <TopicsList
            topics={competition.topics}
            note={competition.topicsNote}
            color={competition.color}
          />
        </>
      }
    >
      <IndividualRegistrationForm
        competition={competition}
        onUserLoad={setUser}
      />
    </CompetitionLayout>
  )
}
