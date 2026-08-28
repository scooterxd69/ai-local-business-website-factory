/**
 * Website spec — the structured output of AI generation and the input
 * to the renderer. The renderer must not receive any other input shape.
 *
 * Source of truth: projects/ai-local-business-website-factory/website-schema.md
 *
 * Sections use a discriminated union on `type`. The renderer registry must
 * implement a renderer for every type listed in SectionType. Adding a new
 * section type requires (1) adding it to SectionType, (2) implementing
 * the renderer, and (3) updating the website-schema.md spec.
 */

import { z } from "zod";
import { HexColor } from "../business/business-schema.js";

// ---------- Theme ----------

export const FontFamily = z.enum(["modern", "serif", "sans-serif"]);
export const FontScale = z.enum(["compact", "standard", "spacious"]);
export const ButtonStyle = z.enum(["filled", "outlined", "minimal"]);
export const ImageTreatment = z.enum(["full-bleed", "contained", "rounded"]);

export const Theme = z.object({
  primaryColor: HexColor.optional(),
  accentColor: HexColor.optional(),
  backgroundColor: HexColor.optional(),
  textColor: HexColor.optional(),
  fontFamily: FontFamily.optional(),
  fontScale: FontScale.optional(),
  buttonStyle: ButtonStyle.optional(),
  imageTreatment: ImageTreatment.optional(),
});

// ---------- SEO ----------

export const Seo = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).max(320, "meta description must be ≤ 320 chars"),
  keywords: z.array(z.string().trim().min(1)).optional(),
  /** Schema.org structured data object. Validated as an arbitrary object;
   *  the renderer serializes it inside a <script type="application/ld+json">. */
  structuredData: z.record(z.string(), z.unknown()).optional(),
  canonicalUrl: z.string().url().optional(),
});

// ---------- CTA button ----------

export const CtaAction = z.enum(["call", "whatsapp", "scroll", "form", "externalLink", "map", "email"]);

export const CtaButton = z.object({
  label: z.string().trim().min(1),
  action: CtaAction,
  /** Optional target: e.g. a section id for "scroll", a URL for "externalLink", a phone for "call". */
  target: z.string().optional(),
});

// ---------- Common content shapes ----------

const ServiceItem = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const MediaRef = z.string().min(1);

// ---------- Section types ----------

export const SectionType = z.enum([
  "hero",
  "about",
  "services",
  "pricing",
  "gallery",
  "testimonials",
  "team",
  "faq",
  "booking",
  "contact",
  "location",
  "cta",
  "footer",
  "reviews",
]);

// Hero
const HeroContent = z.object({
  headline: z.string().trim().min(1),
  subheadline: z.string().optional(),
  description: z.string().optional(),
  primaryCta: CtaButton.optional(),
  secondaryCta: CtaButton.optional(),
  backgroundImage: MediaRef.optional(),
  overlay: z.enum(["light", "dark", "gradient", "none"]).optional(),
});

// About
const AboutContent = z.object({
  headline: z.string().optional(),
  body: z.string().min(1),
  image: MediaRef.optional(),
});

// Services (a.k.a. menu, courses)
const ServicesContent = z.object({
  heading: z.string().optional(),
  services: z.array(ServiceItem).min(1, "services section requires at least 1 service"),
  layout: z.enum(["cards", "list", "grid"]).optional(),
});

// Pricing
const PricingContent = z.object({
  heading: z.string().optional(),
  pricingItems: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        price: z.string().trim().min(1),
        description: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .min(1),
  note: z.string().optional(),
});

// Gallery
const GalleryContent = z.object({
  heading: z.string().optional(),
  images: z.array(MediaRef).min(1).max(24),
  layout: z.enum(["grid", "masonry", "carousel"]).optional(),
  captions: z.array(z.string()).optional(),
});

// Testimonials (curated quotes with author/role)
const TestimonialsContent = z.object({
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        quote: z.string().trim().min(1),
        author: z.string().trim().min(1),
        role: z.string().optional(),
        image: MediaRef.optional(),
        rating: z.number().int().gte(1).lte(5).optional(),
      }),
    )
    .min(1)
    .max(12),
  source: z.string().optional(),
});

// Reviews (e.g. aggregated Google reviews — a list of short quotes)
const ReviewsContent = z.object({
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        quote: z.string().trim().min(1),
        author: z.string().trim().min(1).optional(),
        rating: z.number().int().gte(1).lte(5).optional(),
        date: z.string().optional(),
      }),
    )
    .min(1)
    .max(24),
  aggregateRating: z
    .object({
      ratingValue: z.number().gte(0).lte(5),
      reviewCount: z.number().int().positive(),
    })
    .optional(),
  source: z.string().optional(),
});

// Team
const TeamContent = z.object({
  heading: z.string().optional(),
  members: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        role: z.string().optional(),
        bio: z.string().optional(),
        image: MediaRef.optional(),
      }),
    )
    .min(1),
});

// FAQ
const FaqContent = z.object({
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        question: z.string().trim().min(1),
        answer: z.string().trim().min(1),
      }),
    )
    .min(1)
    .max(24),
  category: z.string().optional(),
});

