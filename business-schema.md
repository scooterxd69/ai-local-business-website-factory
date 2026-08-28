# BUSINESS SCHEMA — Structured Input from the Business Owner

This is the structured data the system collects from a local business. It is the source of truth for what the AI and renderer know about the business.

**Critical rule**: If a field is not provided, the system must not invent it.

---

## Top-level structure

```json
{
  "id": "uuid",
  "category": "restaurant | salon | coaching",
  "identity": { ... },
  "contact": { ... },
  "location": { ... },
  "hours": { ... },
  "services": [ ... ],
  "products": [ ... ],
  "brand": { ... },
  "media": { ... },
  "social": { ... },
  "extras": { ... }
}
```

---

## Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | Business name as customer knows it |
| tagline | string | recommended | Short, one-line description |
| description | string | recommended | 1-3 sentence overview |
| logo | media ref | optional | Logo image |
| category | enum | yes | restaurant / salon / coaching |
| yearEstablished | int | optional | For "Serving since YYYY" |
| ownerName | string | optional | For personalized touch |
| languages | array of string | optional | Languages spoken |

---

## Contact

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| phone | string | yes | E.164 format if possible, else local |
| phoneDisplay | string | recommended | Local format for display |
| email | string | optional | Public-facing email |
| whatsapp | string | recommended | WhatsApp number, often same as phone |
| enquiryEmail | string | optional | Different from personal email |

---

## Location

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| addressLine1 | string | yes | Street address |
| addressLine2 | string | optional | Building, suite, landmark |
| city | string | yes | |
| state | string | recommended | For India, the state |
| postalCode | string | recommended | |
| country | string | yes | Default: India |
| googleMapsUrl | string | optional | Pre-built share URL |
| googlePlaceId | string | optional | For map embedding |
| latitude | float | optional | If known |
| longitude | float | optional | If known |
| landmark | string | optional | "Near City Center Mall" |

---

## Hours

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| schedule | array | recommended | Per-day open/close |
| specialHours | string | optional | "Closed on public holidays" |

Each day entry:
```json
{
  "day": "monday",
  "open": "09:00",
  "close": "21:00",
  "closed": false
}
```

If not provided, system must not invent hours. Show "Hours not provided" or omit hours section.

---

## Services

Array of service objects:

```json
{
  "id": "uuid",
  "name": "string (required)",
  "description": "string (optional, AI can draft if not provided)",
  "price": "string (optional, e.g. '₹500', 'From ₹1000')",
  "duration": "string (optional, e.g. '30 mins')",
  "image": "media ref (optional)",
  "tags": "array of string (optional)"
}
```

Services are categorized by business type. For restaurant, this might be "menu items". For salon, "services". For coaching, "courses".

---

## Products

Optional. Same structure as services but for physical products (e.g. for a retail shop or restaurant takeaway).

---

## Brand

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| primaryColor | hex string | optional | If user wants specific color |
| accentColor | hex string | optional | |
| fontPreference | enum | optional | modern / classic / playful / bold |
| toneOfVoice | enum | optional | formal / friendly / warm / energetic |
| preferredStyle | string | optional | Free-text "minimal, photo-heavy" |
| existingWebsite | url | optional | Reference for style |

If brand fields are not provided, AI proposes a default theme appropriate to the category.

---

## Media

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| photos | array of media ref | recommended | Real business photos |
| logo | media ref | optional | |
| videoUrl | url | optional | For hero or about section |

Photos are essential. The renderer prefers real photography over AI-generated illustrations.

---

## Social

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| instagram | url | optional | |
| facebook | url | optional | |
| youtube | url | optional | |
| twitter | url | optional | |
| linkedin | url | optional | |
| googleBusinessUrl | url | optional | Google Business Profile |
| justdial | url | optional | India-specific |
| other | array of {platform, url} | optional | |

---

## Extras

Category-specific optional fields:

**Restaurant**:
- cuisineType, priceRange (₹/₹₹/₹₹₹), seatingCapacity, takeawayAvailable, deliveryAvailable, reservationUrl

**Salon**:
- serviceCategories (Hair, Skin, Nails, etc.), bookingUrl, walkInAvailable, gender (Unisex/Men/Women), homeService

**Coaching**:
- subjects (array), classSizes, mode (Online/Offline/Hybrid), batchStartDates, demoClassAvailable, resultsHighlights

---

## Validation rules

- Phone format validated per country.
- Email format validated.
- URL format validated.
- Hours validated: open < close unless closed.
- Coordinates validated if present.
- Services and products must have at least a name.
- Category is required and one of the supported list.
- Media uploads: max size, allowed formats.

---

## Storage

Stored in relational DB. Each business has its own record. Multiple businesses per user account (future).
