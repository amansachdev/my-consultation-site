# Open Questions & Decision Log

> Living document. The tracker in `PROJECT_TRACKER.md` references these IDs.
>
> **How to use:**
> - **Owner = Admin / Clinician / Legal:** agents must not guess. Propose options and mark as "Proposed".
> - **Owner = Tech:** agents can decide, but must record the decision here before implementation.
> - Once a question is answered, move it from **Open Questions** to **Decided** with date and rationale.

## Legend

- **Open** — no decision yet; work should pause if it blocks architecture or build.
- **Proposed** — agent has recommended an answer; waiting for approval.
- **Decided** — approved and recorded in this file.
- **Deferred** — intentionally postponed to a later phase.

---

## Open Questions

| ID | Area | Question | Context / Options | Owner | Status |
|----|------|----------|-------------------|-------|--------|
| Q-BIZ-01 | Business | Final brand name, domain, and logo usage rights | Domain purchased: `antaran.online` and deployed via Azure Static Web Apps. Final brand name and logo/trademark usage rights still to be confirmed. | Admin | Open |
| Q-BIZ-02 | Business | Will the MVP include in-person clinic bookings or online-only telepsychiatry? | Current landing page mentions both. In-person adds location/clinic-management complexity. | Admin / Clinician | Open |
| Q-BIZ-03 | Business | What are the consultation fees for each service type? | Initial / follow-up / sleep / therapy / packages. Determines payment order model and payout logic. | Admin / Clinician | Open |
| Q-BIZ-04 | Business | Cancellation and refund policy | e.g., full refund >24h, 50% 12-24h, no refund <12h. Required for payment and booking modules. | Admin / Legal | Open |
| Q-BIZ-05 | Business | Platform commission / clinician payout split | e.g., 80/20, 75/25, flat fee. Required for payout calculation. | Admin / Clinician | Open |
| Q-BIZ-06 | Business | GST registration status and invoicing requirements | Need GSTIN for tax invoices? Required for invoice module. | Admin / Legal | Open |
| Q-BIZ-07 | Business | Languages and regions supported at launch | Hindi, English, regional languages affect copy, forms, and SMS templates. | Admin | Open |
| Q-BIZ-08 | Business | Insurance or corporate/EAP tie-ins in MVP? | Likely Phase 2, but affects data model if needed earlier. | Admin | Deferred |
| Q-CLIN-01 | Clinical | Exact service catalogue, durations, and eligibility | Which services are offered, by whom, and for which age/gender/condition filters? | Clinician | Open |
| Q-CLIN-02 | Clinical | Clinician credential-verification checklist | MCI/NMC registration, state medical council, degree certificates, PAN/bank KYC? | Clinician / Legal | Open |
| Q-CLIN-03 | Clinical | Intake questionnaire beyond PHQ-9 / GAD-7 | Bipolar / ADHD / sleep / substance-use / suicide risk screening scope. | Clinician | Open |
| Q-CLIN-04 | Clinical | Risk thresholds that trigger emergency workflow | e.g., PHQ-9 item 9 score >0, explicit ideation, psychosis screen positive. | Clinician | Open |
| Q-CLIN-05 | Clinical | Emergency referral directory and crisis contacts per state | Need a vetted list of emergency services / hospitals / helplines (AASRA, iCall, state resources). | Clinician / Admin | Open |
| Q-CLIN-06 | Clinical | Prescription policy and controlled-substance restrictions | Will the platform ever allow prescribing Schedule X / NDPS drugs? Telemedicine guidelines restrict many. | Clinician / Legal | Open |
| Q-CLIN-07 | Clinical | Follow-up validity window and pricing | e.g., reduced fee if booked within 7 days of last consult. | Clinician | Open |
| Q-LEGAL-01 | Legal | Operating entity and clinical-establishment registration | Solo proprietorship / LLP / Pvt Ltd? State Clinical Establishments Act registration? | Legal / Admin | Open |
| Q-LEGAL-02 | Legal | Terms of Use, Privacy Policy, and Consent wording | Must cover telemedicine, data use, emergency limitations, payment, grievance. | Legal | Open |
| Q-LEGAL-03 | Legal | Data-retention schedule for medical records and audit logs | Minimum retention often tied to clinical / legal requirements; affects deletion policy. | Legal | Open |
| Q-LEGAL-04 | Legal | Grievance / nodal officer and response timelines | Required under IT Rules and good clinical governance. | Legal / Admin | Open |
| Q-LEGAL-05 | Legal | DPDP Act 2023 readiness and consent-manager approach | How explicit consent is captured, withdrawn, and logged. | Legal | Open |
| Q-TECH-01 | Tech | Frontend strategy: migrate to Next.js or keep Vite React landing + separate Next.js apps? | Next.js gives SSR, routing, API routes; Vite landing is already built. | Tech / Admin | Decided |
| Q-TECH-02 | Tech | Auth provider: self-hosted vs Clerk / Auth0 / Firebase Auth | Self-hosted gives control; managed reduces build time. Clinicians/admins need MFA. | Tech | Decided |
| Q-TECH-03 | Tech | Video provider: 100ms vs Daily.co vs Twilio vs self-hosted Jitsi | Need India presence, waiting rooms, recording opt-in, reasonable cost. | Tech | Proposed |
| Q-TECH-04 | Tech | Payment gateway: Razorpay vs Cashfree vs Stripe India | Razorpay is the default for Indian UPI/cards/netbanking. | Tech | Proposed |
| Q-TECH-05 | Tech | SMS provider: MSG91 vs Twilio | MSG91 is usually cheaper for India OTP; Twilio broader. | Tech | Proposed |
| Q-TECH-06 | Tech | Email provider: Resend vs SendGrid vs AWS SES | Resend simple; SES cheapest at scale. | Tech | Proposed |
| Q-TECH-07 | Tech | Cloud region and data-localization commitment | Primary DB and file storage must be in India for PHI / DPDP readiness. | Tech | Proposed |
| Q-TECH-08 | Tech | Backup RTO/RPO and disaster-recovery target | e.g., RPO 1h, RTO 4h. Drives infra cost. | Tech / Admin | Proposed |
| Q-TECH-09 | Tech | Video session recording default | Default off; only record with explicit consent and clinical need. | Tech / Clinician | Proposed |

