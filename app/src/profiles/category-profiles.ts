/**
 * Category profiles.
 *
 * A "profile" is the default section composition for a business category.
 * The composer turns a Business into a complete, validated WebsiteSpec
 * by:
 *   1. Picking a section list appropriate to the category
 *   2. Building section content from the Business fields
 *   3. Resolving the theme from the Business's brand preferences and the
 *      category default
 *   4. Generating SEO title, description, and Schema.org structured data
 *
 * This module does not call any AI. It's the deterministic path that
 * proves the engine works. Milestone 3 will add an AI adapter that can
 * propose the section list and copy; until then, this is the spec.
 *
 * The composer MUST NOT invent business facts (DECISIONS.md D-003). If a
 * field is missing, the section is omitted.
 */

import type { Business } from "../business/business-schema.js";
import { escape, truncate, whatsappLink } from "../security/escape.js";
import {
  parseWebsiteSpec,
  type CtaAction,
  type Section,
  type Seo,
  type WebsiteSpec,
} from "../website/website-spec.js";
import { resolveThemeFromTheme, type ResolvedTheme } from "../renderer/theme.js";
import type { Theme } from "../website/website-spec.js";
import { Category } from "../business/business-schema.js";

type CategoryKey = "restaurant" | "salon" | "coaching";

const CATEGORY_PROFILES: Record<CategoryKey, string[]> = {
  restaurant: [
    "hero",
    "about",
    "services",
    "gallery",
    "reviews",
    "location",
    "contact",
    "cta",
  ],
  salon: [
    "hero",
    "about",
    "services",
    "pricing",
    "gallery",
    "testimonials",
    "booking",
    "location",
    "contact",
  ],
  coaching: [
    "hero",
    "about",
    "services",
    "testimonials",
    "team",
    "faq",
    "contact",
    "cta",
  ],
};

export interface ComposeOptions {
  /** Override the default section list. If unset, use the category profile. */
  sectionOrder?: string[];
  /** Override the auto-generated theme. */
  themeOverride?: Partial<Theme>;
  /** Override the auto-generated SEO. */
  seoOverride?: Partial<Seo>;
  /** businessId to embed in the spec. */
  businessId?: string | undefined;
}

/**
 * Compose a complete WebsiteSpec from a Business.
 *
 * Throws ZodError if the resulting spec is invalid.
 */
export function composeWebsiteSpec(
  business: Business,
  options: ComposeOptions = {},
): WebsiteSpec {
  // Resolve the theme up front so the section builders can use it.
  const resolved: ResolvedTheme = resolveThemeFromTheme(options.themeOverride ?? {}, business);

  const order = options.sectionOrder ?? CATEGORY_PROFILES[business.category];
  if (!order) {
    throw new Error(`No section profile for category: ${business.category}`);
  }

  const sections: Section[] = [];
  for (const id of order) {
    const built = sectionBuilders[id];
    if (!built) {
      throw new Error(`No section builder for section id: ${id}`);
    }
    const section = built(id, business, resolved);
    if (section) sections.push(section);
  }

  const seo: Seo = {
    title: options.seoOverride?.title ?? composeTitle(business),
    description: options.seoOverride?.description ?? composeDescription(business),
    keywords: options.seoOverride?.keywords,
    structuredData: options.seoOverride?.structuredData,
    canonicalUrl: options.seoOverride?.canonicalUrl,
  };

  const spec: WebsiteSpec = parseWebsiteSpec({
    version: "1.0.0",
    category: business.category,
    businessId: options.businessId ?? business.id,
    generatedAt: new Date().toISOString(),
    theme: themeToWire(resolved, options.themeOverride),
    seo,
    sections,
  });

  return spec;
}

function themeToWire(resolved: ResolvedTheme, override?: Partial<Theme>): Theme {
  return {
    primaryColor: override?.primaryColor ?? resolved.primaryColor,
    accentColor: override?.accentColor ?? resolved.accentColor,
    backgroundColor: override?.backgroundColor ?? resolved.backgroundColor,
    textColor: override?.textColor ?? resolved.textColor,
    fontFamily: override?.fontFamily ?? resolved.fontFamily,
    fontScale: override?.fontScale ?? resolved.fontScale,
    buttonStyle: override?.buttonStyle ?? resolved.buttonStyle,
    imageTreatment: override?.imageTreatment ?? resolved.imageTreatment,
  };
}

