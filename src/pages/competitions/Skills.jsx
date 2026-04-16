import { useState } from 'react'
import { getCompetition } from '../../data/competitions'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TopicsList from '../../components/competition/TopicsList'
import IndividualRegistrationForm from '../../components/competition/IndividualRegistrationForm'

const competition = getCompetition('skills')

export default function Skills() {
  const [user, setUser] = useState(null)

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      infoChildren={
        <>
          <div className="comp-languages">
            {competition.languages.map((lang) => (
              <span key={lang} className="comp-language-badge" style={{ borderColor: competition.color, color: competition.color }}>
                {lang}
              </span>
            ))}
            <p className="comp-languages__note">Participants will use both languages.</p>
          </div>
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
