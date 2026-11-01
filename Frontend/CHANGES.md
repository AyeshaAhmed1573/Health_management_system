# Frontend changes (to match the backend changes)

## Bugs fixed that the new backend would otherwise have exposed
| Problem | Fix |
|---|---|
| Token stored as `token_<role>` but many files read `localStorage.token` (always empty) - worked only because profile/report routes used to be public | `src/lib/session.js` is the single source; `api.js`, `ReportUpload`, `QuickActionUploadReport`, `chatbotService` use it |
| Relative `fetch('/api/...')` calls (profiles, reports) hit the Vite server (no proxy) and carried no token | `installFetchAuth()` (called in `main.jsx`) sends them to the API and adds the Bearer token |
| `hooks/use-auth.js` asked `/auth/me` with cookies -> navbar always "logged out" | now a thin adapter over `AuthProvider` |
| `authContext.register` referenced undefined `headers`/`body` (every signup threw) | rewritten: JSON for patients, multipart for doctor/lab/pharmacy with documents |
| Lab role was `lab` in the UI but `laboratory` in the backend (login, signup, dashboard route) | aligned to `laboratory` |
| AdminSignup wrote legacy `token`/`user` keys | uses `saveSession` |
| Admin dashboard document links / report "View file" pointed at now-private `/uploads/...` | open through authenticated fetch (`openProtectedFile`) |

## Backend changes reflected in the UI
- **2FA login**: `AuthProvider.login` handles `requiresTwoFactor` and shows `TwoFactorDialog`; every login page works unchanged.
- **Dependent consent**: Profiles form shows a required consent checkbox for non-self profiles (`consentConfirmed`).
- **Forgot / reset password**: `/forgot-password`, `/reset-password` + link on the five login pages.
- **Security page** `/security`: enable/disable 2FA, change password.
- **Appointments**: Doctors page "Book Appointment" opens `BookAppointmentDialog` (profile, in-person/online, date, live free slots); patient list `/appointments` (cancel, join video, pay); doctor `/doctor/appointments` (confirm/decline/complete/no-show, notes).
- **Prescriptions**: doctor writes them (with medication reminder times); patient `/prescriptions` shares with a verified pharmacy after confirming consent; pharmacy sees its inbox at the same URL.
- **Payments**: `PayButton` (amount comes from the server) and `/payments` history.

## Notes
- `PayButton` auto-confirms only with the backend's `mock` provider; with a real gateway it should redirect to checkout (implement in `PayButton` + `paymentService.js`).
- Patient dashboard (`pages/Dashboard.jsx`, 5000+ lines) was left structurally untouched; new screens are separate routes linked from the navbar.
- Verified: `vite build` succeeds and the changed files pass a no-undef lint. Not run against a live backend/database.
