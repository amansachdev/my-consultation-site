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

---

## Current snapshot

- **Project name:** Antaran (working)
- **Audience:** Adults 18+, Pan-India
- **MVP clinician model:** Founder-only, architected for multi-clinician expansion
- **Current code:** Public Vite + React + Tailwind site with optional account portal and Azure Functions API
- **Backend:** Azure Functions API scaffolded; Cosmos DB persistence requires Azure configuration
- **Auth:** Optional Google sign-in through Firebase Authentication; public routes remain ungated
- **Database, video, payments:** Database integration scaffolded; video and payments not started
- **Design system:** Tokens seeded; legacy landing page still uses original color aliases

---

## Module tracker

| ID | Module | Phase | Status | Key Deliverables | Blockers / Open Questions |
|----|--------|-------|--------|------------------|---------------------------|
| M0 | Foundation & Design System | MVP | In Progress | `AGENTS.md`, design tokens, Tailwind wiring, folder structure, repo conventions, CI lint/build | Q-BIZ-01 (final brand/domain) resolved: domain is `antaran.online`; DS-01 (color finalization) |
| M1 | Identity, Auth & MFA | MVP | In Progress | Optional Firebase Google sign-in, account route, Firebase-token API verification, and session-aware UI; clinician/admin MFA remains future work | Q-TECH-07 (hosting region) |
| M2 | Patient Portal & Onboarding | MVP | In Progress | Optional profile, booking history, consent capture, dashboard; document upload and emergency contact deferred | Q-LEGAL-02 (consent wording), Q-LEGAL-05 (DPDP consent) |
| M3 | Clinical Intake & Assessments | MVP | In Progress | PHQ-9/GAD-7 scoring, crisis banner, optional consented score/response storage | Q-CLIN-03 (intake scope), Q-CLIN-04 (risk thresholds), D-CLIN-04 (no diagnosis) |
| M4 | Booking, Calendar & Availability | MVP | In Progress | Direct guest and signed-in booking requests, Cosmos persistence, Resend owner notification, immediate Google Meet event/link creation, shared admin-managed 30-minute recurring availability, blocked dates, one-booking-per-slot reservation, service catalogue, appointment booking/reschedule/cancel, timezone handling | Q-BIZ-02 (online vs in-person), Q-BIZ-03 (pricing), Q-CLIN-07 (follow-up window) |
| M5 | Payments, Invoicing & Payouts | MVP | Planned | Razorpay integration, UPI/cards/net banking, payment confirmation, invoices/receipts, refunds, cancellation handling, commission calculation, clinician payout ledger | Q-BIZ-04 (refund policy), Q-BIZ-05 (commission), Q-BIZ-06 (GST), Q-TECH-04 (gateway) |
| M6 | Video Consultation | MVP | In Progress | Google Meet link creation, appointment linking, timed Join flow, fallback audio/telephone, recording opt-in | Q-TECH-09 (recording policy) |
| M7 | Clinician Dashboard & EHR | MVP | Planned | Secure login, profile/credentials, calendar, appointment list, patient history, clinical notes (SOAP), diagnosis, risk assessment, questionnaire results, longitudinal history, earnings view | Q-CLIN-02 (credential checklist), Q-TECH-02 (MFA) |
| M8 | Prescription & Documentation | MVP | Planned | Prescription generation, digital signature/approval flow, consultation summary, follow-up scheduling, document management | Q-CLIN-06 (controlled substances), Q-LEGAL-02 (consent), Q-CLIN-07 (follow-up window) |
| M9 | Safety & Emergency Workflows | MVP | Planned | Risk screening, crisis banners, emergency referral directory, escalation log, "teleconsult not appropriate" path, referral documentation | Q-CLIN-04 (thresholds), Q-CLIN-05 (referral directory), D-CLIN-04 (no diagnosis) |
| M10 | Admin Panel & Operations | MVP | Planned | Patient/clinician management, credential verification, appointment ops, payment/refund ops, support tickets, analytics dashboard, audit-log viewer, restricted clinical access | Q-LEGAL-04 (grievance officer), Q-BIZ-05 (payout rules) |
| M11 | Security, Privacy & Compliance | MVP | Planned | Encryption at rest/transit, RBAC, audit logging, secure document storage, backups, data-retention/deletion, breach-response runbook, security headers, pen-test plan | Q-LEGAL-03 (retention), Q-LEGAL-05 (DPDP), Q-TECH-07 (data localization), Q-TECH-08 (backup targets) |
| M12 | DevOps, Infra & Observability | MVP | In Progress | CI/CD (GitHub Actions → Azure Static Web Apps), managed DB/Redis/S3, logging, alerting, uptime monitoring, secrets management, staging environment | Q-TECH-07 (cloud region: Static Web Apps hosted in East Asia; custom domain + CDN), Q-TECH-08 (RTO/RPO) |
| M13 | Launch, QA & Soft Rollout | MVP | Planned | QA plan, end-to-end tests, accessibility audit, security review, soft launch with founder, feedback loop, bug triage | Depends on M0-M12 |

---

## Phase 2 / deferred modules

| ID | Module | Status | Notes |
|----|--------|--------|-------|
| P2-1 | Multi-clinician marketplace | Deferred | Search, profiles, ratings, onboarding pipeline |
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
| M1: Core identity & patient onboarding | M1-M3 | A patient can register, verify, consent, fill intake, and upload documents | Not Started |
| M2: Booking & payments | M4-M5 | A patient can book, pay, and receive confirmation/invoice | Not Started |
| M3: Consultation experience | M6-M8 | Clinician and patient can join video, produce notes & prescription | Not Started |
| M4: Safety & operations | M9-M11 | Risk workflows, admin panel, compliance controls in place | Not Started |
| M5: Launch readiness | M12-M13 | Production deployment, QA, soft launch | Not Started |

---

## Active blockers

| ID | What is blocked | Question / dependency | Owner |
|----|-----------------|----------------------|-------|
| B-01 | Azure account persistence | Configure Cosmos DB, Firebase token verification settings, and production secrets | Tech / Admin |
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
| 2026-08-24 | Added dormant Razorpay Test Mode payment scaffolding with a fixed ₹5 server-side order, signature verification, and webhook endpoint; booking UI remains unchanged while `PAYMENTS_ENABLED=false` | Agent |
