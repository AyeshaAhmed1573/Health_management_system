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

## Added while updating the frontend
- `GET /api/admin/files/:folder/:filename` (admin only): private documents (licences, doctor IDs) are no longer public static files.
- `GET /api/reports/:reportId/file`: access-checked download for locally stored report files (Cloudinary reports return their URL).
- Signup documents are now actually saved (disk, `public/uploads/doctor-documents`) and stored on the profile; `Doctor` model gained the missing `documents` field. Nested multipart fields (`hospital`, `clinic`, `address`, `operatingHours`) are parsed from JSON text.

## Pharmacy / lab storefronts
- `Middleware/profileVendorBridge.js`: verified pharmacies and laboratories get a Vendor record automatically (on first dashboard use) and can use the vendor routes (products, lab tests, orders, bookings, dashboard stats) with their normal login.
- Public `GET /api/marketplace/pharmacies/:pharmacyId/products` and `GET /api/marketplace/laboratories/:labId/tests` feed each provider's profile on the patient side.
- `LabTest.code` is now sparse-unique (a second test without a code no longer hits a duplicate-key error).

## AI report analysis, appointment slots, Cloudinary
- `Services/geminiClient.js`: Gemini calls with model fallback (GEMINI_MODEL -> gemini-2.5-flash -> gemini-2.0-flash), timeouts, loose JSON parsing.
- `Services/reportFileAnalysis.js`: Gemini reads the actual PDF/image and returns values, highlights, summary, status, recommendations; also builds the dashboard "AI Health Insights".
- Uploaded reports (multipart and JSON paths) and "re-analyze" now run this analysis. `GET /api/reports/insights/:profileId` powers the dashboard panel.
- `POST /api/reports/upload-file`: backend-signed Cloudinary upload (the browser preset flow could never work). `checkCloudinary()` logs at startup whether the credentials are accepted.
- Local report files in nested folders now open correctly through `/api/reports/:id/file`.
- Doctors with no hours configured get Mon-Sat 09:00-17:00 (30 min) by default; new doctors are saved with it; `GET/PUT /api/appointments/doctor/availability` lets them set their own.
