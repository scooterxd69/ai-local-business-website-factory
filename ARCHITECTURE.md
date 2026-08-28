# ARCHITECTURE — High-Level System Design

This is the architecture document for the **AI Local Business Website Factory**. It is a blueprint for the PC's engineering work, not an implementation.

---

## Core principle: AI generates structured data, not raw HTML

The AI's job:
- Understand the business data.
- Select the right sections for the business category.
- Generate structured content for each section.
- Propose theme/style parameters.

The renderer's job:
- Read the structured specification.
- Apply the design system.
- Render clean, valid HTML with responsive CSS.
- Generate assets (images, icons) as needed.

This gives us:
- Predictable output.
- Editability.
- Validation.
- Reusability.

---

## Layered architecture

```
BUSINESS DATA (structured form)
        ↓
ONBOARDING UI (structured input, validation)
        ↓
AI GENERATION ENGINE (structured spec as JSON)
        ↓
STRUCTURED SPECIFICATION (validated JSON schema)
        ↓
REVIEW / EDITOR (structured editor for text, sections, theme)
        ↓
RENDERER (clean HTML + responsive CSS)
        ↓
PREVIEW (live rendered site in iframe or tab)
        ↓
PUBLISH (upload to hosting, assign public URL)
        ↓
HOSTING + ANALYTICS (basic analytics, performance tracking)
```

---

## Key data structures

See:
- [business-schema.md](./business-schema.md) — input from business owner.
- [website-schema.md](./website-schema.md) — structured spec rendered by renderer.

---

## Components (responsibility split)

### Business data layer
- Schema: identity, contact, services, location, hours, brand, media, social.
- Validation rules: required fields per category.
- Storage: database (recommend PostgreSQL or SQLite for MVP; PC to advise).

### Onboarding UI
- Multi-step form: identity → services → location → brand → review.
- Category selection drives section profile.
- Image upload with basic optimization.
- No prompts written by user.

### AI generation engine
- Prompt policy: structured prompt template with business data injected.
- AI provider: GPT-4-class or Claude-class model (PC to recommend).
- Output: structured JSON matching `website-schema.md`.
- Safety: never invent business facts.

### Structured specification
- Schema defined in `website-schema.md`.
- Sections selected by category profile.
- Theme parameters produced by AI or selected from palette.
- Content for each section: text, CTA, links.

### Renderer
- Reads structured JSON spec.
- Renders to HTML using design-system rules.
- Responsive CSS.
- Mobile-first.
- Clean, semantic HTML.
- No AI artifacts in output.

### Review / Editor
- User can edit text per section.
- User can reorder/remove sections.
- Theme adjustments (colors, fonts, buttons).
- Image replacement.
- Section visibility toggles.
- No full drag-and-drop builder required for MVP.

### Preview
- Rendered site shown as live preview.
- Mobile/desktop toggle.

### Publish
- Generate public URL (subdomain for MVP, custom domain later).
- Upload rendered files to hosting.
- Basic analytics: page views, form submissions.

---

## Section system

Websites are composed of sections selected by category profile:

```
Section Profile (e.g. "restaurant", "salon", "coaching")
  → Sections array (ordered list of section types with options)
```

Standard section types:
- Hero
- About
- Services
- Pricing
- Gallery
- Testimonials
- Team / Staff
- FAQ
- Booking / Appointment
- Contact
- Location / Map
- Call / WhatsApp CTA
- Footer

Each section receives structured data from the business input or AI output.

---

## Design system

The renderer applies a professional design strategy (see [design-system.md](./design-system.md)):

- Clean typography, strong hierarchy, good spacing.
- Photography-driven (not AI illustrations).
- Mobile-first responsive layout.
- No glassmorphism clutter, no meaningless animations.
- Professional color palettes (not random gradients).

---

## Storage / hosting architecture

**For MVP**, recommend:
- Simple hosting (static site hosting or lightweight server).
- No heavy database requirements for hosting layer (business data lives in DB; published site is static files + basic analytics endpoint).

**Future**:
- Custom domains.
- SSL (automatic with hosting provider).
- Analytics endpoint (lightweight).
- Maintenance mode for AI-driven updates.

---

## Security and privacy

- No secrets committed to repository.
- Business data stored securely.
- User content never shared without permission.
- Published sites only contain approved business information.
- No AI fabrication (see VISION).
