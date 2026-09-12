# Antaran Platform — Project Tracker

> Single source of truth for progress. Update this file after every significant decision, design, or implementation.
>
> Pair this with:
> - `ARCHITECTURE_PLAN.md` — technical design
> - `QUESTIONS_AND_DECISIONS.md` — open questions and decision log
> - `REGULATORY_NOTES.md` — compliance checklist
> - `DESIGN_SYSTEM.md` — visual language and tokens

## Legend

| Status | Meaning |
|--------|---------|
| Not Started | No work done. |
| Planned | Requirements/architecture known, waiting for ready signal. |
| In Progress | Being actively worked on. |
| Ready for Dev | Decisions made; can be picked up by any agent. |
| Blocked | Waiting for an external answer, vendor, or approval. |
| Done | Implemented, reviewed, and verified (build/tests passing). |
| Deferred | Out of MVP scope; revisit in Phase 2. |

Statuses describe the scope currently implemented in this repository. A module can be
`Done` for its agreed MVP slice while follow-up hardening, policy decisions, or a
separate module remain open.

---

## Current snapshot

- **Project name:** Antaran (working)
- **Audience:** Adults 18+, Pan-India
- **MVP clinician model:** Founder-only, architected for multi-clinician expansion
- **Current code:** Public Vite + React + Tailwind site with optional patient account portal, assessment flow, booking flow, admin workspace, clinician prescription workspace, and Azure Functions API
- **Backend:** Azure Functions API implements Cosmos-backed profiles, consent records, assessments, availability, slot reservations, and booking requests; environment configuration is deployment-owned
- **Auth:** Optional Google sign-in through Firebase Authentication with server-side token verification and role-gated admin/clinician routes; public routes remain ungated
- **Booking:** Production booking slice is implemented: shared Asia/Kolkata availability, blocked dates/slots, one-booking-per-slot reservation, guest and signed-in requests, Google Calendar/Meet creation, owner notification, and timed Join access
- **Payments/video:** Razorpay test-mode backend scaffolding exists but is disabled; Google Meet is used for the current consultation-link flow, while provider-based video, payment completion, invoices, and payouts remain future work
- **Design system:** Tokens are seeded and wired; legacy landing-page aliases remain and final brand/design decisions are still open
- **Public education:** Symptoms, resources, and consultation-preparation pages are implemented as additive static routes; clinical copy remains subject to review

---

## Module tracker

| ID | Module | Phase | Status | Key Deliverables | Blockers / Open Questions |
|----|--------|-------|--------|------------------|---------------------------|
| M0 | Foundation & Design System | MVP | In Progress | `AGENTS.md`, design tokens, Tailwind wiring, folder structure, repo conventions, CI lint/build | DS-01 (final color values), DS-02 (dark mode), DS-03 (motion preferences); legacy aliases still need migration |
| M1 | Identity, Auth & MFA | MVP | In Progress | Optional Firebase Google sign-in, account route, Firebase-token API verification, session-aware UI, and role-gated admin/clinician access; clinician/admin MFA is not implemented | Q-TECH-07 (hosting/data region); MFA remains a launch-hardening item |
| M2 | Patient Portal & Onboarding | MVP | Done | Optional profile, age validation, consent capture, booking history, saved assessment history, and account dashboard are implemented; document upload and emergency contact are explicitly deferred | Q-LEGAL-02 (final consent wording), Q-LEGAL-05 (DPDP wording/withdrawal) remain compliance follow-up |
| M3 | Clinical Intake & Assessments | MVP | Done | PHQ-9/GAD-7 forms, scoring, severity labels, crisis banner, no-diagnosis guardrail, and optional consented score/response storage are implemented | Q-CLIN-03 and Q-CLIN-04 remain clinician-owned follow-up for broader intake and escalation policy |
| M4 | Booking, Calendar & Availability | MVP | Done | Guest and signed-in booking requests, Cosmos persistence, Resend owner notification, immediate Google Meet event/link creation, shared admin-managed 30-minute recurring availability, blocked dates/slots, one-booking-per-slot reservation, timezone handling, and timed Join access are implemented | Pricing, refund policy, and follow-up rules remain business/clinical policy work; appointment lifecycle enhancements can be added separately |
| M5 | Payments, Invoicing & Payouts | MVP | Planned | Razorpay integration, UPI/cards/net banking, payment confirmation, invoices/receipts, refunds, cancellation handling, commission calculation, clinician payout ledger | Q-BIZ-04 (refund policy), Q-BIZ-05 (commission), Q-BIZ-06 (GST), Q-TECH-04 (gateway) |
| M6 | Video Consultation | MVP | In Progress | Current Google Meet link creation, appointment linking, and timed Join flow are implemented; provider-based waiting room, fallback audio/telephone, and recording workflow are not implemented | Q-TECH-03 (video provider), Q-TECH-09 (recording policy) |
| M7 | Clinician Dashboard & EHR | MVP | Planned | Secure login, profile/credentials, calendar, appointment list, patient history, clinical notes (SOAP), diagnosis, risk assessment, questionnaire results, longitudinal history, earnings view | Q-CLIN-02 (credential checklist), Q-TECH-02 (MFA); provider onboarding now creates pending records but the clinician dashboard remains future work |
| M8 | Prescription & Documentation | MVP | In Progress | Clinician/admin-gated local prescription PDF generation with patient/medicine validation is implemented; prescription persistence, digital signature/approval, consultation summary, follow-up scheduling, and document management are not | Q-CLIN-06 (controlled substances), Q-LEGAL-02 (consent), Q-CLIN-07 (follow-up window) |
| M9 | Safety & Emergency Workflows | MVP | Planned | Risk screening, crisis banners, emergency referral directory, escalation log, "teleconsult not appropriate" path, referral documentation | Q-CLIN-04 (thresholds), Q-CLIN-05 (referral directory), D-CLIN-04 (no diagnosis) |
| M10 | Admin Panel & Operations | MVP | In Progress | Role-gated admin workspace with shared availability management, blocked dates/slots, prescription workspace, and provider onboarding/review is implemented; patient management, appointment ops, payment/refund ops, support tickets, analytics, and audit viewer are not | Q-CLIN-02 (credential checklist), Q-LEGAL-04 (grievance officer), Q-BIZ-05 (payout rules) |
| M11 | Security, Privacy & Compliance | MVP | Planned | Encryption at rest/transit, RBAC, audit logging, secure document storage, backups, data-retention/deletion, breach-response runbook, security headers, pen-test plan | Q-LEGAL-03 (retention), Q-LEGAL-05 (DPDP), Q-TECH-07 (data localization), Q-TECH-08 (backup targets) |
| M12 | DevOps, Infra & Observability | MVP | In Progress | CI/CD (GitHub Actions → Azure Static Web Apps), Azure Functions deployment, environment-secret wiring, and local MSW development mode are implemented; managed backups, structured monitoring, alerting, uptime monitoring, and staging remain | Q-TECH-07 (cloud region: Static Web Apps hosted in East Asia; custom domain + CDN), Q-TECH-08 (RTO/RPO) |
| M13 | Launch, QA & Soft Rollout | MVP | Planned | QA plan, end-to-end tests, accessibility audit, security review, soft launch with founder, feedback loop, bug triage | Depends on M0-M12 |

