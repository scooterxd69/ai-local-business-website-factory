# STATE — Current State of Planning

**Last Updated**: 2026-08-28
**Owner**: Laptop (Workshop Explorer)

---

## Phase

**Planning → Specification**. No implementation has started on either machine.

The laptop is responsible for:
- Product definition
- Research
- UX
- Architecture specification
- Business and website schemas
- Design system
- Documentation
- PC handoff

The PC will be responsible for:
- Backend implementation
- Frontend implementation (after spec is locked)
- AI generation pipeline
- Renderer
- Storage
- Deployment

---

## What is locked

- Product name: **AI Local Business Website Factory**
- Product thesis: structured business data → composed website sections → rendered site
- MVP categories: **Restaurant, Salon, Coaching Institute** (3 only)
- AI output: **structured JSON spec**, not raw HTML
- Render model: **section-based composition** with category-specific section profiles
- Review stage: **mandatory before publish**
- Honesty rule: **AI never fabricates business facts**
- Initial geography: **India-first**, but architecture i18n-ready
- Initial pricing posture: **hybrid** (small setup fee + maintenance subscription) — see monetization.md

---

## What is still open

| Topic | Owner | Status |
|-------|-------|--------|
| Tech stack for backend | PC | PC will recommend |
| Tech stack for renderer | PC | PC will recommend |
| Database choice | PC | PC will recommend |
| Hosting target | PC | PC will recommend |
| AI provider + prompt policy | Both | Draft in AI strategy doc |
| Editor UX (structured vs lightweight drag-and-drop) | Laptop | Recommended structured for MVP |
| Sample businesses for testing | Laptop | Will draft |
| Exact pricing numbers | Laptop | Recommended ranges, not locked |

---

## Active work right now

- Laptop finalizing planning documents and PC handoff.
- PC not yet engaged on this project. Handoff will be created in `docs/handoff/`.

---

## Next laptop actions

1. Finalize `mvp-scope.md`, `business-schema.md`, `website-schema.md`, `design-system.md`, `monetization.md`, `competitive-research.md`.
2. Create `docs/handoff/2026-08-28-ai-local-business-website-factory.md`.
3. Commit and push planning artifacts.
4. Wait for PC to begin implementation.

---

## Next PC actions (after handoff)

1. Read handoff document.
2. Recommend tech stack (backend, frontend, database, hosting, AI provider).
3. Stand up the project skeleton.
4. Implement business schema storage and onboarding flow.
5. Implement renderer.
6. Implement AI generation pipeline (structured spec).
7. Implement review/edit/publish.
8. Deploy a working MVP for 1 category first, then expand to 3.
