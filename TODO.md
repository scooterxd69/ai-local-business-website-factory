# TODO — Open Work Items

**Last Updated**: 2026-08-28
**Owner**: Laptop (planning) / PC (implementation)

---

## Before PC handoff (Laptop)

- [x] Create project directory
- [x] Write VISION.md
- [x] Write ARCHITECTURE.md
- [x] Write STATE.md
- [x] Write README.md
- [ ] Write DECISIONS.md
- [ ] Write mvp-scope.md
- [ ] Write business-schema.md
- [ ] Write website-schema.md
- [ ] Write design-system.md
- [ ] Write monetization.md
- [ ] Write competitive-research.md
- [ ] Draft 3 sample businesses for testing
- [ ] Create PC handoff in `docs/handoff/`
- [ ] Commit and push all planning artifacts

---

## After handoff (PC begins)

### Phase 1: Skeleton & Data Layer
- [ ] Recommend tech stack (backend, frontend, DB, hosting, AI)
- [ ] Set up project skeleton
- [ ] Implement business schema (models, validation)
- [ ] Set up database
- [ ] Implement onboarding UI (multi-step form)

### Phase 2: AI Engine
- [ ] Implement AI generation pipeline
- [ ] Define prompt templates per category
- [ ] Validate AI output against website-schema
- [ ] Implement AI never-fabricates safety rule

### Phase 3: Renderer
- [ ] Implement renderer reading website-schema JSON
- [ ] Apply design system rules
- [ ] Generate responsive HTML+CSS
- [ ] Implement section composition from category profiles

### Phase 4: Review & Editor
- [ ] Implement review stage
- [ ] Implement structured editor (text, sections, theme)
- [ ] Implement preview (live render)

### Phase 5: Publishing
- [ ] Implement publish flow
- [ ] Implement hosting (subdomain URLs)
- [ ] Basic analytics endpoint

### Phase 6: Quality & Testing
- [ ] Test with sample businesses (Restaurant, Salon, Coaching)
- [ ] Evaluate output against quality bar: "Would we show this to a paying business?"
- [ ] Fix issues before declaring MVP ready

---

## Future (post-MVP)

- [ ] Add more business categories
- [ ] Agency mode
- [ ] UPI / payment integration
- [ ] WhatsApp deep links
- [ ] Custom domains
- [ ] Multilingual content (Hindi)
- [ ] Maintenance subscription
- [ ] AI-driven content refreshes
