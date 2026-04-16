// Competition data for SIKAPTALA 2026
// Colors sourced from the official Schedule of Events image.
// Per-competition slot limits and eligibility rules are TBD — update when guidelines arrive.

export const COMPETITIONS = [
  {
    id: 'quiz-bee',
    name: 'CS & IT Quiz Bee',
    dates: 'May 11 & 13',
    platform: 'Slido',
    color: '#F5C518',       // Yellow
    colorDark: '#B8940F',
    description: 'Online quiz competition testing CS & IT knowledge.',
    slots: null,            // TBD
    teamSize: null,         // TBD — set to 1 for individual, or e.g. { min: 2, max: 3 }
  },
  {
    id: 'skills',
    name: 'CS & IT Skills Competition',
    dates: 'May 14–15',
    platform: 'HackerRank',
    color: '#7C3AED',       // Purple
    colorDark: '#5B21B6',
    description: 'Practical programming and technical skills challenge.',
    slots: null,
    teamSize: null,
  },
  {
    id: 'web-design',
    name: 'Web Design Competition',
    dates: 'May 11',
    platform: 'Figma',
    color: '#E85D04',       // Orange/Red
    colorDark: '#B84300',
    description: 'Design a compelling web layout and UI.',
    slots: null,
    teamSize: null,
  },
  {
    id: 'cloud-research',
    name: 'Cloud Research Competition',
    dates: 'May 12–15',
    platform: 'MS Teams',
    color: '#0891B2',       // Teal
    colorDark: '#0E7490',
    description: 'Research paper or presentation on cloud computing topics.',
    slots: null,
    teamSize: null,
  },
  {
    id: 'game-jam',
    name: 'Game Jam Competition',
    dates: 'May 11–14',
    platform: 'itch.io',
    color: '#16A34A',       // Green
    colorDark: '#15803D',
    description: 'Build a game from scratch within the jam period.',
    slots: null,
    teamSize: null,
  },
  {
    id: 'hackathon',
    name: 'Hackathon Competition',
    dates: 'May 11–14',
    platform: 'MS Teams',
    color: '#DC2626',       // Red
    colorDark: '#B91C1C',
    description: 'Fast-paced software development challenge.',
    slots: null,
    teamSize: null,
  },
]
