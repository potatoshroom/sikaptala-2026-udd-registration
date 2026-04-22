/**
 * Generates a full name string from component parts.
 * Format: "Last Name, First Name M." or "Last Name, First Name" (no middle initial).
 */
export function buildFullName(lastName, firstName, middleName) {
  const mi = middleName?.trim()
  return `${lastName.trim()}, ${firstName.trim()}${mi ? ' ' + mi[0].toUpperCase() + '.' : ''}`
}

/**
 * Strips any Facebook URL prefix (https://www.facebook.com/, facebook.com/, etc.)
 * and returns just the username/path portion.
 */
export function extractFbUsername(input) {
  return input
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?facebook\.com\//i, '')
    .split('?')[0]
    .replace(/#.*$/, '')
    .replace(/\/$/, '')
}
