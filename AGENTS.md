# Agent Guide — Antaran Platform

> Quick-start for any developer or AI agent who picks up this repo.

## Project identity

- **Working name:** Antaran (from the provided logo; domain/usage rights pending).
- **Vision:** Pan-India digital mental-health / telepsychiatry platform for adults 18+.
- **Initial model:** Founder-only psychiatrist, with architecture designed for onboarding more clinicians, psychologists, and other professionals later.
- **Current state:** A static Vite + React + Tailwind landing page exists. No backend, auth, database, video, or payment integration is wired yet.

## Where to find decisions and plans

| Document | Purpose |
|----------|---------|
| `docs/roadmap/PROJECT_TRACKER.md` | Master module tracker: what is done, in progress, blocked, or deferred. |
| `docs/roadmap/ARCHITECTURE_PLAN.md` | Proposed technical architecture, stack, workflows, estimates, costs, and third-party services. |
| `docs/roadmap/QUESTIONS_AND_DECISIONS.md` | Open questions, proposed decisions, and decided items. Check this before assuming anything. |
| `docs/roadmap/REGULATORY_NOTES.md` | Indian regulatory / compliance checklist and open legal questions. |
| `docs/roadmap/DESIGN_SYSTEM.md` | Visual language, color tokens, typography, and accessibility rules. |
| `src/design-system/tokens.js` + `tokens.json` | Programmatic design tokens. Import from here; do not add arbitrary colors. |

## Rules for agents

1. **Read the tracker first.** Before starting any work, check `PROJECT_TRACKER.md` for the module status.
2. **Do not guess business/legal/clinical answers.** Questions owned by Admin, Clinician, or Legal require explicit approval. You may propose options and mark them as "Proposed" in `QUESTIONS_AND_DECISIONS.md`.
3. **Use the design system.** All new UI must use tokens from `src/design-system/tokens.*`. Legacy aliases (`ink`, `moss`, `sage`, `clay`, `mist`, `line`) exist only for the current landing page.
4. **Update the tracker after work.** Change statuses, add notes, and reference commits.
5. **Keep the scope small.** Do not build Phase 2 features unless the module is explicitly marked ready.
6. **Do not start a module that is blocked.** If a module depends on an open question, resolve the question first or ask for clarification.
7. **Security and privacy are non-negotiable.** Any feature handling PHI (personal health information) must follow the security architecture in `ARCHITECTURE_PLAN.md` and the compliance checklist in `REGULATORY_NOTES.md`.
8. **No autonomous diagnosis.** Assessment tools are decision-support only. The clinician always makes clinical decisions.

## Tech stack today

- **Frontend:** React 19 + Vite + Tailwind CSS.
- **Build:** `npm run build`
- **Dev:** `npm run dev`
- **Lint:** `npm run lint`

## Proposed future stack (not yet implemented)

- Next.js (App Router) + TypeScript for patient app and dashboards.
- NestJS backend.
- PostgreSQL + Prisma.
- Redis for sessions/cache/queues.
- Razorpay, 100ms/Daily.co, MSG91, Resend/SES.

See `ARCHITECTURE_PLAN.md` for details.

## How to make changes

1. Create a feature branch (unless told otherwise).
2. Implement the smallest change that satisfies the requirement.
3. Run `npm run build` and `npm run lint` before committing.
4. Update the relevant roadmap/tracker documents.
5. Commit with a clear message referencing the module ID if applicable (e.g., `docs: update M4 booking decisions`).

## Decision authority

- **Tech-only decisions:** agents can decide and record in `QUESTIONS_AND_DECISIONS.md`.
- **Business, pricing, legal, clinical workflow, vendor selection:** require explicit approval from the admin, clinician, or legal counsel.

## Emergency / safety reminder

The platform will handle mental-health crises. Any code related to risk screening, emergency referral, or clinician escalation must be reviewed carefully and must never provide medical advice or diagnosis.
