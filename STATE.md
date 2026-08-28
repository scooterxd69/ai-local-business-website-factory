# STATE — AI Local Business Website Factory

**Last Updated:** 2026-08-28
**Owner:** PC (engineering) — production release

---

## PRODUCTION STATUS

**Status:** **DEPLOYED**

**Production URL:** https://scooterxd69.github.io/ai-local-business-website-factory/
**Host:** GitHub Pages (build_type=workflow, HTTPS enforced)
**Deployment date:** 2026-08-28
**Production commit:** recorded in `docs/handoff/PROJECT-001-PRODUCTION-RELEASE.md` after final push
**Current version:** Milestone 1 (renderer foundation) — v0.1.0

---

## What is in production

A static site, served by GitHub Pages, containing:

- A landing page that explains the project
- Three live demo sites (restaurant, salon, coaching) rendered by the
  factory from hand-authored JSON

The product is a **library** that takes structured business data and
produces a static website. Milestone 1 ships the engine; the product
layer (web UI, AI generation, persistence) is Milestone 2.

## What is NOT in production (and is honestly so)

- No AI generation pipeline. `samples/*.json` are hand-authored.
- No web UI for onboarding, editing, or preview.
- No database, auth, or account management.
- No publishing flow beyond the local CLI.
- No hosting tier for end customers' generated sites.
- No payments, subscriptions, or analytics.

See `docs/handoff/PROJECT-001-PRODUCTION-RELEASE.md` for the full
production release notes and the explicit scope boundaries.

---

## Locked decisions

- Product name: **AI Local Business Website Factory**
- Product thesis: structured business data → composed website sections → rendered site
- MVP categories: **Restaurant, Salon, Coaching Institute** (3 only)
- AI output: **structured JSON spec**, not raw HTML
- Render model: **section-based composition** with category-specific section profiles
- Honesty rule: **AI never fabricates business facts**
- Initial geography: **India-first**, but architecture i18n-ready
- Initial pricing posture: **hybrid** (small setup fee + maintenance subscription) — see `monetization.md`
- Hosting for M1: **GitHub Pages** (static; minimal cost; integrates with existing repo)
- Hosting for the future "subdomain for each generated site" tier: **TBD in M3**

## What is still open

| Topic | Owner | Status |
|-------|-------|--------|
| Web UI for onboarding (form / chat) | M2 | Not started |
| AI generation pipeline (Claude API) | M2 | Not started |
| Editor / live preview | M2 | Not started |
| Hosting tier for generated sites | M3 | Not started |
| Payments / subscriptions | M3 | Not started |
| Analytics | M3 | Not started |
| Custom domain support on Pages | Post-MVP | Not started |

## Active work right now

- PC: shipped Milestone 1 to production. Awaiting laptop review of the
  production URL.
- Laptop: should review `https://scooterxd69.github.io/ai-local-business-website-factory/`
  on desktop and mobile. Then begin M2 scoping (the AI generation prompt
  templates and the web UI wireframes).

## Where state lives

- **Production release notes:** `docs/handoff/PROJECT-001-PRODUCTION-RELEASE.md`
- **What shipped in M1:** `MILESTONE-1.md`
- **Open work items:** `TODO.md`
- **Architectural decisions:** `DECISIONS.md`
- **What we are building and why:** `VISION.md`
- **System architecture:** `ARCHITECTURE.md`
- **Product scope:** `mvp-scope.md`
- **Schemas:** `business-schema.md`, `website-schema.md`
- **Design system:** `design-system.md`
- **Monetization:** `monetization.md`
- **Competitive landscape:** `competitive-research.md`
