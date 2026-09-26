# Antaran — Independent Quality & Security Audit

> Third-party style code and quality review of the Antaran platform.
>
> **Audit date:** 2026-09-12
> **Scope:** Full repository — React 19 / Vite frontend, Azure Functions + Cosmos DB (serverless) backend, CI/CD, docs.
> **Method:** Full source read, `npm run lint` (clean), `npm run build` (passes), tracker/decision docs cross-checked against the code.
> **Remediation branch:** `fix/quality-audit-remediation`

This document is the durable record of the audit. Each finding lists its **decision** (Fixed / Deferred / Pending decision) and, where deferred, the reason and the trigger for revisiting it.

---

## Status summary

| Decision | Count | Findings |
|----------|-------|----------|
| **Fixed in this PR** | 17 | C1, C2 (rate limiting only), C4, H1, H2, H4, H5, H6, H8, M2, M3, M4, M5, M6, M7, L2, L3 |
| **Fixed in follow-up** | 2 | L1 (Pages removed, Azure canonical), M1 (116 unit tests, `npm test` CI gate) |
| **Deferred — agreed** | 6 | C3, H3, H7, M8, L4, L5 |
| **Pending owner decision** | 1 | C2 (CAPTCHA / WAF layer) |

---

## 🔴 Critical

### C1 — Booked slots were still shown as available
**Status: FIXED**

`getAvailableSlots()` in `api/src/index.js` never consulted the `slotReservations` container, so `GET /api/availability` returned already-booked slots to every visitor. Users filled the whole form and only then received *"That slot has just been requested by someone else."* Data integrity was protected by the reservation write (409), but the UX failed and booking activity was enumerable by probing.

**Fix:** availability now excludes reserved slot keys for the 60-day horizon via a bounded range query on `slotReservations` (`slotKey` is lexicographically sortable: `YYYY-MM-DD|HH:MM`). The reservation write remains as the concurrency guard. The booking form also refreshes availability after a successful submit so the taken slot disappears immediately.

**Residual (owned by H7):** reservations are never released — cancelled/no-show bookings keep the slot consumed until the lifecycle work lands.

### C2 — Unauthenticated booking endpoint could be abused
**Status: PARTIALLY FIXED (rate limiting) — CAPTCHA/WAF pending decision**

`POST /api/bookings` requires no sign-in, and each accepted request creates a real Google Calendar + Meet event and sends two Resend emails. Without throttling this is an abuse, cost, and spam vector.

**Fixed now:** in-process sliding-window rate limiting in the Functions app, keyed by client IP (`x-forwarded-for`), returning `429` with `Retry-After`:

| Endpoint | Limit |
|----------|-------|
| `POST /bookings` | 5 per 10 minutes per IP |
| `POST /payments/order` | 10 per 10 minutes per IP |
| `POST /payments/verify` | 20 per 10 minutes per IP |

**Known limitation:** the limiter is per Functions instance (in-memory), so it is best-effort under scale-out, and it resets on instance recycle. It stops casual abuse and scripted floods against a single instance; it is not a substitute for edge-level protection.

**Pending decision (owner):** stronger protection needs either a CAPTCHA on guest booking (rejected for now — conversion/regression risk) or an Azure Front Door / WAF rate-limit rule (adds infra cost, needs approval). Recommendation: keep the in-app limiter for now, revisit Front Door WAF when booking volume or abuse appears.

**Also flagged, not changed (needs an owner decision):** PHI exposure in third-party systems — the Google Calendar event title is `Antaran Psychiatric Consultation - {patient name}` and booking emails carry name/phone/email in plaintext. See the DPDP note in the Deferred section.

### C3 — Session recording (Clarity) + GA4 on mental-health pages without consent
**Status: DEFERRED (agreed) — privacy risk remains open**

`src/components/Analytics.jsx` loads GA4 **and Microsoft Clarity** on `/book` and `/assessment` — the pages where users type symptoms and answer PHQ-9 items, including the self-harm question. There is no cookie/consent mechanism anywhere in the app.

**Decision:** skipped for now at the owner's request.

