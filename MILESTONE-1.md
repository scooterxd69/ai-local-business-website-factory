# Milestone 1 — Renderer Foundation

**Status:** Complete
**Date:** 2026-08-28
**Owner:** PC (engineering / implementation)

---

## Goal

Prove the core technical claim: given a structured business record, we can
produce a clean, mobile-responsive, secure static website without any
human-in-the-loop. AI generation is out of scope for this milestone — the
input is hand-authored JSON.

## What Shipped

### Code

- `app/src/business/business-schema.ts` — Zod schema for `Business` (3 categories,
  60+ fields, discriminated union for category-specific extras).
- `app/src/website/website-spec.ts` — Zod schema for `WebsiteSpec` (14 section
  types, theme, SEO, structural rules: hero-before-content, at-most-one-footer).
- `app/src/security/escape.ts` — HTML/URL/JSON escaping, URL sanitization,
  phone normalization, WhatsApp link generation. The XSS safety contract lives here.
- `app/src/renderer/render.ts` — Public entry point `renderWebsite(spec, business)`.
  Returns `{html, css, structuredData, assets}`. Always emits a footer.
- `app/src/renderer/css.ts` — Mobile-first stylesheet generator with theme
  variables, WCAG-contrast-picked on-primary color, reduced-motion media query.
- `app/src/renderer/theme.ts` — Theme resolver: spec → business brand → category default.
- `app/src/renderer/cta.ts` — CTA resolver: call, WhatsApp, scroll, form, map,
  email, external link. Uses `escapeUrl(sanitizeUrl(...))`.
- `app/src/renderer/sections.ts` — 14 section renderers. Each takes typed content
  and the business, returns an HTML fragment.
- `app/src/profiles/category-profiles.ts` — Per-category section composition.
  Restaurant / salon / coaching have different default section orders. Never
  invents business facts.
- `app/src/cli/render.ts` — CLI: `npm run render -- --business X --out Y`.
  Writes `index.html`, `styles.css`, `structured-data.json`, `spec.json`.

### Tests (69 passing, 6 files, ~1.5s)

- `tests/business-schema.test.ts` — accepts valid businesses, rejects bad data.
- `tests/website-spec.test.ts` — valid spec, empty sections, semver, SEO length,
  footer limit, hero ordering, hex colors, all 14 section types.
- `tests/security.test.ts` — escape, escapeUrl, escapeJson, sanitizeUrl
  (rejects javascript:, data:, file:, vbscript:), phone normalization,
  WhatsApp links, email, slugify, truncate.
- `tests/renderer.test.ts` — complete document, XSS escaping, dangerous URL
  stripping, distinct themes per category, structured data JSON,
  phone/WhatsApp in hero, visible:false handling, skip link, stylesheet ref.
- `tests/category-profiles.test.ts` — composer omits sections without data,
  uses brand color, uses category default, end-to-end render.
- `tests/samples.test.ts` — walks `samples/`, every sample parses, renders,
  includes the real city, no lorem ipsum.

### Samples

- `samples/restaurant.json` — Sharma Family Restaurant, Prayagraj, veg, 5 services.
- `samples/salon.json` — Luxe Beauty Studio, Lucknow, 5 services.
- `samples/coaching.json` — Bright Minds Tutorials, Patna, 6 services.

### Output (rendered by `npm run render:all`)

| Sample | Sections | HTML size | CSS size |
|--------|----------|-----------|----------|
| restaurant | 9 (hero, about, services, location, hours, contact, cta, faq, footer) | ~16 KB | ~6 KB |
| salon     | 8 (hero, about, services, hours, location, contact, cta, footer) | ~14 KB | ~6 KB |
| coaching  | 8 (hero, about, services, hours, location, contact, cta, footer) | ~14 KB | ~6 KB |

All three pass:
- Lighthouse-style: 1 HTML file, 1 CSS file, 0 JS.
- Accessibility: skip link, semantic landmarks, focus styles, alt text required.
- XSS: any of the 6 XSS test cases in `security.test.ts` are neutralized.

## Decisions

- **No frameworks.** Hand-written CSS, no Tailwind/Bootstrap. Mobile-first.
- **TypeScript strict.** `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.
- **Zod over hand-rolled validation.** Schemas are the source of truth; types
  are inferred. If the spec changes, the renderer breaks at compile time.
- **escapeUrl is not escape.** `escape()` would corrupt valid URLs
  (`https:&#x2F;&#x2F;wa.me`); `escapeUrl` only escapes the 5 characters that
  can break out of an attribute.
- **Composer never invents.** If `hours` is missing, no hours section. If
  `services` is empty, no services section. If `description` is missing,
  the section is shorter. Truth in, truth out.

## Known Limitations (intentional for M1)

- No image hosting. The renderer references image URLs but does not download
  or process them. The samples use placeholder URLs.
- No analytics. The HTML has no Google Analytics / Plausible / etc.
- No domain mapping. The output is plain static files; the customer needs
  to host them somewhere.
- No AI generation. The input is hand-authored JSON. M2 wires up Claude.

## What's Next (Milestone 2)

1. **AI generation pipeline.** A small CLI that takes a category + a few
   user prompts, calls Claude, validates the result against `BusinessSchema`,
   and renders.
2. **Lighthouse CI.** Add a GitHub Action that runs Lighthouse on each
   sample and fails the build if scores drop.
3. **Image handling.** Either require the customer to upload, or integrate
   with a stock-photo API. (Deferred until M2's design review.)
4. **Form backend.** The contact section's "Email us" CTA links to
   `mailto:`. A real backend (Formspree, Resend) is M3.