// Booking
const BookingContent = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().trim().min(1),
  action: CtaAction,
  target: z.string().optional(),
  formFields: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        label: z.string().trim().min(1),
        type: z.enum(["text", "email", "tel", "date", "textarea"]),
        required: z.boolean().optional(),
      }),
    )
    .optional(),
  note: z.string().optional(),
});

// Contact
const ContactContent = z.object({
  heading: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  mapUrl: z.string().optional(),
  mapEmbed: z.string().optional(),
  hours: z
    .array(
      z.object({
        day: z.string().trim().min(1),
        open: z.string(),
        close: z.string(),
        closed: z.boolean().optional(),
      }),
    )
    .optional(),
  form: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        label: z.string().trim().min(1),
        type: z.enum(["text", "email", "tel", "date", "textarea"]),
        required: z.boolean().optional(),
      }),
    )
    .optional(),
});

// Location
const LocationContent = z.object({
  heading: z.string().optional(),
  mapEmbed: z.string().optional(),
  address: z.string().trim().min(1).optional(),
  directions: z.string().optional(),
  transport: z.string().optional(),
});

// CTA banner
const CtaContent = z.object({
  heading: z.string().trim().min(1),
  description: z.string().optional(),
  button: CtaButton,
  background: z.string().optional(),
});

// Footer
const FooterContent = z.object({
  businessName: z.string().trim().min(1),
  tag: z.string().optional(),
  copyright: z.string().optional(),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        url: z.string(),
      }),
    )
    .optional(),
  social: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      googleBusinessUrl: z.string().optional(),
      justdial: z.string().optional(),
    })
    .partial()
    .optional(),
  quickLinks: z.array(z.string()).optional(),
});

// ---------- Section (discriminated union) ----------

const sectionBase = {
  id: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  visible: z.boolean().default(true),
  options: z.record(z.string(), z.unknown()).optional(),
};

export const Section = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), ...sectionBase, content: HeroContent }),
  z.object({ type: z.literal("about"), ...sectionBase, content: AboutContent }),
  z.object({ type: z.literal("services"), ...sectionBase, content: ServicesContent }),
  z.object({ type: z.literal("pricing"), ...sectionBase, content: PricingContent }),
  z.object({ type: z.literal("gallery"), ...sectionBase, content: GalleryContent }),
  z.object({ type: z.literal("testimonials"), ...sectionBase, content: TestimonialsContent }),
  z.object({ type: z.literal("reviews"), ...sectionBase, content: ReviewsContent }),
  z.object({ type: z.literal("team"), ...sectionBase, content: TeamContent }),
  z.object({ type: z.literal("faq"), ...sectionBase, content: FaqContent }),
  z.object({ type: z.literal("booking"), ...sectionBase, content: BookingContent }),
  z.object({ type: z.literal("contact"), ...sectionBase, content: ContactContent }),
  z.object({ type: z.literal("location"), ...sectionBase, content: LocationContent }),
  z.object({ type: z.literal("cta"), ...sectionBase, content: CtaContent }),
  z.object({ type: z.literal("footer"), ...sectionBase, content: FooterContent }),
]);

// ---------- WebsiteSpec (top-level) ----------

export const WebsiteSpecSchema = z
  .object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, "version must be semver, e.g. 1.0.0"),
    category: z.enum(["restaurant", "salon", "coaching"]),
    businessId: z.string().uuid().optional(),
    generatedAt: z.string().datetime({ offset: true }).optional(),
    theme: Theme,
    seo: Seo,
    sections: z.array(Section).min(1, "at least one section is required"),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((spec, ctx) => {
    // Exactly one footer at the end (or none — the renderer always appends
    // a default if missing). But two footers in the middle is silly.
    const footerCount = spec.sections.filter((s) => s.type === "footer").length;
    if (footerCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sections"],
        message: "at most one footer section is allowed",
      });
    }
    // Hero should appear before other content sections.
    const heroIdx = spec.sections.findIndex((s) => s.type === "hero");
    const nonHeroIdx = spec.sections.findIndex(
      (s) => s.type !== "hero" && s.type !== "footer",
    );
    if (heroIdx > 0 && nonHeroIdx >= 0 && heroIdx > nonHeroIdx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sections"],
        message: "hero should appear before other content sections",
      });
    }
  });

// ---------- Inferred types ----------

export type WebsiteSpec = z.infer<typeof WebsiteSpecSchema>;
export type Theme = z.infer<typeof Theme>;
export type Seo = z.infer<typeof Seo>;
export type Section = z.infer<typeof Section>;
export type CtaButton = z.infer<typeof CtaButton>;
export type CtaAction = z.infer<typeof CtaAction>;
export type SectionKind = z.infer<typeof SectionType>;

export function parseWebsiteSpec(input: unknown): WebsiteSpec {
  return WebsiteSpecSchema.parse(input);
}

export function safeParseWebsiteSpec(input: unknown): z.SafeParseReturnType<unknown, WebsiteSpec> {
  return WebsiteSpecSchema.safeParse(input);
}
