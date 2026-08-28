# WEBSITE SCHEMA — Structured Specification for Renderer

This is the output of the AI generation engine and the input to the renderer. It describes what the website should contain — sections, content, theme — without prescribing exact HTML layout.

---

## Top-level structure

```json
{
  "version": "1.0.0",
  "category": "restaurant | salon | coaching",
  "businessId": "uuid",
  "generatedAt": "ISO timestamp",
  "theme": { ... },
  "seo": { ... },
  "sections": [ ... ],
  "metadata": { ... }
}
```

---

## Theme

| Field | Type | Notes |
|-------|------|-------|
| primaryColor | hex | User-selected or AI-proposed |
| accentColor | hex | |
| backgroundColor | hex | Usually neutral |
| textColor | hex | |
| fontFamily | enum | modern / serif / sans-serif |
| fontScale | enum | compact / standard / spacious |
| buttonStyle | enum | filled / outlined / minimal |
| imageTreatment | enum | full-bleed / contained / rounded |

---

## SEO

| Field | Type | Notes |
|-------|------|-------|
| title | string | Page title |
| description | string | Meta description |
| keywords | array of string | Optional |
| structuredData | object | Schema.org LocalBusiness |
| canonicalUrl | url | Final published URL |

---

## Sections (ordered array)

Each section has:

```json
{
  "type": "hero | about | services | pricing | gallery | testimonials | team | faq | booking | contact | location | cta | footer | ...",
  "title": "string (optional, AI-proposed or user-edited)",
  "subtitle": "string (optional)",
  "visible": true,
  "content": { ... },
  "options": { ... }
}
```

---

## Section content types (examples)

**Hero**:
- headline (string)
- subheadline (string)
- description (string, optional short paragraph)
- primaryCta (button: {label, action: "call | whatsapp | scroll | form"})
- secondaryCta (optional button)
- backgroundImage (media ref, preferred real photo)
- overlay (light / dark / gradient for readability)

**About**:
- headline (optional)
- body (string, 2-4 paragraphs)
- image (media ref, preferred real photo of business/owner/space)

**Services**:
- services (array of {name, description, price?, duration?, image?, tags?})
- layout (cards / list / grid — renderer selects based on count and category)

**Pricing**:
- pricingItems (array of {name, price, description?, notes?})
- note (optional, e.g. "Prices may vary")

**Gallery**:
- images (array of media ref, 3-12 items)
- layout (grid / masonry / carousel — renderer decides)
- captions (optional per image)

**Testimonials**:
- items (array of {quote, author, role?, image?, rating?})
- source (optional — "Customer reviews")

**Team**:
- members (array of {name, role, bio?, image?})

**FAQ**:
- items (array of {question, answer})
- category (optional — group by topic)

**Booking**:
- ctaText (string)
- action (call | whatsapp | form | externalLink)
- formFields (optional — name, phone, service, date, message)
- note (optional — hours, response time)

**Contact**:
- phone, whatsapp, email, address (from business schema)
- mapUrl (optional)
- mapEmbed (optional — Google Maps embed URL)
- hours (optional — show hours here if not elsewhere)
- form (optional — enquiry form fields)

**Location**:
- mapEmbed
- address (formatted)
- directions (optional — nearest landmarks)
- transport (optional — parking, metro, bus)

**CTA** (call-to-action banner):
- headline
- description
- button (label + action)
- background (color or image)

**Footer**:
- businessName, tag (optional), copyright, links (social, privacy, terms)
- quickLinks (optional — sections that are important)

---

## Section profiles (category-specific selection)

The AI selects sections based on business category. Example profiles:

**Restaurant**: Hero, About, Services (Menu), Gallery, Reviews, Location, Contact, CTA, Footer
**Salon**: Hero, Services, Pricing, Gallery, Testimonials, Booking, Location, Contact, Footer
**Coaching**: Hero, About, Courses/Services, Results/Testimonials, Team, FAQ, Contact, CTA, Footer

The AI does not invent new section types. It selects from the registry and configures content.

---

## Validation rules

- Sections array is ordered; renderer respects order.
- Each section type is known to renderer.
- Content fields use the documented schema per section.
- Theme settings are valid (hex colors, known font family, etc.).
- No section has both `visible: false` and required content missing.
- SEO fields are required.