**Impact of the deferral (recorded for the compliance file):**
- Clarity session replay of a psychiatric self-assessment is a high-sensitivity processing activity under the DPDP Act 2023 and likely needs explicit consent plus a documented purpose.
- Google's policies restrict sending health-related data to Analytics; assessment page paths and any free-text must not reach GA/Clarity.
- Note: the CSP added in H4 keeps Clarity working (Microsoft's documented CSP requires `'unsafe-inline'`), so no analytics regression was introduced by this PR.

**Trigger to revisit:** before public launch / before any marketing spend that increases traffic. Recommended minimum: consent gate, and exclude Clarity from `/assessment` and `/book`.

### C4 — Firebase Admin service-account private key inside the project directory
**Status: FIXED (moved out of the repository root into an ignored secrets folder)**

`antaran-c4ae2-firebase-adminsdk-fbsvc-b81ec62095.json` sat in the repository root. It was gitignored and **never committed** (verified with `git ls-files` and history search), but living inside the project directory made an accidental `git add -f` or tooling sweep a full-compromise event — that key grants complete Firebase Admin access.

**Fix:** the file was moved to `docs/secret-keys/`, and `docs/secret-keys/` is now gitignored. Verified ignored and absent from the index after the move.

**Recommendation (owner action):** this key should not live inside any project folder at all. Move it to a password manager or a secrets vault, and **rotate it** if there is any doubt about past exposure (for example if it was ever shared over chat or email). The backend already reads credentials from environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), so nothing in the repo needs the file.

---

## 🟠 High

### H1 — Signed-in booking silently failed unless an optional-looking checkbox was ticked
**Status: FIXED**

The backend requires account-storage consent for authenticated bookings (`if (principal && consentGiven !== true) → 400`), but the UI rendered that checkbox as an optional extra with no client-side enforcement. Signed-in patients submitted the whole form and then got *"Account storage consent is required."*

**Fix:** when signed in, the account-storage checkbox is labelled as required (asterisk + explicit wording), validated on the client before submit with an inline message, and the API error text was made actionable. Behaviour is unchanged server-side, so consent capture stays meaningful — a signed-in booking is stored, therefore storage consent is genuinely required.

### H2 — Success screen claimed emails/Meet links were sent even when they failed
**Status: FIXED**

`POST /api/bookings` returns `meetingStatus` and `notificationStatus`, which can be `failed` or `not_configured`. The form ignored the response body and always displayed *"Your booking details and meeting information have been sent to your email… The meeting link will be available to join 15 minutes before the consultation."*

**Fix:** the confirmation panel now renders from the actual response — it shows the Meet link and "add to calendar" action when `meetingStatus === 'created'`, states that the team will follow up with meeting details when it is not, and warns when the confirmation email could not be sent. This also aligns with decision **D-TECH-15** ("store a failed meeting-creation status without showing a Join button").

### H3 — Payments endpoints are half-built and exposed
**Status: DEFERRED (agreed) — blocked on Razorpay KYC**

`POST /payments/order` is anonymous and creates unlimited Razorpay orders; `POST /payments/verify` validates the signature but then does nothing (no booking linkage, no persistence) while returning `{ verified: true }`; the webhook verifies and discards. The amount is hardcoded to ₹5 (`RAZORPAY_TEST_AMOUNT_PAISE`) with `notes.environment: 'test'`.

**Decision:** deferred until Razorpay provider KYC is confirmed. Mitigation applied in this PR: rate limiting on `/payments/order` and `/payments/verify` (see C2). Payments remain disabled unless `PAYMENTS_ENABLED=true`.

**Before enabling payments, this must be completed:** authenticate order creation, bind order ↔ booking, persist payment state, verify amount/currency server-side against the booking, make the webhook idempotent and state-changing, and replace the test amount.

### H4 — No security headers
**Status: FIXED**

`public/staticwebapp.config.json` had no `globalHeaders`: no CSP, no framing protection, no HSTS, no referrer or permissions policy.