---

## Phase 2 / deferred modules

| ID | Module | Status | Notes |
|----|--------|--------|-------|
| P2-1 | Multi-clinician marketplace | Deferred | Search, public profiles, ratings, and discovery remain deferred. Admin-managed provider onboarding is MVP and is tracked under M10. |
| P2-2 | Therapy packages & subscriptions | Deferred | Bundled sessions, recurring billing |
| P2-3 | Mobile apps (iOS/Android) | Deferred | React Native or Flutter |
| P2-4 | Additional validated scales | Deferred | Bipolar, ADHD, sleep, substance-use screens |
| P2-5 | Insurance / EAP integration | Deferred | Claims, corporate dashboards |
| P2-6 | ABHA / ABDM integration | Deferred | Health ID linking, longitudinal records |
| P2-7 | Analytics & business intelligence | Deferred | Advanced cohort reports, BI dashboards |
| P2-8 | Regional language support | Deferred | Hindi and other Indian languages |

---

## Milestones

| Milestone | Target modules | Goal | Status |
|-----------|----------------|------|--------|
| M0: Foundation | M0 | Repo is organized, agents can onboard, design tokens wired | In Progress |
| M1: Core identity & patient onboarding | M1-M3 | A patient can sign in optionally, save a profile, consent, complete PHQ-9/GAD-7, and view account history | Done for current scope; uploads and emergency contact are deferred |
| M2: Booking & payments | M4-M5 | A patient can request a reserved slot and receive booking/Meet confirmation; payment and invoicing remain disabled | In Progress |
| M3: Consultation experience | M6-M8 | Patient can access the timed Google Meet link and an authorized clinician can generate a prescription PDF | In Progress; clinical notes and persisted documentation remain |
| M4: Safety & operations | M9-M11 | Assessment safety messaging and basic admin availability controls exist | Not Started; formal safety escalation, operations, and compliance controls remain |
| M5: Launch readiness | M12-M13 | Production deployment, QA, soft launch | Not Started |

---

## Active blockers

| ID | What is blocked | Question / dependency | Owner |
|----|-----------------|----------------------|-------|
| B-01 | Production environment configuration | Confirm Cosmos DB, Firebase token verification, Resend, Google Calendar, and deployment secrets in each environment | Tech / Admin |
| B-02 | Pricing & payout logic | Required to build booking, payment, and clinician earnings modules | Admin / Clinician |
| B-03 | Consent / legal wording | Required to build onboarding and data-handling flows | Legal |
| B-04 | Emergency referral directory | Required to build safety workflows | Clinician |

