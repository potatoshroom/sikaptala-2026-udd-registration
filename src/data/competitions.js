// Competition data for SIKAPTALA 2026
// Colors sourced from the official Schedule of Events image.
// `topics` and `type` are used by individual competition pages.
// Update `slots` and team sizes when official guidelines arrive.

export const COMPETITIONS = [
  {
    id: 'quiz-bee',
    name: 'CS & IT Quiz Bee',
    dates: 'May 11 & 13',
    platform: 'Slido',
    color: '#F5C518',
    colorDark: '#B8940F',
    image: 'quiz-bee.jpg',
    description: 'Online quiz competition testing CS & IT knowledge.',
    type: 'individual',
    slots: null,
    registrationOpen: true,
    topics: [
      'Programming Fundamentals',
      'Historical Aspects of Computing',
      'Ethics and Professionalism',
      'Data Structures and Algorithms',
      'Computer Organization and Architecture',
      'Operating Systems',
      'Databases and Information Systems',
      'Software Engineering',
      'Web and Mobile Development',
      'Computer Networks',
      'Cybersecurity and Computing Ethics',
      'Emerging Technologies (e.g., AI, ML, Cloud Computing, IoT)',
    ],
    topicsNote:
      'Topics are carefully curated to reflect key areas of CS and IT — covering foundational principles, practical applications, and emerging trends. Areas of focus may include, but are not limited to, the topics listed below.',
  },
  {
    id: 'skills',
    name: 'CS & IT Skills Competition',
    dates: 'May 14–15',
    platform: 'HackerRank',
    color: '#7C3AED',
    colorDark: '#5B21B6',
    image: 'skills.jpg',
    description: 'Individual programming challenge using Python and Java on HackerRank.',
    type: 'individual',
    slots: null,
    registrationOpen: true,
    languages: ['Python', 'Java'],
    topics: [
      'Basic Input/Output and Data Types',
      'Control Flow (conditionals, loops)',
      'Functions and Recursion',
      'Arrays and Strings',
      'Object-Oriented Programming',
      'Data Structures (lists, stacks, queues, dictionaries/maps)',
      'Sorting and Searching Algorithms',
      'File Handling',
      'Exception Handling',
      'Basic Algorithm Problem Solving',
    ],
    topicsNote:
      'Participants will compete using both Python and Java. Problems will test programming fundamentals and problem-solving skills. Topics may include, but are not limited to, the following:',
  },
  {
    id: 'web-design',
    name: 'Web Design Competition',
    dates: 'May 11',
    platform: 'Figma',
    color: '#E85D04',
    colorDark: '#B84300',
    image: 'web-design.png',
    description: 'Individual UI/UX design competition using Figma.',
    type: 'individual',
    slots: null,
    registrationOpen: true,
    themeNote: 'The official theme will be announced on the day of the competition. All submitted designs must clearly interpret and integrate the assigned theme, applying your own creative approach.',
    topics: [
      'Clear design objectives',
      'Functionality',
      'User Navigation and Structure',
    ],
    topicsNote: 'Submissions will be evaluated based on the following design criteria:',
  },
  {
    id: 'oral-research',
    name: 'Oral Research Competition',
    dates: 'May 12–15',
    platform: 'MS Teams',
    color: '#0891B2',
    colorDark: '#0E7490',
    image: 'research.jpg',
    description: 'Oral research presentation competition.',
    type: 'individual',
    slots: null,
    registrationOpen: false,
    registrationType: 'adviser',
    adviserNote: 'Registration for this competition is not done through this website. If you wish to join, please approach your research adviser. Your adviser will endorse you to the faculty in charge.',
    topics: [],
    topicsNote: null,
  },
  {
    id: 'game-jam',
    name: 'Game Jam Competition',
    dates: 'May 11–14',
    platform: 'itch.io',
    color: '#16A34A',
    colorDark: '#15803D',
    image: 'game-jam.jpg',
    description: 'Build a game from scratch as a team within the jam period.',
    type: 'team',
    teamSize: { min: 3, max: 8 },
    slots: null,
    registrationOpen: true,
    topics: [],
    topicsNote: null,
    eligibilityNote: 'Team members may come from different programs (BSCS or BSIT) or year levels, provided all members are undergraduate students enrolled under the School of Information Technology Education (SITE).',
    exclusiveWith: 'Hackathon Competition',
  },
  {
    id: 'hackathon',
    name: 'Hackathon Competition',
    dates: 'May 11–14',
    platform: 'MS Teams',
    color: '#DC2626',
    colorDark: '#B91C1C',
    image: 'hackathon.jpg',
    description: 'Fast-paced team software development challenge.',
    type: 'team',
    teamSize: { exact: 6 },
    slots: null,
    registrationOpen: true,
    topics: [],
    topicsNote: null,
    eligibilityNote: 'Team members may come from different programs (BSCS or BSIT) or year levels, provided all members are undergraduate students enrolled under the School of Information Technology Education (SITE).',
    exclusiveWith: 'Game Jam Competition',
    themeNote: 'The hackathon theme will be revealed during orientation. Teams must identify a specific problem related to the theme and propose an innovative technology solution to address it.',
    processNote: 'As part of the internal selection process, registered teams will undergo an Ideathon — a structured activity where teams present and refine their problem statement and proposed solution before the final competition.',
  },
]

/** Returns a competition by its id, or undefined. */
export function getCompetition(id) {
  return COMPETITIONS.find((c) => c.id === id)
}

/**
 * Normalises teamSize to { min, max } regardless of whether
 * the source uses { min, max } or { exact }.
 */
export function resolveTeamSize(teamSize) {
  if (!teamSize) return null
  if (teamSize.exact != null) return { min: teamSize.exact, max: teamSize.exact }
  return teamSize
}

/**
 * Returns a human-readable team size string.
 * e.g. "Exactly 6" or "3–8"
 */
export function formatTeamSize(teamSize) {
  if (!teamSize) return null
  if (teamSize.exact != null) return `Exactly ${teamSize.exact}`
  return `${teamSize.min}–${teamSize.max}`
}
