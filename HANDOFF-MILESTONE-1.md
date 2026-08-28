# Handoff: Milestone 1 — PC → Laptop

**From:** PC (scooterxd69, Windows)
**To:** Laptop (any operator)
**Date:** 2026-08-28
**Milestone:** 1 — Renderer Foundation
**Status:** Complete and tested. Ready to be picked up on the laptop.

---

## What's in this repo

This is a freshly-pushed standalone GitHub repo
(`scooterxd69/ai-local-business-website-factory`). It contains the entire
Milestone 1 work as a clean history.

## What you (the laptop) need to do

### 1. Clone the repo

```bash
git clone https://github.com/scooterxd69/ai-local-business-website-factory
cd ai-local-business-website-factory
```

(If you have a fork workflow set up, fork first and clone your fork.)

### 2. Install + verify

```bash
cd app
npm install
npm test         # should print: 69 passed (69)
npm run typecheck
```

Expected: 69 tests pass in ~1.5 s. Typecheck clean.

### 3. Render the sample sites

```bash
npm run render:all
```

This writes:

- `../dist/restaurant/index.html` (+ `styles.css`, `structured-data.json`, `spec.json`)
- `../dist/salon/...`
- `../dist/coaching/...`

Open any of them in a browser. You should see a complete, mobile-responsive
website with the right brand color for the category:

- restaurant: deep red `#8B1A1A`
- salon:     sage green `#5B7553` (the salon sample overrides to `#8B5A8B`)
- coaching:  navy `#1E3A5F`

### 4. What to work on next

The PC has finished Milestone 1 (renderer foundation). See `TODO.md` for
the laptop's next areas:

- **UX flow** — wireframes, end-to-end customer journey
- **AI generation prompt strategy** — how to prompt Claude to produce
  valid `Business` records
- **Design system** — the Figma / component spec the renderer should
  match (currently guidelines-only in `design-system.md`)
- **Lighthouse CI** — automated quality gates

The PC will continue with:

- **AI generation pipeline** (M2)
- **Lighthouse CI** (M2)
- **Image handling** (M2)
- **Form backend** (M3)

## Project layout (for orientation)

```
ai-local-business-website-factory/
├── README.md                  ← start here
├── MILESTONE-1.md             ← what shipped in M1
├── HANDOFF-MILESTONE-1.md     ← this file
├── VISION.md / ARCHITECTURE.md / DECISIONS.md / TODO.md
├── business-schema.md         ← source of truth for Business
├── website-schema.md          ← source of truth for WebsiteSpec
├── samples/                   ← 3 demo businesses
│   ├── restaurant.json
│   ├── salon.json
│   └── coaching.json
├── app/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   ├── src/
│   │   ├── business/business-schema.ts
│   │   ├── website/website-spec.ts
│   │   ├── security/escape.ts
│   │   ├── renderer/        (render.ts, theme.ts, css.ts, cta.ts, sections.ts)
│   │   ├── profiles/category-profiles.ts
│   │   └── cli/render.ts
│   └── tests/                (6 test files, 69 tests)
└── (dist/  is gitignored — it's generated output)
```

## Things to know

1. **The renderer is the security boundary.** All text via `escape()`,
   all URLs via `sanitizeUrl()` + `escapeUrl()`. If you add a new section
   type, you MUST thread user/AI data through these helpers. The
   `security.test.ts` file is the contract.
2. **The composer never invents business facts.** If a section needs data
   that isn't in the business, that section is omitted — not filled with
   "lorem ipsum". This is a hard requirement (D-003 in `DECISIONS.md`).
3. **TypeScript is strict.** `exactOptionalPropertyTypes` and
   `noUncheckedIndexedAccess` are on. Optional properties cannot be
   implicitly `undefined`; indexed access returns `T | undefined`. The
   build is configured to fail on these.
4. **All categories use the same renderer.** Category differences live
   in `category-profiles.ts` (which sections, in what order) and
   `theme.ts` (default colors). Adding a new category is a small change.

## If something is wrong

- Tests fail: read the diff carefully. If a sample changed, re-run
  `npm run render:all` to see if output is still correct.
- Type errors: `npm run typecheck`. The most common cause is a new
  optional property being added to a schema without updating the renderer.
- Output looks broken: open the HTML in a browser, then look at
  `dist/<name>/spec.json` to see the resolved spec. If the spec is
  right but HTML is wrong, it's a renderer bug.

Ping the PC with:
- The exact command you ran
- The test output (or browser screenshot)
- What you expected vs what you got

## Commit message convention

This project uses Conventional Commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation
- `refactor:` code change with no behavior change
- `test:` test-only change

Branch convention: work on `laptop-lab` for laptop-side work,
`pc-lab` for PC-side work. `main` is stable.

## Storage and infrastructure

- This project is LIGHT. No Docker, no large models, no databases.
- Total repo size (without `node_modules` and `dist`) is ~150 KB.
- All dependencies are pure JS; `npm install` takes <30 s.
- You can safely develop on the laptop.

Welcome to the project. — PC
