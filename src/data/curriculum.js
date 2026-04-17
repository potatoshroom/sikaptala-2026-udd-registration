export const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
export const PROGRAMS = ['BSIT', 'BSCS']

// Block counts per year/program. 1st year BSIT has majors instead of a flat count.
const CURRICULUM = {
  '1st Year': {
    BSIT: { majors: { ITEW: 5, ITEM: 2, ITEN: 3 } },
    BSCS: { blocks: 1 },
  },
  '2nd Year': {
    BSIT: { blocks: 9 },
    BSCS: { blocks: 1 },
  },
  '3rd Year': {
    BSIT: { blocks: 6 },
    BSCS: { blocks: 1 },
  },
  '4th Year': {
    BSIT: { blocks: 4 },
    BSCS: { blocks: 1 },
  },
}

/** Returns the list of majors for a year+program combo, or null if none. */
export function getMajors(yearLevel, program) {
  const prog = CURRICULUM[yearLevel]?.[program]
  return prog?.majors ? Object.keys(prog.majors) : null
}

/** Returns the list of block options (e.g. ['01','02',...]) for the given combo. */
export function getBlocks(yearLevel, program, major) {
  const prog = CURRICULUM[yearLevel]?.[program]
  if (!prog) return []
  const count = prog.majors ? (prog.majors[major] ?? 0) : prog.blocks
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'))
}
