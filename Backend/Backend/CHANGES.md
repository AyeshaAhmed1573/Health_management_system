# Backend changes

## Errors fixed
| # | Problem | Fix |
|---|---------|-----|
| 1 | `Services/chatSessionService.js` imported `../models/...` (works on Windows, crashes on Linux/hosting) | `../Models/` |
| 2 | `Routes/Auth.routes.js` used undefined `uploadDoctorDocuments` -> every `/api/auth/register` threw | defined in `upload.middleware.js`, imported, upload errors handled |
| 3 | `Chat.controller.js` duplicate `message` key in a response | removed |
| 4 | `Auth.controller` approve/reject wrote `approved` / `rejectionReason`, which the models don't have (they use `verified` / `verificationNote`) | aligned with models |
| 5 | Doctor signup passed `hospital`/`clinic` strings into object fields; placeholder license number could collide | converted to `{name}`, unique placeholder |
| 6 | Emails matched case-sensitively on login/register | normalised |
| 7 | Two identical `/compare/:profileId/:x` routes - the test-type one was unreachable | one route, dispatches on category vs test type |
| 8 | `index.js` printed the whole `.env` (all secrets) to the console, ignored `PORT` | removed, `PORT` honoured |
| 9 | `.env` with a UTF-8 BOM loaded the first key as `\uFEFFPORT`; `.env.example` used `MONGODB_URI` but code reads `MONGO_URL` | BOM-safe loader, example fixed |
| 10 | Hard-coded fallback JWT secrets (`'secret'`) | removed; missing secret fails loudly |
| 11 | OTP used `Math.random`, mail transport had `rejectUnauthorized:false` | `crypto.randomInt`, TLS verification on |

## Security holes closed (SRS 5.1)
- `/api/patients` and `/api/profiles` were **public** and returned names/emails/phones; now authenticated + ownership-checked.
- Reports, health readings, notifications: no ownership checks (any logged-in user could read/delete anyone's by id). Now owner / admin / treating-doctor only.
- `public/uploads` (reports, prescriptions, doctor CNIC/licences) was served statically to the world; now only `logos` and `products` are.
- Added helmet, central error handler, auth rate limiter, `.gitignore` for uploads.

## New SRS features
- **Appointments** `/api/appointments` - per-profile booking, availability, double-booking prevention (unique partial index), confirm/cancel/complete, consultation notes, auto video link (Jitsi) for online consults.
- **Prescriptions** `/api/prescriptions` - verified doctors issue; patient shares with a verified partner pharmacy with explicit consent; pharmacy inbox.
- **Payments** `/api/payments` - Transaction history, amount computed server-side, signed webhook, refunds, gateway adapter (`Services/paymentService.js`; `mock` provider for dev, blocked in production).
- **Password reset / change password, optional 2FA** (email code) under `/api/auth`.
- **Reminders** - appointment (24h + 1h) and medication reminders via `Services/reminderService.js`.
- **Dependent consent** - non-self profiles require `consentConfirmed: true`.
- **Audit logging** extended (login, profile/report access, appointments, prescriptions, payments).

## Not done / needs you
- Rotate every secret in the `.env` you uploaded (Mongo, Cloudinary, Gemini, Gmail app password, JWT) - assume exposed.
- A real payment gateway (JazzCash/Easypaisa/Stripe) must be implemented in `paymentService.js`.
- Pharmacy/lab *external* API integrations, wearable/AI risk prediction etc. (SRS section 9) are out of scope.
- Frontend needs matching screens for the new endpoints.