---

## Change log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-15 | Initial tracker created with all MVP modules | Agent |
| 2026-08-15 | M0 marked In Progress; design tokens seeded | Agent |
| 2026-08-15 | M3 marked In Progress; PHQ-9/GAD-7 UI/scoring engine built | Agent |
| 2026-08-17 | Deployed landing page to Azure Static Web Apps Free tier; custom domain `antaran.online` configured with HTTPS; GitHub Actions CI/CD workflow added | Agent |
| 2026-08-17 | M12 marked In Progress; initial CI/CD pipeline established | Agent |
| 2026-08-18 | Added Antaran favicon, social preview image, canonical metadata, Open Graph/Twitter tags, and MedicalClinic JSON-LD to the landing page | Agent |
| 2026-08-21 | Added optional Google sign-in, account portal, consented assessment storage, signed-in booking history, Azure Functions API, and Cosmos DB integration scaffold | Agent |
| 2026-08-22 | Switched the optional sign-in path to built-in GitHub auth so the app remains deployable on the Azure Static Web Apps Free SKU; Google configuration parked for a future Standard upgrade | Agent |
| 2026-08-22 | Replaced Azure/GitHub session auth with optional Firebase Google sign-in and server-side Firebase ID-token verification; deployment secrets still required | Agent |
| 2026-08-22 | Updated clinician profile asset and bio; simplified the initial service catalogue to one flexible 30-60 minute Psychiatric Consultation | Agent |
| 2026-08-22 | Replaced the Google Form booking redirect with direct guest/signed-in Cosmos booking storage and basic Resend notification flow; Resend credentials/domain verification remain required | Agent |
| 2026-08-23 | Decided that valid booking requests should immediately create a Google Calendar event with a Google Meet link; Join remains hidden/disabled if link creation fails and unlocks 15 minutes before the start time | Admin / Tech |
| 2026-08-23 | Added Mermaid diagrams for current architecture, booking flow, authentication/data access, roadmap dependencies, and booking data shape | Agent |
| 2026-08-24 | Enabled GA4 and Microsoft Clarity automatically without an analytics prompt, scoped to anonymous public home/team page insights; account, booking, assessment, and clinician routes remain excluded | Agent |
| 2026-08-24 | Added a clinician-only, download-only prescription PDF generator with local document creation, medicine rows, A4 Antaran letterhead styling, and server-side clinician allowlisting; prescription data is not persisted | Agent |
| 2026-08-29 | Updated the Know your team profile with Dr. Medha’s approved qualifications, education, experience, care approach, and Antaran mission | Agent |
| 2026-08-26 | Added shared admin-managed 30-minute availability, blocked dates, public slot generation, one-booking-per-slot reservations, and an admin workspace containing availability and prescription tabs | Agent |
| 2026-08-27 | Added MSW (Mock Service Worker) setup for local frontend development with `npm run dev:mock`, mocking auth, availability, bookings, profile, assessments, and admin/clinician workspace endpoints | Agent |
| 2026-08-27 | Polished booking form alignment, replaced date/time dropdowns with native calendar/time inputs, hid the single consultation type, improved admin/clinician loading states, removed duplicate admin header, and redesigned availability editor with day chips and a shared daily time range | Agent |
| 2026-08-29 | Fixed Mantine booking time selection validation, removed stale blur behavior, corrected nested picker styling, and added pointer affordances to date/time controls | Agent |
| 2026-08-29 | Enforced required patient age and email validation consistently in the booking UI, local mock API, and Azure Function API | Agent |
| 2026-08-29 | Added a balanced assessment card beside the consultation card so the consultations section offers both care paths without an empty panel | Agent |
| 2026-08-29 | Fixed mock-mode auth switching so sign-out clears an active Firebase session and Admin, Clinician, and Patient test identities can be selected reliably | Agent |
| 2026-08-29 | Replaced the prominent mobile navigation row with a compact menu button and role-aware popover menu beside Book | Agent |
| 2026-08-24 | Added dormant Razorpay Test Mode payment scaffolding with a fixed ₹5 server-side order, signature verification, and webhook endpoint; booking UI remains unchanged while `PAYMENTS_ENABLED=false` | Agent |
| 2026-09-10 | Reconciled this tracker with the implemented repository: marked the patient portal, PHQ-9/GAD-7 assessment slice, and booking/availability slice done for their current scope; documented existing admin, clinician prescription, auth, consent, mock, and payment foundations and separated remaining follow-up work | Agent |
| 2026-09-10 | Added admin-managed provider onboarding: create pending psychiatrist/psychologist/therapist records, review status, verify/suspend providers, and allow verified database-backed providers to pass clinician access checks; public marketplace discovery remains deferred | Agent |
| 2026-09-12 | Added additive public Symptoms, Resources, and Prepare pages with search/filtering, expandable guides, consultation CTAs, and emergency boundaries; no booking, assessment, auth, or API logic changed | Agent |
