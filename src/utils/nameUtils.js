/**
 * Generates a full name string from component parts.
 * Format: "Last Name, First Name M." or "Last Name, First Name" (no middle initial).
 */
export function buildFullName(lastName, firstName, middleName) {
  const mi = middleName?.trim()
  return `${lastName.trim()}, ${firstName.trim()}${mi ? ' ' + mi[0].toUpperCase() + '.' : ''}`
}
