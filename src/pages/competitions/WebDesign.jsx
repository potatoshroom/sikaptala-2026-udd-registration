import { useState } from 'react'
import { useCompetition } from '../../hooks/useCompetition'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TopicsList from '../../components/competition/TopicsList'
import TryoutSchedule from '../../components/competition/TryoutSchedule'
import IndividualRegistrationForm from '../../components/competition/IndividualRegistrationForm'

export default function WebDesign() {
  const [user, setUser] = useState(null)
  const { competition } = useCompetition('web-design')

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      headerChildren={
        <div className="comp-languages--banner">
          <span className="comp-language-badge" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
            Figma
          </span>
        </div>
      }
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
