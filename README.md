# AI Local Business Website Factory

A product, not a demo.

The objective is to create a system that takes structured information about a real local business and produces a professional, mobile-responsive, sellable website in minutes — without requiring the customer to write prompts or understand AI.

> Laptop: Product Architect / Research / UX Lead  
> PC: Engineering / Backend / Implementation / Infrastructure

---

## Project Status

| Area | State |
|------|-------|
| Vision | Defined |
| MVP scope | Defined (3 business categories) |
| Business schema | Implemented + Zod validators |
| Website schema | Implemented + Zod validators |
| Architecture | Specified |
| UX flow | Drafted |
| Design system | Guidelines only |
| Renderer | Implemented (pure function, 14 section types) |
| Category profiles | Implemented (3 categories) |
| CLI | Implemented (`npm run render -- --business X --out Y`) |
| Tests | 69 passing (schemas, renderer, security, samples) |
| Sample data | 3 demos (restaurant, salon, coaching) |
| AI generation strategy | Defined (Milestone 2) |
| Monetization | Recommended |
| **Milestone 1** | **Complete** |

---

## Quick Links

- [VISION.md](./VISION.md) — what we are building and why
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the system fits together
- [STATE.md](./STATE.md) — current state of planning
- [TODO.md](./TODO.md) — open work items
- [DECISIONS.md](./DECISIONS.md) — key decisions and rationale
- [mvp-scope.md](./mvp-scope.md) — what the first version proves
- [business-schema.md](./business-schema.md) — structured business data model
- [website-schema.md](./website-schema.md) — structured website data model
- [design-system.md](./design-system.md) — design philosophy and rules
- [monetization.md](./monetization.md) — how the product makes money
- [competitive-research.md](./competitive-research.md) — landscape and gap
- [MILESTONE-1.md](./MILESTONE-1.md) — what shipped in Milestone 1 (renderer foundation)

## Try It

```bash
cd app
npm install
npm run render:all   # renders all 3 samples into ../dist/
npm test             # 69 tests, ~1.5s
```

Open `dist/restaurant/index.html` in a browser.

## Architecture (Milestone 1)

```
samples/*.json         ─┐
                        ├──> BusinessSchema (Zod) ──> Business
website-schema.md       ─┘
                         │
                         ▼
                  composeWebsiteSpec (per-category)
                         │
                         ▼
                  WebsiteSpec (validated) ──> renderWebsite ──> {html, css, structuredData, assets}
```

The renderer is the security boundary. All text goes through `escape()`,
all URLs through `sanitizeUrl()` + `escapeUrl()`. The composer never
invents business facts.

---

## Working Principles

1. **Quality over feature count.** A beautiful, reliable factory for 3 categories beats a broken one for 50.
2. **AI generates structured data, not raw HTML.** The renderer owns layout, AI owns content and configuration.
3. **No fabrication.** AI never invents business facts. Unknown = ask or omit.
4. **Human review before publish.** Every generated site is reviewed and approved.
5. **Would we show this to a paying business?** That is the bar.
