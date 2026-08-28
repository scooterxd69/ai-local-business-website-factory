/**
 * Business schema — the structured input the business owner provides.
 *
 * Source of truth: projects/ai-local-business-website-factory/business-schema.md
 *
 * Honesty rule (DECISIONS.md D-003 / brief item 14):
 *   If a field is not provided, the system must NOT invent it. Unknown =
 *   ask or omit. This file enforces "not provided" by making everything
 *   except a small required set optional, and by validating that, e.g.,
 *   the hours schedule is consistent.
 */

import { z } from "zod";

// ---------- Primitives ----------

/** Hex color, e.g. "#1E3A5F". */
export const HexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "must be a 6-digit hex color");

/** E.164 or local phone string. We do not require strict E.164 for MVP. */
export const Phone = z.string().min(7).max(32);

/** URL or empty. We do not require absolute URLs for fields the user may leave blank. */
export const OptionalUrl = z
  .string()
  .url()
  .or(z.literal(""))
  .optional();

/** Non-empty string, trimmed. */
const RequiredString = z.string().trim().min(1, "must not be empty");
const OptionalString = z.string().trim().optional();

// ---------- Identity ----------

export const Category = z.enum(["restaurant", "salon", "coaching"]);

export const Identity = z.object({
  name: RequiredString,
  tagline: OptionalString,
  description: OptionalString,
  logo: OptionalString, // media ref
  category: Category,
  yearEstablished: z.number().int().gte(1800).lte(2100).optional(),
  ownerName: OptionalString,
  languages: z.array(z.string().trim().min(1)).optional(),
});

// ---------- Contact ----------

export const Contact = z.object({
  phone: Phone,
  phoneDisplay: OptionalString,
  email: z.string().email().or(z.literal("")).optional(),
  whatsapp: Phone.optional(),
  enquiryEmail: z.string().email().or(z.literal("")).optional(),
});

// ---------- Location ----------

export const Location = z.object({
  addressLine1: RequiredString,
  addressLine2: OptionalString,
  city: RequiredString,
  state: OptionalString,
  postalCode: OptionalString,
  country: RequiredString,
  googleMapsUrl: OptionalUrl,
  googlePlaceId: OptionalString,
  latitude: z.number().gte(-90).lte(90).optional(),
  longitude: z.number().gte(-180).lte(180).optional(),
  landmark: OptionalString,
});

// ---------- Hours ----------

/** 24-hour "HH:MM" time. */
const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be HH:MM");

export const DayName = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const DaySchedule = z
  .object({
    day: DayName,
    open: Time,
    close: Time,
    closed: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    // open must be < close unless closed.
    if (!value.closed) {
      const [oh, om] = value.open.split(":").map(Number);
      const [ch, cm] = value.close.split(":").map(Number);
      const open = (oh ?? 0) * 60 + (om ?? 0);
      const close = (ch ?? 0) * 60 + (cm ?? 0);
      if (open >= close) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["close"],
          message: "close must be after open (or set closed=true)",
        });
      }
    }
  });

export const Hours = z.object({
  schedule: z.array(DaySchedule).max(7).optional(),
  specialHours: OptionalString,
});

// ---------- Services / Products ----------

