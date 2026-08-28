/**
 * Theme resolution.
 *
 * The renderer never renders a website without resolving a complete theme.
 * If the AI/user didn't supply a color or font, the renderer falls back to a
 * category-appropriate default from the design system.
 *
 * Source of truth: projects/ai-local-business-website-factory/design-system.md
 */

import type { z } from "zod";
import type { Theme, WebsiteSpec } from "../website/website-spec.js";
import type { Business, Category as CategorySchema } from "../business/business-schema.js";

type Category = z.infer<typeof CategorySchema>;

/** Resolved theme — every field is non-null. */
export interface ResolvedTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: "modern" | "serif" | "sans-serif";
  fontScale: "compact" | "standard" | "spacious";
  buttonStyle: "filled" | "outlined" | "minimal";
  imageTreatment: "full-bleed" | "contained" | "rounded";
}

/** Default palettes per category, from design-system.md. */
const CATEGORY_DEFAULTS: Record<Category, ResolvedTheme> = {
  restaurant: {
    primaryColor: "#8B1A1A", // Deep red
    accentColor: "#C2410C", // Burnt orange
    backgroundColor: "#FBF7F2", // Warm cream
    textColor: "#1F1A17", // Charcoal
    fontFamily: "serif",
    fontScale: "standard",
    buttonStyle: "filled",
    imageTreatment: "full-bleed",
  },
  salon: {
    primaryColor: "#5B7553", // Sage green
    accentColor: "#B08D57", // Soft gold
    backgroundColor: "#FAF8F3", // Off-white
    textColor: "#1F2520",
    fontFamily: "modern",
    fontScale: "spacious",
    buttonStyle: "filled",
    imageTreatment: "rounded",
  },
  coaching: {
    primaryColor: "#1E3A5F", // Navy
    accentColor: "#C2861F", // Warm gold
    backgroundColor: "#F8F6F1", // Off-white
    textColor: "#0F1A2A",
    fontFamily: "sans-serif",
    fontScale: "standard",
    buttonStyle: "filled",
    imageTreatment: "contained",
  },
};

/**
 * Resolve a complete theme for a business. Brand primaryColor / accentColor
 * from the business are preferred when present, then theme overrides, then
 * the category default.
 */
export function resolveTheme(spec: WebsiteSpec, business: Business): ResolvedTheme {
  return resolveThemeFromTheme(spec.theme, business);
}

/**
 * Same as resolveTheme, but takes the theme directly. Useful for the
 * composer, which doesn't have a fully-validated spec yet.
 */
export function resolveThemeFromTheme(theme: Theme, business: Business): ResolvedTheme {
  const fallback: ResolvedTheme = CATEGORY_DEFAULTS[business.category] ?? CATEGORY_DEFAULTS.restaurant;
  const brand = business.brand;
  const t: Theme = theme;

  return {
    primaryColor: t.primaryColor ?? brand?.primaryColor ?? fallback.primaryColor,
    accentColor: t.accentColor ?? brand?.accentColor ?? fallback.accentColor,
    backgroundColor: t.backgroundColor ?? fallback.backgroundColor,
    textColor: t.textColor ?? fallback.textColor,
    fontFamily: t.fontFamily ?? fallback.fontFamily,
    fontScale: t.fontScale ?? fallback.fontScale,
    buttonStyle: t.buttonStyle ?? fallback.buttonStyle,
    imageTreatment: t.imageTreatment ?? fallback.imageTreatment,
  };
}