---

## Proposed Decisions (Awaiting Confirmation)

| ID | Decision | Why it is proposed | Blocked by | Proposed by | Date |
|----|----------|--------------------|------------|-------------|------|
| D-TECH-01 | Use **Razorpay** for payments | Best Indian coverage of UPI, cards, net banking; strong webhook and refund APIs. | Q-TECH-04 | Tech | 2026-08-15 |
| D-TECH-02 | Use **100ms** or **Daily.co** for video | Both have Indian POPs, simple token auth, waiting-room patterns, and recording opt-in. | Q-TECH-03 | Tech | 2026-08-15 |
| D-TECH-03 | Use **PostgreSQL** + **Prisma** ORM | Robust relational data, strong TypeScript support, migration tooling. | Q-TECH-01 | Tech | 2026-08-15 |
| D-TECH-04 | Use **NestJS** (Node.js) backend | Modular architecture, built-in validation, easy to split into microservices later. | Q-TECH-01 | Tech | 2026-08-15 |
| D-TECH-05 | Use **Next.js** for patient app and dashboards | Role-based routing, SSR for SEO, API routes for webhooks, single skill set. | Q-TECH-01 | Tech | 2026-08-15 |
| D-TECH-06 | Use **Redis** for sessions, cache, and BullMQ job queues | Single managed service covers auth sessions, rate-limiting, reminders, payouts. | Q-TECH-02 | Tech | 2026-08-15 |
| D-TECH-07 | Use **Cloudflare R2** or **AWS S3 (Mumbai)** for documents | S3-compatible, India region option, server-side encryption, cheap egress with R2. | Q-TECH-07 | Tech | 2026-08-15 |
| D-TECH-08 | Use **MSG91** for SMS and **Resend** or **AWS SES** for email | Cost-effective Indian SMS; simple email API. | Q-TECH-05, Q-TECH-06 | Tech | 2026-08-15 |
| D-TECH-09 | Host primary data in **India** (AWS Mumbai / GCP Mumbai / Azure Pune) | DPDP readiness, patient trust, latency. | Q-TECH-07 | Tech | 2026-08-15 |
| D-CLIN-01 | Do **not** prescribe Schedule X / NDPS-controlled substances via teleconsult | Aligns with Indian telemedicine guidelines and reduces legal/technical risk. | Q-CLIN-06 | Clinician / Legal | 2026-08-15 |
| D-CLIN-02 | Default **off** for video recording; opt-in only with explicit consent | Privacy-first default; recording only if clinically justified and consented. | Q-TECH-09 | Tech / Clinician | 2026-08-15 |
| D-LEGAL-01 | Capture **explicit DPDP-style consent** at registration and for each major use (video, upload, payment) | Builds audit trail and supports data-principal rights. | Q-LEGAL-05 | Legal / Tech | 2026-08-15 |

