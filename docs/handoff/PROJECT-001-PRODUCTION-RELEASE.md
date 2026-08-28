# Project 001 — Production Release

**PROJECT:** AI Local Business Website Factory
**STATUS:** PRODUCTION DEPLOYED (Milestone 1, renderer foundation)
**GITHUB:** https://github.com/scooterxd69/ai-local-business-website-factory
**HOST:** GitHub Pages
**PUBLIC URL:** https://scooterxd69.github.io/ai-local-business-website-factory/
**PRODUCTION COMMIT:** See "Deployed commit" below; recorded at end of this doc.
**DEPLOYMENT DATE:** 2026-08-28

---

## What is deployed

A static site, served by GitHub Pages from the `site/` directory. The site
contains:

1. **Landing page** (`/`) — explains what the project is, what shipped in
   Milestone 1, what does not, and links to live demos.
2. **Three live demo sites**, each produced by the renderer from a hand-authored
   `Business` record:
   - `/restaurant/` — Sharma Family Restaurant (Prayagraj, veg, since 1985)
   - `/salon/` — Luxe Beauty Studio (Lucknow)
   - `/coaching/` — Bright Minds Tutorials (Patna, since 2011)

The site is auto-built by `.github/workflows/pages.yml` on every push to
`main` and on `workflow_dispatch`. The build steps are: install → typecheck
→ test → render samples into `site/` → upload as a Pages artifact → deploy.

## What is NOT deployed (and is not pretending to be)

The prompt for this release pass described an end-to-end product journey
("landing page → business onboarding → AI generation → preview → editing →
regeneration → publishing"). **None of those are deployed.** Milestone 1 is
the renderer foundation. The product layer is Milestone 2 and is not in
this repository.

Specifically, the following are **out of scope** for this release:

- Web-based onboarding form for businesses
- AI generation pipeline (Claude / any LLM integration)
- Live preview UI
- Structured editor for the WebsiteSpec
- Regeneration flow (no in-product state to regenerate from)
- Publishing flow (each render is a one-shot CLI invocation)
- Database, auth, account management
- Subdomain or custom-domain hosting tier for generated sites
- Payments / subscriptions / CRM
- Analytics

If the user-facing checklist in the prompt's section 23 asked for any of
these, the truthful status is: **NOT IMPLEMENTED IN MILESTONE 1.** They are
in `TODO.md` under Milestone 2 (AI generation pipeline) and later.

## Build

**PASS.** Local build:

```
cd app
npm ci
npm run typecheck
npm test
npm run build:site
```

Exit code 0. All four steps succeed. Rendered files written to
`site/restaurant/`, `site/salon/`, `site/coaching/`.

## Tests

**PASS — 69/69 tests, 6 files, ~1.5s.**

- `app/tests/security.test.ts` — 26 tests
- `app/tests/website-spec.test.ts` — 13 tests
- `app/tests/renderer.test.ts` — 11 tests
- `app/tests/category-profiles.test.ts` — 7 tests
- `app/tests/business-schema.test.ts` — 8 tests
- `app/tests/samples.test.ts` — 4 tests

The CI workflow (`.github/workflows/ci.yml`) runs the same four steps on
every push to `main`, `pc-lab`, `laptop-lab`, and on PRs into `main`. The
Pages workflow re-runs the same test + build pipeline as a gate before
deploying.

## AI generation

**NOT IMPLEMENTED.** No AI provider is wired up. Sample `Business` records
in `samples/` are hand-authored JSON.

## Publishing

**N/A for this milestone.** Each render is a local CLI invocation:

```
npm run render -- --business path/to/business.json --out dist/<slug>
```

The CI workflow deploys the three sample renders to GitHub Pages. There is
no user-facing publishing flow yet.

## Mobile

**PASS by design.** The renderer is mobile-first (single CSS file with
`@media (min-width: …)` breakpoints, no JavaScript). The landing page uses
the same approach (Inter + Manrope, system fallbacks, single CSS file,
hand-written, no JS). Both should be readable on a 360 px-wide viewport.

## Security

**PASS — by construction.**

- The renderer is the security boundary. Every text node goes through
  `escape()`. Every URL goes through `sanitizeUrl()` then `escapeUrl()`.
  `sanitizeUrl` rejects `javascript:`, `data:`, `file:`, `vbscript:`. The
  contracts are pinned by 26 security tests in
  `app/tests/security.test.ts`.
- No secrets in the repository. No `.env` files. No API keys.
- No client-side JavaScript shipped to users. The XSS attack surface in
  the static output is limited to (a) raw HTML the renderer emits and (b)
  URLs the renderer embeds. Both are escape/sanitize-controlled.
- The renderer is run at build time, not at request time, so there is no
  server-side request handling to attack.
- HTTPS is enforced by GitHub Pages (`https_enforced: true` on the
  Pages site config).
- `.well-known` / `security.txt` not added in this release; can be added
  later if the project adopts a security-disclosure process.

## Performance

**N/A for a static site — the product has no server.** The deployed site
ships:

- 1 HTML file per page (landing ~10 KB, samples ~7–9 KB)
- 1 CSS file per page (~9 KB minified-ish — hand-written, not minified)
- 0 JavaScript
- 0 images (samples reference no image URLs in the data; the landing page
  is text-only on purpose)
- 1 favicon.svg (~250 bytes)
- 1 og-image.svg (~1.4 KB)

The Pages CDN handles the rest (edge caching, HTTP/2, Brotli).

## Environment variables

**None required for production.** The current product is a static
site generator. There is no application runtime, no database, no API
key. Future milestones (M2: AI generation) will introduce env vars; they
will be documented in `.env.example` and configured via the hosting
platform's secret manager.

## Rollback

**Procedure:**

1. Revert the offending commit in a new commit on `main`. The Pages
   workflow redeploys from `main` automatically.
2. If a hotfix is required, push the fix to `main` — that is itself
   the rollback path. GitHub Pages always serves whatever the latest
   `pages.yml` run produced.
3. If the Pages deployment is broken, disable Pages deployment via the
   repo Settings → Pages, or via the API:
   `gh api -X DELETE repos/scooterxd69/ai-local-business-website-factory/pages`
   Then revert to a known-good commit and re-enable.
4. The most recent successful production deployment corresponds to
   commit `<SHA>` on `main` (recorded at the end of this doc).

**Previous stable commit:** the initial `feat: Milestone 1 - renderer
foundation` commit. Reverting to it is a fast-forward `git revert HEAD`
on `main`.

## Next development priority

**Milestone 2: AI generation pipeline.** The product thesis is "structured
data in, clean website out." Milestone 1 proved the back half. Milestone 2
proves the front half: Claude (or another LLM) takes a category + a few
prompts and emits a valid `Business` JSON that the existing renderer
accepts.

Concretely, the M2 scope is:

1. A small CLI (`app/src/cli/generate.ts`) that takes a category and a
   user-provided seed (e.g. a few sentences) and calls Claude.
2. A prompt template per category, designed so that the LLM cannot invent
   business facts the user did not provide.
3. A Zod-validated output path. If Claude emits invalid JSON, retry up to
   N times with a corrective prompt; then fail loudly.
4. End-to-end test: feed a seed → run generate → run render → diff the
   output against a hand-authored baseline.

Out of M2 scope: web UI, persistence, hosting tier, payments.

## Deployed commit

To be filled in after the final push.