export const Service = z.object({
  id: z.string().optional(),
  name: RequiredString,
  description: OptionalString,
  price: OptionalString,
  duration: OptionalString,
  image: OptionalString,
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const Product = Service; // Same shape; semantically different.

// ---------- Brand ----------

export const FontPreference = z.enum(["modern", "classic", "playful", "bold"]);
export const ToneOfVoice = z.enum(["formal", "friendly", "warm", "energetic"]);

export const Brand = z.object({
  primaryColor: HexColor.optional(),
  accentColor: HexColor.optional(),
  fontPreference: FontPreference.optional(),
  toneOfVoice: ToneOfVoice.optional(),
  preferredStyle: OptionalString,
  existingWebsite: OptionalUrl,
});

// ---------- Media ----------

export const Media = z.object({
  photos: z.array(z.string().trim().min(1)).optional(),
  logo: OptionalString,
  videoUrl: OptionalUrl,
});

// ---------- Social ----------

export const Social = z.object({
  instagram: OptionalUrl,
  facebook: OptionalUrl,
  youtube: OptionalUrl,
  twitter: OptionalUrl,
  linkedin: OptionalUrl,
  googleBusinessUrl: OptionalUrl,
  justdial: OptionalUrl,
  other: z
    .array(
      z.object({
        platform: RequiredString,
        url: z.string().url(),
      }),
    )
    .optional(),
});

// ---------- Extras (category-specific) ----------

const RestaurantExtras = z.object({
  cuisineType: z.array(z.string().trim().min(1)).optional(),
  priceRange: z.enum(["₹", "₹₹", "₹₹₹", "₹₹₹₹"]).optional(),
  seatingCapacity: z.number().int().positive().optional(),
  takeawayAvailable: z.boolean().optional(),
  deliveryAvailable: z.boolean().optional(),
  reservationUrl: OptionalUrl,
});

const SalonExtras = z.object({
  serviceCategories: z.array(z.string().trim().min(1)).optional(),
  bookingUrl: OptionalUrl,
  walkInAvailable: z.boolean().optional(),
  gender: z.enum(["Unisex", "Men", "Women"]).optional(),
  homeService: z.boolean().optional(),
});

const CoachingExtras = z.object({
  subjects: z.array(z.string().trim().min(1)).optional(),
  classSizes: OptionalString,
  mode: z.enum(["Online", "Offline", "Hybrid"]).optional(),
  batchStartDates: z.array(z.string()).optional(),
  demoClassAvailable: z.boolean().optional(),
  resultsHighlights: OptionalString,
});

export const Extras = z.union([RestaurantExtras, SalonExtras, CoachingExtras]).optional();

// ---------- Business (top-level) ----------

export const BusinessSchema = z
  .object({
    id: z.string().uuid().optional(),
    category: Category,
    identity: Identity,
    contact: Contact,
    location: Location,
    hours: Hours.optional(),
    services: z.array(Service).optional(),
    products: z.array(Product).optional(),
    brand: Brand.optional(),
    media: Media.optional(),
    social: Social.optional(),
    extras: Extras,
  })
  .superRefine((business, ctx) => {
    // The category in identity and the top-level category must match.
    if (business.identity.category !== business.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identity", "category"],
        message: "identity.category must match top-level category",
      });
    }

    // At least one service or product must be present (the renderer needs
    // something to put in the menu/services section).
    const hasServices = (business.services?.length ?? 0) > 0;
    const hasProducts = (business.products?.length ?? 0) > 0;
    if (!hasServices && !hasProducts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["services"],
        message:
          "At least one service or product is required. " +
          "The renderer cannot compose a menu/services section without it.",
      });
    }

    // If a location is given without city, the location validation already
    // caught that. Here we double-check that the city is non-empty.
    if (!business.location.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location", "city"],
        message: "city is required",
      });
    }
  });

// ---------- Inferred TypeScript types ----------

export type Business = z.infer<typeof BusinessSchema>;
export type Identity = z.infer<typeof Identity>;
export type Contact = z.infer<typeof Contact>;
export type Location = z.infer<typeof Location>;
export type DaySchedule = z.infer<typeof DaySchedule>;
export type Service = z.infer<typeof Service>;
export type Brand = z.infer<typeof Brand>;

/**
 * Parse and validate a Business object. Throws ZodError on failure.
 * Use safeParseBusiness in production code paths.
 */
export function parseBusiness(input: unknown): Business {
  return BusinessSchema.parse(input);
}

export function safeParseBusiness(input: unknown): z.SafeParseReturnType<unknown, Business> {
  return BusinessSchema.safeParse(input);
}
