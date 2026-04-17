export const COMPETITIONS = [
  { id: 'quiz-bee',   name: 'CS & IT Quiz Bee',          color: '#F5C518', type: 'individual' },
  { id: 'skills',     name: 'CS & IT Skills Competition', color: '#7C3AED', type: 'individual' },
  { id: 'web-design', name: 'Web Design Competition',     color: '#E85D04', type: 'individual' },
  { id: 'game-jam',   name: 'Game Jam Competition',       color: '#16A34A', type: 'team' },
  { id: 'hackathon',  name: 'Hackathon Competition',      color: '#DC2626', type: 'team' },
]

const ts = (daysAgo, hoursAgo = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursAgo)
  return d.toISOString()
}

export const ENTRIES = {
  'quiz-bee': [
    { uid: 'u1', competitionId: 'quiz-bee', name: 'Dela Cruz, Juan A.', studentId: '22-1234-001', yearLevel: '2nd Year', program: 'BSIT', block: '03', facebookLink: 'https://facebook.com/juandelacruz', email: 'juan.delacruz@udd.edu.ph', submittedAt: ts(2, 3) },
    { uid: 'u2', competitionId: 'quiz-bee', name: 'Santos, Maria B.', studentId: '23-5678-002', yearLevel: '1st Year', program: 'BSIT', major: 'ITEW', block: '02', facebookLink: 'https://facebook.com/mariasantos', email: 'maria.santos@udd.edu.ph', submittedAt: ts(2, 1) },
    { uid: 'u3', competitionId: 'quiz-bee', name: 'Reyes, Carlo M.', studentId: '21-9012-003', yearLevel: '3rd Year', program: 'BSCS', block: '01', facebookLink: 'https://facebook.com/carloreyes', email: 'carlo.reyes@udd.edu.ph', submittedAt: ts(1, 5) },
    { uid: 'u4', competitionId: 'quiz-bee', name: 'Garcia, Ana L.', studentId: '22-3456-004', yearLevel: '2nd Year', program: 'BSCS', block: '01', facebookLink: 'https://facebook.com/anagarcia', email: 'ana.garcia@udd.edu.ph', submittedAt: ts(1, 2) },
    { uid: 'u5', competitionId: 'quiz-bee', name: 'Torres, Miguel R.', studentId: '20-7890-005', yearLevel: '4th Year', program: 'BSIT', block: '02', facebookLink: 'https://facebook.com/migueltorres', email: 'miguel.torres@udd.edu.ph', submittedAt: ts(0, 4) },
  ],
  'skills': [
    { uid: 'u6', competitionId: 'skills', name: 'Lim, Patricia C.', studentId: '22-2345-006', yearLevel: '2nd Year', program: 'BSIT', block: '05', facebookLink: 'https://facebook.com/patricialim', email: 'patricia.lim@udd.edu.ph', submittedAt: ts(1, 6) },
    { uid: 'u7', competitionId: 'skills', name: 'Ramos, Jose K.', studentId: '23-6789-007', yearLevel: '1st Year', program: 'BSCS', block: '01', facebookLink: 'https://facebook.com/joseramos', email: 'jose.ramos@udd.edu.ph', submittedAt: ts(1, 3) },
    { uid: 'u8', competitionId: 'skills', name: 'Cruz, Bianca T.', studentId: '21-0123-008', yearLevel: '3rd Year', program: 'BSIT', block: '04', facebookLink: 'https://facebook.com/biancacruz', email: 'bianca.cruz@cdd.edu.ph', submittedAt: ts(0, 2) },
  ],
  'web-design': [
    { uid: 'u9',  competitionId: 'web-design', name: 'Mendoza, Sophia R.', studentId: '22-4567-009', yearLevel: '2nd Year', program: 'BSIT', block: '01', facebookLink: 'https://facebook.com/sophiamendoza', email: 'sophia.mendoza@udd.edu.ph', submittedAt: ts(3, 1) },
    { uid: 'u10', competitionId: 'web-design', name: 'Aquino, Luis F.', studentId: '23-8901-010', yearLevel: '1st Year', program: 'BSIT', major: 'ITEM', block: '01', facebookLink: 'https://facebook.com/luisaquino', email: 'luis.aquino@udd.edu.ph', submittedAt: ts(2, 4) },
  ],
  'game-jam': [
    {
      uid: 'u11', competitionId: 'game-jam', teamName: 'Team Overclocked', totalMembers: 4,
      leader: { name: 'Villanueva, Kevin D.', studentId: '21-1234-011', yearLevel: '3rd Year', program: 'BSIT', block: '02', facebookLink: 'https://facebook.com/kevinvillanueva', email: 'kevin.villanueva@udd.edu.ph' },
      members: [
        { name: 'Castillo, Nina P.', studentId: '22-5678-012', yearLevel: '2nd Year', program: 'BSCS', block: '01', facebookLink: 'https://facebook.com/ninacastillo' },
        { name: 'Flores, Marco A.', studentId: '23-9012-013', yearLevel: '1st Year', program: 'BSIT', major: 'ITEN', block: '03', facebookLink: 'https://facebook.com/marcoflores' },
        { name: 'Bautista, Lea G.', studentId: '22-3456-014', yearLevel: '2nd Year', program: 'BSIT', block: '07', facebookLink: 'https://facebook.com/leabautista' },
      ],
      submittedAt: ts(1, 2),
    },
    {
      uid: 'u15', competitionId: 'game-jam', teamName: 'Pixel Pushers', totalMembers: 3,
      leader: { name: 'Navarro, Grace M.', studentId: '20-7890-015', yearLevel: '4th Year', program: 'BSIT', block: '01', facebookLink: 'https://facebook.com/gracenavarro', email: 'grace.navarro@udd.edu.ph' },
      members: [
        { name: 'Domingo, Raul C.', studentId: '21-2345-016', yearLevel: '3rd Year', program: 'BSIT', block: '05', facebookLink: 'https://facebook.com/rauldomingo' },
        { name: 'Pascual, Iris T.', studentId: '22-6789-017', yearLevel: '2nd Year', program: 'BSCS', block: '01', facebookLink: 'https://facebook.com/irispascual' },
      ],
      submittedAt: ts(0, 5),
    },
  ],
  'hackathon': [
    {
      uid: 'u18', competitionId: 'hackathon', teamName: 'ByteForce', totalMembers: 6,
      leader: { name: 'Rivera, Mark J.', studentId: '20-0123-018', yearLevel: '4th Year', program: 'BSIT', block: '03', facebookLink: 'https://facebook.com/markrivera', email: 'mark.rivera@udd.edu.ph' },
      members: [
        { name: 'Gonzalez, Trisha N.', studentId: '21-4567-019', yearLevel: '3rd Year', program: 'BSIT', block: '01', facebookLink: 'https://facebook.com/trishagonzalez' },
        { name: 'Herrera, Paolo S.', studentId: '22-8901-020', yearLevel: '2nd Year', program: 'BSCS', block: '01', facebookLink: 'https://facebook.com/paoloherrera' },
        { name: 'Tan, Michelle V.', studentId: '21-2345-021', yearLevel: '3rd Year', program: 'BSIT', block: '04', facebookLink: 'https://facebook.com/michelleetan' },
        { name: 'Soriano, Dan R.', studentId: '23-6789-022', yearLevel: '1st Year', program: 'BSIT', major: 'ITEW', block: '04', facebookLink: 'https://facebook.com/dansoriano' },
        { name: 'Medina, Claire A.', studentId: '22-0123-023', yearLevel: '2nd Year', program: 'BSIT', block: '08', facebookLink: 'https://facebook.com/clairemedina' },
      ],
      submittedAt: ts(2, 7),
    },
  ],
}
