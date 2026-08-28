# DECISIONS — Key Product & Engineering Decisions

This document records decisions made during the planning phase. Each decision includes rationale and what it implies for implementation.

---

## D-001: AI outputs structured JSON, not raw HTML

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: The AI generation layer produces a structured JSON specification (matching `website-schema.md`) describing sections, content, and theme. The renderer converts that spec into HTML/CSS.

**Rationale**:
- Predictable output.
- Editable in a structured editor.
- Validatable.
- Reusable across categories.
- Avoids "AI made the HTML" quality problems.

**Consequences**:
- Renderer must be flexible enough to handle all section types.
- Section types must be predefined; AI cannot invent arbitrary HTML structures.
- Validation between AI output and renderer input becomes a hard requirement.

---

## D-002: MVP limited to 3 business categories

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: MVP supports only **Restaurant, Salon, Coaching Institute**.

**Rationale**:
- Quality > feature count. Three categories built well beats thirty broken ones.
- These categories cover a wide range of section types (menu, services, courses, gallery, etc.) and stress-test the section system.
- Easy to obtain realistic sample data.
- Repeatable template logic per category.

**Consequences**:
- Category profile system must be extensible so new categories can be added later.
- First onboarding flow must include category selection.
- Pricing experiments are constrained to these three for MVP.

---

## D-003: AI never fabricates business facts

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: If the business did not provide a fact, the system must not invent it. Unknown information is either omitted or marked for user review.

**Rationale**:
- Trust is the product.
- Fabricated opening hours, fake reviews, or invented services cause real harm to real businesses.
- A website that is honest feels professional; a website that lies is unusable.

**Consequences**:
- AI prompts must be explicit about what is provided vs. what is unknown.
- Review stage surfaces any unverified content for user approval.
- Renderer must handle missing fields gracefully (e.g. omit testimonials if none provided).

---

## D-004: Mandatory human review before publish

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: Every generated site must go through an explicit review/edit/approve stage before publish. No auto-publish.

**Rationale**:
- Generated content can be subtly wrong.
- Business owner must own the final wording.
- Review protects against hallucinations and errors.

**Consequences**:
- Editor UX is a first-class concern, not a stretch feature.
- Publish flow is gated on explicit approval.

---

## D-005: Section-based composition, not single template

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: Websites are composed of discrete sections (Hero, Services, Gallery, etc.) selected by category profile. No single universal template.

**Rationale**:
- Different business types need different sections.
- A restaurant needs a menu; a coaching institute needs courses; a salon needs services + pricing.
- Composable sections make editing natural.
- Section reuse reduces maintenance.

**Consequences**:
- Renderer must support a section registry with type-specific templates.
- AI's job is to select and configure sections, not invent layouts.
- Each section type is a known component with documented inputs.

---

## D-006: India-first design, i18n-ready architecture

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: Initial product targets Indian local businesses. Architecture supports i18n from day 1 but does not require translation in MVP.

**Rationale**:
- The market is real, underserved, and locally relevant.
- WhatsApp, UPI, Google Maps, and INR pricing are first-class considerations.
- Building for international is not required to start.

**Consequences**:
- Phone formats, currency, map providers default to India.
- Content generation can default to English; Hindi is a later feature.
- Pricing strategy uses INR.

---

## D-007: Editor is structured, not drag-and-drop

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: MVP editor is a structured editor (text fields, section toggle, theme controls). Not a free-form drag-and-drop website builder.

**Rationale**:
- Free-form builders are massive engineering projects.
- Most business owners want to edit text, swap photos, and reorder sections — not design from scratch.
- Structured editor keeps the design system intact.

**Consequences**:
- The renderer owns layout, not the user.
- Users can change content and reorder but not break the design system.
- Drag-and-drop is a possible future addition.

---

## D-008: AI generation is "propose, don't surprise"

**Date**: 2026-08-28
**Status**: Accepted
**Deciders**: Laptop

**Decision**: AI proposes website structure, content, and theme. User reviews and approves. AI does not auto-publish.

**Rationale**:
- Surprise publishing is dangerous.
- User agency is the product's promise.

**Consequences**:
- All AI output is reviewable, editable, and approvable.
- Review step is the trust boundary.