**Fix:** added `globalHeaders`:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | see below |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, usb disabled |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` (Google sign-in opens a popup) |

CSP allows only the origins the app actually uses: self, Firebase Auth (`identitytoolkit`, `securetoken`, `firebaseinstallations`, `*.firebaseapp.com`, `accounts.google.com`), Google Analytics, Clarity (`*.clarity.ms`, `c.bing.com`, `scripts.clarity.ms`), Razorpay, plus `blob:`/`data:` for the react-pdf worker and fonts. `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`.

**Deliberate trade-off — `'unsafe-inline'` is present in `script-src` and `style-src`:**
- `style-src 'unsafe-inline'` is unavoidable: React inline `style` attributes and Mantine inject styles at runtime.
- `script-src 'unsafe-inline'` is required by Microsoft Clarity per [Microsoft's own CSP guidance](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-csp).

This weakens XSS protection compared to a nonce/hash policy. **Tightening path:** once Clarity is removed or consent-gated (C3), `script-src 'unsafe-inline'` can be dropped — the SPA redirect script was already moved out of `index.html` into the bundle in this PR, so no other inline script remains.

**Verification:** headers were validated by serving the production build through a local static server that applies the same header set, then loading the public routes in headless Chromium (Playwright) and asserting zero CSP violation errors.

### H5 — Prescriptions had zero audit trail
**Status: FIXED (no new infrastructure, negligible cost)**

`ClinicianPage` generated official-looking prescription PDFs entirely in the browser, with the UI stating the document "is not saved to Antaran". No record existed of what was prescribed, to whom, by whom, or when. Telemedicine record-keeping expectations make this a compliance gap, and there was no defence in a dispute.

**Fix:** `POST /api/prescriptions` now stores an audit record in Cosmos DB, restricted to verified clinicians/admins:

- patient name + age, prescription date, medicine list, clinician identity (Firebase UID + email), timestamp, record id.
- Container `prescriptions` in the existing database. Per **D-TECH-13** the account is **Cosmos DB serverless**, so an extra container adds no fixed cost — billing is per RU, and this is one small write per prescription (single-digit RUs). No new Azure resource, no new service.
- **Fail-open by design:** if the audit write fails, the clinician still gets the PDF and sees a non-blocking warning, so clinical workflow is never blocked by a logging problem.
- The UI now states that a record of the prescription is stored for clinical record-keeping.

**Open legal/clinical question (proposed, needs owner + legal sign-off):** the consent wording covering storage of prescription records, and retention period. Logged as `Q-LEGAL-06` in `QUESTIONS_AND_DECISIONS.md`. Digital signature on the PDF remains out of scope (tracked under M8 in the project tracker).

### H6 — Meeting duration did not match slot duration
**Status: FIXED**

Slots are generated on a 30-minute grid (`durationMinutes: 30`), but `getMeetingTimes()` hardcoded **60-minute** Calendar/Meet events. Two patients booking adjacent 30-minute slots received overlapping one-hour meetings — the clinician's calendar would double-book every hour.

**Fix:** meeting duration is now derived from `availability.durationMinutes`, so the calendar event always matches the slot grid. Note on **D-CLIN-05** (flexible 30–60 minute sessions): if longer sessions are wanted, raise the availability `durationMinutes` — the slot grid and meeting length then stay consistent. Extending meetings beyond the slot grid would reintroduce the overlap.

### H7 — No booking lifecycle
**Status: DEFERRED (agreed) — larger scope**

Missing: admin/clinician view of all bookings, confirm/reject, patient cancellation, slot release on cancellation, and rescheduling. Today operations run entirely off Resend notification emails, and slots are permanently consumed once reserved.

**Decision:** deferred as a separate body of work (project tracker M4/M10).

**Interim operational note:** a slot can currently be freed manually by adding it to *Blocked individual slots* in the admin availability editor — this hides it from patients but does **not** release the reservation.

### H8 — Retries were blamed on "someone else"
**Status: FIXED (simple idempotency)**

After a transient failure following the reservation write — or a double-click — the patient's *own* reservation blocked resubmission with *"That slot has just been requested by someone else."* Guests had no way to recover or look up their booking.

**Fix:** the booking form generates an idempotency key per attempt (reused across retries, reset after success) and stores it on the reservation together with the user id. On a reservation conflict the API now checks ownership:

- same idempotency key, or same signed-in user → returns the **existing booking** with an explanatory message instead of an error (safe to retry, no duplicate reservations, Meet events, or emails);
- otherwise → the existing 409 "someone else" response.

Full guest booking lookup (booking reference + email link) remains part of H7.

---

## 🟡 Medium

### M1 — Zero automated tests
**Status: FIXED**

116 unit tests added across three test files, with a `npm test` script and CI gate (`ci.yml`). Covers:

- **Client-side scoring** (`src/utils/assessmentScoring.test.js`): PHQ-9/GAD-7 severity boundaries, suicidal ideation flag, `isComplete`, edge cases.
- **Server-side scoring** (`api/src/scoring.test.js`): Same boundary tests, strict input validation (non-array, wrong length, out-of-range, non-integer → `null`), cross-checks with client scoring to prevent drift.
- **Validation and signature** (`api/src/validation.test.js`): `verifySignature` (valid/invalid HMAC, timing-safe length check), `validateBooking` (age limits, required fields, truncation, sanitization), `cleanText`, `cleanPayment`.

Scoring and validation functions were extracted into `api/src/scoring.js` and `api/src/validation.js` (no behavior change, same imports in `api/src/index.js`). `vitest.config.unit.js` provides a separate Node-based test config alongside the existing Storybook browser test config.

### M2 — Internal "verify before launch" note was shown to patients in crisis
**Status: FIXED**

`CrisisBanner.jsx` rendered *"Please verify these contact details before launch; helpline numbers can change."* — inside the banner shown to users who answered yes to the PHQ-9 self-harm item. An internal TODO on the highest-risk screen of the product.

**Fix:** note removed. Helpline numbers reviewed: **112** (national emergency), **AASRA +91-22-27546669** (24×7), **iCall +91-9152987821** (Mon–Sat, 10:00–20:00). Recommended addition for clinical review (owner/clinician decision, not added unilaterally): **Tele-MANAS 14416 / 1800-599-0019**, the Government of India 24×7 mental-health helpline. Logged as `Q-CLIN-09`.

**Reminder:** M9 (safety & emergency workflows — escalation, referral directory, "teleconsult not appropriate" path) is still not started. The banner is decision-support only and must never replace clinician escalation.

### M3 — No SPA 404 route
**Status: FIXED**

`App.jsx` had no catch-all route, so unknown client-side URLs rendered an empty layout with header and footer. Added a `NotFoundPage` on `path="*"` with a route back to the home page, marked `noindex`.

### M4 — 1.7 MB main bundle; PDF library shipped to every visitor
**Status: FIXED (code splitting)**

The main JS chunk was 1.7 MB (595 KB gzip) because `@react-pdf/renderer`, imported by the clinician workspace, was bundled into the entry chunk that every public visitor downloads.

**Fix:** `/admin` and `/clinician/prescriptions` are now lazy-loaded route chunks (with a Suspense fallback), and the prescription workspace embedded in the admin page is lazy-loaded too. Result: react-pdf and the workspace code are no longer in the entry chunk — see the before/after table in the PR description.

**Follow-up (FIXED):** image optimisation. `consultation-hero.png` (1.57 MB) and `dr medha profile.png` (595 KB) were converted to optimized JPEG format (`consultation-hero.jpg`, 230KB and `dr-medha-profile.jpg`, 106KB), materially improving LCP.

### M5 — Unanchored name validation regex
**Status: FIXED**

`BookingForm.jsx` used `/[\p{L}\s.'-]+/u.test(trimmed)`, which only checks that the string *contains* a valid character — `"Rahul123$$$"` passed. Anchored to `/^[\p{L}\s.'-]+$/u`. The backend already truncates and stores the value; this is a client-side quality fix (server-side name validation remains lenient by design to support Indian name formats).

### M6 — Two sources of truth for admin/clinician roles
**Status: FIXED**

`src/constants.js` hardcoded `adminEmails`, and `Layout.jsx` decided which navigation to show from that list, while the backend enforced roles from the `ADMIN_EMAILS` / `CLINICIAN_EMAILS` environment variables. The navigation would silently drift from real enforcement.

**Fix:** `GET /api/me` now returns `roles: ['admin' | 'clinician']` computed server-side (including verified providers from the `providers` container), and `AuthContext` exposes those roles; the header renders from them. The MSW mock handlers mirror the same contract so `npm run dev:mock` behaves identically. `constants.js` keeps an email list only for the mock-mode developer toolbar.

Note: role checks were always enforced server-side — this was a correctness/consistency issue in the UI, not a privilege-escalation hole.

### M7 — No privacy policy or terms, despite consent checkboxes
**Status: FIXED as drafts — legal review required before launch**

Consent checkboxes referencing data storage were live with no privacy notice anywhere on the site. Added `/privacy` and `/terms` pages, linked from the footer, plus route metadata and sitemap entries.

**These are engineering drafts, not legal documents.** They accurately describe what the code does today (data collected, purposes, processors, retention, 18+ only, user rights under the DPDP Act 2023) and clearly mark every item that needs legal input — grievance officer name and contact, retention periods, and final consent wording. Both pages carry a visible *"Draft — pending legal review"* banner. Tracked as `Q-LEGAL-02` / `Q-LEGAL-05`.

**Owner action:** have counsel review and approve before these pages are treated as the published notice, and remove the draft banner.

### M8 — No account deletion or data export
**Status: DEFERRED (agreed)**

No right-to-erasure or data-portability flow in the account portal. DPDP Act gap. Deferred as larger scope (needs deletion across `profiles`, `assessments`, `bookingRequests`, `consents`, plus Firebase Auth user deletion and a retention policy — `Q-LEGAL-03`).

---

## 🔵 Low / hygiene

### L1 — Package name and two live deploy targets
**Status: FIXED**

`package.json` was still named `dr-medha-consultation-site` (renamed to `antaran-platform` in the original PR). The owner confirmed Azure (`antaran.online`) as the canonical production host. The GitHub Pages workflow (`pages.yml`), the `homepage` field, `predeploy`/`deploy` scripts, and the `gh-pages` dependency have been removed. The `VITE_BASE_URL` override in `vite.config.js` was simplified to a fixed `base: '/'`.

### L2 — No CI checks on pull requests
**Status: FIXED**

Lint and build ran only inside the deploy workflows; nothing validated a PR, even though `AGENTS.md` requires both before opening one. Added `.github/workflows/ci.yml` running `npm ci`, `npm run lint`, and `npm run build` on every pull request and push to `main` (Node 22, npm cache). Recommend marking it a required check in branch protection.

### L3 — Repository clutter
**Status: FIXED**

Removed `debug-storybook.log` (19 KB log) and `.npm-cache/` from the project root. Both were already gitignored, so this is a working-tree cleanup only — no history change.

### L4 — All Azure Functions use `authLevel: 'anonymous'` with hand-rolled auth
**Status: DEFERRED**

Workable (every handler calls `getPrincipal`/`requirePrincipal` and roles are enforced server-side), but a future function could forget the check. Deferred; when picked up, add a shared `requireRole()` guard plus a test asserting every route enforces auth.

### L5 — No PropTypes or TypeScript
**Status: DEFERRED (owner will migrate the API to TypeScript later)**

Shared components take props with no runtime or static type checking. A typed API would have caught H1-class contract mismatches at build time. Deferred — the Functions app was written in JavaScript by accident and a TypeScript migration is planned separately.

---

## ✅ What is genuinely good (keep doing this)

- Server-side Firebase ID-token verification with **server-enforced** role checks, not UI-only hiding.
- Consent versioning (`booking-contact-v1`, `account-storage-v1`, `assessment-storage-v1`) recorded per user — strong DPDP groundwork.
- Parameterised Cosmos queries throughout (no injection surface); `timingSafeEqual` for webhook signature comparison; correct Razorpay HMAC verification.
- Clinical guardrails present and consistent: "not a diagnosis" messaging, crisis banner, PHQ-9 item-9 risk flag computed on both client and server.
- Honest, accurate project tracker — module claims match the code, which is rare and valuable.
- Disciplined workflow: PR-only merges, no direct pushes to `main`, manual production deploy gate, MSW mock mode for offline development, backend secrets via environment variables.
- Good SEO hygiene: per-route metadata, canonical handling, `noindex` on account/admin/clinician routes, sitemap and robots.

---

## Recommended next steps (priority order)

1. **C3** — consent gate for analytics; drop Clarity from `/assessment` and `/book`. Highest remaining privacy exposure.
2. **H3** — finish or remove payments once Razorpay KYC clears.
3. **H7** — booking lifecycle (admin booking list, confirm/cancel, slot release, patient cancellation).
4. **M1** — unit tests for scoring, signature verification, booking validation; add `npm test` and gate CI on it.
5. **M8** — account deletion / data export (DPDP rights).
6. **L1** — pick the canonical host and retire the other deploy path.

8. **M7** — legal review of the privacy policy and terms drafts.
9. **C4 follow-up** — move the Firebase key into a vault and rotate it.
