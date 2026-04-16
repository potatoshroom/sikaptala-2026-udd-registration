# SIKAPTALA 2026 — UDD Internal Registration Website

## Project Overview
Internal student registration site for Universidad de Dagupan (UDD) - School of IT Education.
Students apply to represent UDD in SIKAPTALA 2026, a computing competition hosted by DLSU-D.
Hosted on GitHub Pages. Data stored in Firebase Firestore.
Auth: Google Sign-In restricted to @udd.edu.ph and @cdd.edu.ph accounts.

## Competitions
| Competition | Dates | Platform | Brand Color |
|---|---|---|---|
| CS & IT Quiz Bee | May 11 & 13 | Slido | Yellow (#F5C518) |
| CS & IT Skills Competition | May 14–15 | HackerRank | Purple (#7C3AED) |
| Web Design Competition | May 11 | Figma | Orange/Red (#E85D04) |
| Cloud Research Competition | May 12–15 | MS Teams | Teal (#0891B2) |
| Game Jam Competition | May 11–14 | itch.io | Green (#16A34A) |
| Hackathon Competition | May 11–14 | MS Teams | Red (#DC2626) |

Per-competition eligibility and team size limits are TBD — competition guidelines pending.
Update `src/data/competitions.js` when guidelines arrive.

## Stack
- React + Vite (plain JS, no TypeScript)
- Firebase Auth (Google provider, @udd.edu.ph and @cdd.edu.ph only)
- Firebase Firestore
- GitHub Pages (deploy via GitHub Actions — see `.github/workflows/deploy.yml`)

## Security Model
- Auth required: only @udd.edu.ph and @cdd.edu.ph Google accounts can sign in
- Domain check is enforced both client-side (after signInWithPopup) and server-side (Firestore rules)
- Firestore rules: allow `create` only — no reads, updates, or deletes from client
- One registration per student, keyed by studentId (duplicate prevention in rules)
- Firebase App Check (reCAPTCHA v3) should be added post-MVP
- Firebase config in `.env.local` (gitignored); stored as GitHub Actions Secrets for CI

## Firebase Config Environment Variables
All must be prefixed with `VITE_` so Vite injects them at build time:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Key Files
- `src/data/competitions.js` — competition list, colors, dates, platforms (update for guidelines)
- `src/firebase.js` — Firebase app init, exports `auth` and `db`
- `firestore.rules` — deploy with `firebase deploy --only firestore:rules`
- `vite.config.js` — `base` is set to `/sikaptala-2026-udd-registration/` for GitHub Pages

## Notes
- Admin reads data directly via Firebase Console (no admin UI in v1)
- `dist/` is built by CI and deployed to `gh-pages` branch — do not commit `dist/` manually
