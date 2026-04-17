import { useState } from 'react'
import { getCompetition } from '../../data/competitions'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TopicsList from '../../components/competition/TopicsList'
import TryoutSchedule from '../../components/competition/TryoutSchedule'
import IndividualRegistrationForm from '../../components/competition/IndividualRegistrationForm'

const competition = getCompetition('skills')

export default function Skills() {
  const [user, setUser] = useState(null)

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      headerChildren={
        <div className="comp-languages comp-languages--banner">
          {competition.languages.map((lang) => (
            <span key={lang} className="comp-language-badge" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
              {lang}
            </span>
          ))}
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
