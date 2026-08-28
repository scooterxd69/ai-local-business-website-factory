# AI Local Business Website Factory — App (PC implementation)

This directory contains the PC-engineered application. The laptop owns product planning in `../` (schemas, design system, samples); this folder turns those specifications into working code.

## Layout

```
app/
├── src/
│   ├── business/    # business-schema.ts — TS types + Zod validators for Business
│   ├── website/     # website-spec.ts   — TS types + Zod validators for WebsiteSpec
│   ├── profiles/    # category-profiles — default section composition per category
│   ├── renderer/    # pure WebsiteSpec → {html, css, assets}
│   ├── security/    # HTML escape, URL allowlist, content sanitization
│   └── cli/         # render CLI
├── tests/           # vitest tests
├── samples/         # symlinked or copied from ../samples
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .env.example
```

## Milestone 1 scope

- Business schema and Zod validation.
- Website spec schema and Zod validation, with discriminated section union.
- Section-based renderer (HTML + CSS, framework-free).
- Category profile composer (Restaurant / Salon / Coaching).
- CLI: render a sample business to a directory of static files.
- Vitest: schema, renderer, security, sample-render tests.

The renderer reads the laptop's `website-schema.md` exactly — sections, theme, SEO. It does **not** accept raw HTML from any source. All user/AI content is escaped at the render boundary.

## Run

```bash
cd app
npm install
npm run typecheck
npm test
npm run render:all
```

Outputs land in `../dist/{restaurant,salon,coaching}/`. Open `dist/restaurant/index.html` in a browser for the live preview.

## What is NOT in Milestone 1

- AI generation (Milestone 3).
- Editor UI (Milestone 4).
- Publishing / hosting (Milestone 5).
- Database (Milestone 2 introduces SQLite + Prisma when persistence becomes necessary).

Milestone 1 proves the *thesis path*: structured business data → structured WebsiteSpec → validated render → preview.
