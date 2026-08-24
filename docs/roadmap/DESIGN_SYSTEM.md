# Antaran Design System

> Brand-derived, accessibility-first visual language for the Antaran mental-health platform.
>
> **Current state:** Tokens seeded. Existing landing page still uses the original aliases (`ink`, `moss`, `sage`, `clay`, `mist`, `line`). New features should prefer the `brand-*` and `semantic-*` token classes.

## Principles

1. **Calm and trustworthy** — muted greens, warm neutrals, restrained gold accents.
2. **Clear hierarchy** — serif headings for warmth, sans-serif UI for readability.
3. **Accessible** — all text combinations must meet WCAG 2.1 AA contrast.
4. **Consistent** — no arbitrary hex codes; every color/shadow/radius comes from `src/design-system/tokens.*`.

## Token files

- `src/design-system/tokens.json` — canonical exchange format.
- `src/design-system/tokens.js` — ESM convenience module.
- `tailwind.config.js` — consumes the JS module.
- `src/styles.css` — exposes tokens as CSS custom properties.

## Color palette

### Brand

| Token            | Hex       | Usage                                          |
|------------------|-----------|------------------------------------------------|
| `brand-forest`   | `#2E4F43` | Primary actions, headers, logo dark            |
| `brand-leaf`     | `#6B8A75` | Secondary buttons, icons, success highlights   |
| `brand-sage`     | `#E8EEE4` | Section backgrounds, subtle fills              |
| `brand-sand`     | `#F6F4EF` | Card backgrounds, warm neutral                 |
| `brand-gold`     | `#C8A67C` | Accent, highlights, premium cues               |
| `brand-coral`    | `#C4745C` | Warm accent, caution, important labels         |

### Neutral

| Token             | Hex       | Usage                                |
|-------------------|-----------|--------------------------------------|
| `neutral-ink`     | `#20201D` | Body text, headings                  |
| `neutral-slate`   | `#4A4A46` | Secondary text, metadata             |
| `neutral-mist`    | `#F6F7F3` | Page background                      |
| `neutral-line`    | `#DFE3DA` | Borders, dividers                    |
| `neutral-white`   | `#FFFFFF` | Cards, overlays                      |

### Semantic

| Token               | Hex       | Usage                                |
|---------------------|-----------|--------------------------------------|
| `semantic-success`  | `#4A7C59` | Confirmations, completed states      |
| `semantic-warning`  | `#D4A056` | Cautions, pending actions            |
| `semantic-danger`   | `#B5423F` | Errors, critical safety alerts       |
| `semantic-info`     | `#4A6D8C` | Informational hints                  |
| `semantic-calm`     | `#6B8A75` | Reassuring UI accents                |

### Legacy aliases (still present)

These exist for backward compatibility in the current landing page:

- `ink` → `#20201D`
- `moss` → `#596A5A`
- `sage` → `#E8EEE4`
- `clay` → `#C4745C`
- `mist` → `#F6F7F3`
- `line` → `#DFE3DA`

New code should avoid adding more legacy aliases.

## Typography

- **Headings / display:** `font-serif` (Fraunces) — warm, editorial.
- **Body / UI:** `font-sans` (Inter) — clean, legible.
- **Base size:** `1rem` (16px).
- **Line heights:** `tight` (1.2) for headings, `normal` (1.6) for body, `relaxed` (1.8) for long-form.

## Spacing scale

Based on a `0.25rem` grid: `1` = 4px, `4` = 16px, `8` = 32px, `16` = 64px.

## Elevation

| Token           | Value                                                    | Usage                    |
|-----------------|----------------------------------------------------------|--------------------------|
| `shadow-sm`     | `0 1px 2px rgba(32, 32, 29, 0.04)`                       | Subtle borders           |
| `shadow`        | `0 4px 12px rgba(32, 32, 29, 0.06)`                      | Cards, dropdowns         |
| `shadow-md`     | `0 8px 24px rgba(32, 32, 29, 0.08)`                      | Modals, elevated panels  |
| `shadow-lg`     | `0 18px 45px rgba(32, 32, 29, 0.12)`                     | Hero, featured cards     |
| `shadow-focus`  | `0 0 0 4px rgba(107, 138, 117, 0.15)`                    | Focus rings              |

## Radii

- `rounded-md` (6px) — inputs, small buttons.
- `rounded-lg` (8px) — cards, panels.
- `rounded-xl` (12px) — large cards.
- `rounded-full` — pills, primary CTAs.

## Accessibility rules

- Body text must be at least `neutral-ink` on `neutral-white`/`neutral-mist`.
- `brand-forest` text should be paired with `brand-sage` or `neutral-white` for contrast.
- Danger/error text must use `semantic-danger` on a light background.
- Focus rings must be visible (`shadow-focus` or `ring-2 ring-brand-leaf`).
- Interactive targets must be at least 44x44px.

## How to use in code

```jsx
// Tailwind classes generated from tokens
<button className="bg-brand-forest text-white hover:bg-neutral-ink rounded-full px-6 py-3 shadow focus:ring-2 focus:ring-brand-leaf">
  Book consultation
</button>

<div className="bg-brand-sage text-neutral-ink p-6 rounded-lg shadow">
  <h2 className="font-serif text-2xl">Care that starts with being heard.</h2>
</div>
```

## Open questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| DS-01 | Confirm final brand color values with logo source files | Admin / Designer | ✅ Resolved: use the existing Antaran logo palette |
| DS-02 | Decide dark-mode support and token variants | Tech / Designer | Open |
| DS-03 | Define motion/accessibility preferences (reduced motion) | Designer | Open |