---

## Decided

| ID | Decision | Rationale | Date | Owner |
|----|----------|-----------|------|-------|
| D-GLOBAL-01 | Target audience: **adults 18+ in India** | Scope defined by the founder; pediatric care deferred. | 2026-08-15 | Admin |
| D-GLOBAL-02 | Initial clinician model: **founder-only**, with architecture prepared for onboarding more clinicians | Keeps MVP focused while remaining scalable. | 2026-08-15 | Admin / Clinician |
| D-GLOBAL-03 | Working brand name: **Antaran** | Taken from the provided logo. Domain/usage rights to be confirmed (Q-BIZ-01). | 2026-08-15 | Admin |
| D-DESIGN-01 | Color palette derived from the Antaran logo: forest green, sage, warm gold, coral | See `DESIGN_SYSTEM.md` and `src/design-system/tokens.*`. | 2026-08-15 | Tech / Designer |
| D-CLIN-03 | MVP validated scales: **PHQ-9** and **GAD-7**; others in Phase 2 | Most common, evidence-based, low-risk screening tools. | 2026-08-15 | Clinician |
| D-CLIN-04 | The platform **will not diagnose**; assessments are decision-support for clinicians | Essential clinical-safety guardrail. | 2026-08-15 | Clinician / Legal |
| D-TECH-10 | Host the static landing page on **Azure Static Web Apps Free tier** with custom domain `antaran.online` and GitHub Actions CI/CD | Cheapest viable option (~$0 for current traffic); free SSL, global CDN, and simple Vite/React deployment. | 2026-08-17 | Tech |
| D-TECH-11 | Keep the public frontend as **Vite + React** and add an **Azure Functions API** under the existing Azure Static Web App | Preserves the public deployment and avoids a Next.js migration while optional patient features are validated. | 2026-08-21 | Tech |
| D-TECH-12 | Use **Azure Static Web Apps built-in GitHub authentication** for optional patient accounts while remaining on the Free SKU; park Google custom authentication for a future Standard SKU decision | Avoids password storage and keeps the public site ungated. The existing Google client/settings are retained for a future switch, but the Free SKU cannot deploy the custom Google provider configuration. | 2026-08-22 | Tech |
| D-TECH-13 | Use **Cosmos DB serverless** for the initial account, booking, consent, and assessment persistence | Minimizes initial operational cost and integrates cleanly with Azure Functions; production data region still requires confirmation. | 2026-08-21 | Tech |

---

## How to add a new question

1. Pick the next ID in the relevant area (`Q-BIZ-`, `Q-CLIN-`, `Q-LEGAL-`, `Q-TECH-`).
2. Add it to the **Open Questions** table with owner and status.
3. Reference it from `PROJECT_TRACKER.md` in the affected module row.
4. When answered, move to **Decided** and update the tracker.