function composeTitle(b: Business): string {
  const parts: string[] = [b.identity.name];
  if (b.identity.tagline) parts.push(b.identity.tagline);
  const city = b.location.city;
  if (city) parts.push(city);
  return parts.join(" — ").slice(0, 70);
}

function composeDescription(b: Business): string {
  const desc = b.identity.description ?? b.identity.tagline ?? "";
  if (!desc) return `${b.identity.name} in ${b.location.city}.`;
  return truncate(desc, 320);
}

// ---------- Section builders ----------
// Each builder is `(id, business, theme) => Section | null`. Returning null
// skips the section (because the data is missing).

type Builder = (id: string, b: Business, theme: ResolvedTheme) => Section | null;

const sectionBuilders: Record<string, Builder> = {
  hero: (id, b) => ({
    type: "hero",
    id: id,
    title: b.identity.name,
    visible: true,
    content: {
      headline: b.identity.tagline ?? b.identity.name,
      subheadline: b.location.city ? `${b.location.city}, ${b.location.country}` : undefined,
      primaryCta: { label: "Call us", action: "call" as CtaAction },
      secondaryCta: b.contact.whatsapp
        ? { label: "WhatsApp", action: "whatsapp" as CtaAction }
        : undefined,
      backgroundImage: b.media?.photos?.[0],
      overlay: b.media?.photos?.[0] ? "dark" : "gradient",
    },
  }),

  about: (id, b) => {
    const body = b.identity.description ?? b.identity.tagline ?? "";
    if (!body) return null;
    return {
      type: "about",
      id: id,
      title: "About",
      visible: true,
      content: {
        headline: b.identity.tagline ?? `About ${b.identity.name}`,
        body,
        image: b.media?.photos?.[1],
      },
    };
  },

  services: (id, b) => {
    const services = b.services ?? b.products ?? [];
    if (services.length === 0) return null;
    return {
      type: "services",
      id: id,
      title: "Our menu", // overridden per-category below
      visible: true,
      content: {
        heading: servicesHeading(b),
        services: services.map((s) => ({
          name: s.name,
          description: s.description,
          price: s.price,
          duration: s.duration,
          image: s.image,
          tags: s.tags,
        })),
        layout: services.length > 6 ? "grid" : "cards",
      },
    };
  },

  pricing: (id, b) => {
    const services = b.services ?? [];
    const priced = services.filter((s) => s.price && s.price.length > 0);
    if (priced.length === 0) return null;
    return {
      type: "pricing",
      id: id,
      title: "Pricing",
      visible: true,
      content: {
        heading: "Pricing",
        pricingItems: priced.map((s) => ({
          name: s.name,
          price: s.price ?? "",
          description: s.description,
        })),
        note: "Prices are indicative. Please confirm with us for the latest.",
      },
    };
  },

  gallery: (id, b) => {
    const photos = b.media?.photos ?? [];
    if (photos.length === 0) return null;
    return {
      type: "gallery",
      id: id,
      title: "Gallery",
      visible: true,
      content: {
        heading: "Gallery",
        images: photos.slice(0, 12),
        layout: photos.length > 8 ? "masonry" : "grid",
        captions: [],
      },
    };
  },

  testimonials: (id, b) => {
    // We don't invent testimonials; only render them if business.media.testimonials exist.
    // (Future: this would also accept a curated list from the AI.)
    return null;
  },

  reviews: (id, b) => {
    return null;
  },

  team: (id, b) => {
    // The Business schema doesn't have a "team" list (yet). We synthesize
    // a single team member from ownerName if present.
    if (!b.identity.ownerName) return null;
    return {
      type: "team",
      id: id,
      title: "Meet the owner",
      visible: true,
      content: {
        heading: "Meet the owner",
        members: [
          {
            name: b.identity.ownerName,
            role: "Owner",
            image: b.media?.photos?.[2],
          },
        ],
      },
    };
  },

  faq: (id, b) => {
    // Compose a small FAQ from real business data — no fabrication.
    const items: Array<{ question: string; answer: string }> = [];
    if (b.hours?.schedule) {
      items.push({
        question: "What are your hours?",
        answer: hoursAnswer(b),
      });
    }
    if (b.location.addressLine1) {
      items.push({
        question: "Where are you located?",
        answer: `We are at ${b.location.addressLine1}, ${b.location.city}${b.location.state ? ", " + b.location.state : ""}.${b.location.landmark ? " Look for: " + b.location.landmark + "." : ""}`,
      });
    }
    if (b.contact.phone) {
      items.push({
        question: "How do I contact you?",
        answer: `Call us at ${b.contact.phoneDisplay ?? b.contact.phone}${b.contact.whatsapp ? " or message us on WhatsApp." : "."}`,
      });
    }
    if (items.length === 0) return null;
    return {
      type: "faq",
      id: id,
      title: "Frequently asked questions",
      visible: true,
      content: {
        heading: "Frequently asked questions",
        items,
      },
    };
  },

  booking: (id, b) => {
    const wa = whatsappLink(b.contact.whatsapp ?? b.contact.phone);
    const phone = b.contact.phone;
    if (!wa && !phone) return null;
    return {
      type: "booking",
      id: id,
      title: "Book an appointment",
      visible: true,
      content: {
        heading: "Book an appointment",
        description: "Tap the button below to reach us directly. We'll confirm your slot.",
        ctaText: wa ? "Book on WhatsApp" : "Call to book",
        action: wa ? ("whatsapp" as CtaAction) : ("call" as CtaAction),
      },
    };
  },

  contact: (id, b) => {
    return {
      type: "contact",
      id: id,
      title: "Contact",
      visible: true,
      content: {
        heading: "Contact us",
        phone: b.contact.phoneDisplay ?? b.contact.phone,
        whatsapp: b.contact.whatsapp ?? b.contact.phone,
        email: b.contact.email,
        address: fullAddress(b),
        mapUrl: b.location.googleMapsUrl,
        hours: b.hours?.schedule?.map((s) => ({
          day: s.day,
          open: s.open,
          close: s.close,
          closed: s.closed,
        })),
      },
    };
  },

  location: (id, b) => {
    return {
      type: "location",
      id: id,
      title: "Find us",
      visible: true,
      content: {
        heading: "Find us",
        address: fullAddress(b),
        mapEmbed: b.location.googleMapsUrl,
        directions: b.location.landmark ? `Landmark: ${b.location.landmark}` : undefined,
      },
    };
  },

  cta: (id, b) => {
    const phone = b.contact.phone;
    const wa = whatsappLink(b.contact.whatsapp ?? b.contact.phone);
    if (!phone && !wa) return null;
    return {
      type: "cta",
      id: id,
      title: "Get in touch",
      visible: true,
      content: {
        heading: `Ready to visit ${b.identity.name}?`,
        description: b.identity.tagline,
        button: wa
          ? { label: "Chat on WhatsApp", action: "whatsapp" as CtaAction }
          : { label: "Call us", action: "call" as CtaAction },
      },
    };
  },
};

function fullAddress(b: Business): string {
  return [
    b.location.addressLine1,
    b.location.addressLine2,
    b.location.city,
    b.location.state,
    b.location.postalCode,
  ]
    .filter((s): s is string => !!s && s.length > 0)
    .join(", ");
}

function hoursAnswer(b: Business): string {
  if (!b.hours?.schedule) return "";
  return b.hours.schedule
    .map((s) => {
      if (s.closed) return `${s.day} closed`;
      return `${s.day} ${s.open} – ${s.close}`;
    })
    .join("; ");
}

function servicesHeading(b: Business): string {
  if (b.category === "restaurant") return "Menu";
  if (b.category === "salon") return "Services";
  if (b.category === "coaching") return "Courses";
  return "What we offer";
}

export { sectionBuilders as _sectionBuilders };
