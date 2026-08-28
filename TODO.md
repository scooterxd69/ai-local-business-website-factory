# TODO — Open Work Items

**Last Updated:** 2026-08-28
**Owner:** Laptop (planning, M2 design) / PC (M2 implementation)

---

## Done (Milestone 1)

- [x] Project planning documents (VISION, ARCHITECTURE, STATE, DECISIONS, mvp-scope, schemas, design-system, monetization, competitive-research)
- [x] Business schema (Zod) — 3 categories
- [x] Website spec (Zod) — 14 section types
- [x] Renderer (pure function, security boundary)
- [x] Category profiles (restaurant, salon, coaching)
- [x] CLI (`npm run render -- --business X --out Y`)
- [x] 69 tests across 6 files
- [x] 3 sample businesses
- [x] GitHub repo created and pushed (`scooterxd69/ai-local-business-website-factory`)
- [x] GitHub Pages enabled with HTTPS, auto-deploy from `main`
- [x] Production landing page (hand-written, matching design system)
- [x] Live demo sites (rendered samples) deployed
- [x] Favicon and og-image
- [x] Production release notes (`docs/handoff/PROJECT-001-PRODUCTION-RELEASE.md`)

---

## Milestone 2 — AI Generation Pipeline (next)

The product thesis needs the front half: take a category + a few user
prompts, call an LLM, get a valid `Business` record, render it.

### Scope (M2)

- [ ] Choose AI provider (Claude API is the leading candidate)
- [ ] Design prompt templates per category — explicitly prevent the LLM
      from inventing business facts the user did not provide
- [ ] Implement `app/src/cli/generate.ts` — calls LLM, validates output
      with Zod, retries on schema failure up to N times, then fails loudly
- [ ] End-to-end test: seed → generate → render → diff against hand-authored
      baseline; commit the baseline fixture
- [ ] Document the LLM cost / rate-limit posture (do not commit real keys)
- [ ] Update `.env.example` with the API key variable name
- [ ] Decide and document the LLM model/version in `DECISIONS.md`
- [ ] Add a `--generate --category restaurant` flag to the CLI

### Explicitly out of M2 scope

- No web UI (browser-based onboarding)
- No persistence / database
- No auth
- No payment flow
- No subdomain tier

These belong to M3+.

---

## Milestone 3 — Web UI + Persistence

Wire the engine to a product surface. This is a real size step; not in
the M2 sprint.

- [ ] Decide web framework (Next.js on Vercel? Or stay on a static
      page-server?)
- [ ] Database choice (Postgres? SQLite via Turso? Supabase?)
- [ ] Onboarding flow (form? chat-with-Claude?)
- [ ] Live preview pane
- [ ] Structured editor for the WebsiteSpec
- [ ] Hosting tier: a generated site per customer at
      `customer-name.websites.example`
- [ ] Auth (probably magic-link email; no passwords)
- [ ] Basic analytics (page views, CTA clicks)

---

## Post-MVP / nice-to-have

- [ ] Lighthouse CI as a required check on every PR
- [ ] Custom domain support on GitHub Pages
- [ ] Image handling (upload? stock-photo API?)
- [ ] Form backend for the contact section (currently `mailto:`)
- [ ] More category profiles (gym, clinic, law firm)
- [ ] i18n (Hindi first, given India-first positioning)
- [ ] `security.txt` and a security-disclosure process

---

## Process notes

- Laptop reviews production URL on desktop and mobile after every PC
  push.
- PC keeps the production URL live at all times; rollback is via
  `git revert` on `main` (Pages redeploys automatically).
- PC keeps STATE.md and TODO.md current after every meaningful change.
- Decisions go in `DECISIONS.md`, not in chat.
