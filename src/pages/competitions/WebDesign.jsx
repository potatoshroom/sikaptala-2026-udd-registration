import { useState } from 'react'
import { getCompetition } from '../../data/competitions'
import CompetitionLayout from '../../components/competition/CompetitionLayout'
import TopicsList from '../../components/competition/TopicsList'
import IndividualRegistrationForm from '../../components/competition/IndividualRegistrationForm'

const competition = getCompetition('web-design')

export default function WebDesign() {
  const [user, setUser] = useState(null)

  return (
    <CompetitionLayout
      competition={competition}
      user={user}
      infoChildren={
        <>
          <div className="theme-callout" style={{ '--callout-color': competition.color }}>
            <p className="theme-callout__label">Theme</p>
            <p className="theme-callout__text">{competition.themeNote}</p>
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
