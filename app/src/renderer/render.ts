/**
 * Renderer — the public entry point.
 *
 * renderWebsite(spec, business) returns { html, css, assets, structuredData }.
 * The HTML is a complete document; the CSS is a single stylesheet; assets
 * is a map of file name → bytes for things like favicon placeholders.
 *
 * The renderer is a pure function: same input → same output. No I/O, no
 * global state. The CLI in src/cli/render.ts does the I/O.
 */

import type { Business } from "../business/business-schema.js";
import { escape, escapeJson, sanitizeUrl, truncate } from "../security/escape.js";
import type { Section, WebsiteSpec } from "../website/website-spec.js";
import { renderCss } from "./css.js";
import {
  renderAbout,
  renderBooking,
  renderContact,
  renderCtaBanner,
  renderFaq,
  renderFooter,
  renderGallery,
  renderHero,
  renderLocation,
  renderPricing,
  renderReviews,
  renderServices,
  renderTeam,
  renderTestimonials,
} from "./sections.js";
import { resolveTheme, type ResolvedTheme } from "./theme.js";

export interface RenderedSite {
  html: string;
  css: string;
  structuredData: string;
  assets: Record<string, { contentType: string; bytes: Uint8Array }>;
}

export function renderWebsite(spec: WebsiteSpec, business: Business): RenderedSite {
  const theme = resolveTheme(spec, business);
  const visibleSections = spec.sections.filter((s) => s.visible !== false);
  const hasFooter = visibleSections.some((s) => s.type === "footer");

  const bodyParts: string[] = [];

  for (const section of visibleSections) {
    bodyParts.push(renderSection(section, business, spec, theme));
  }

  // Always emit a footer.
  const footer = hasFooter
    ? visibleSections.find((s) => s.type === "footer")
    : undefined;
  bodyParts.push(renderFooter(footer, business, spec));

  const html = buildDocument(spec, business, theme, bodyParts.join("\n"));
  const css = renderCss(theme);
  const structuredData = buildStructuredData(spec, business);

  return {
    html,
    css,
    structuredData,
    assets: {}, // No binary assets in Milestone 1; placeholder for favicons later.
  };
}

function renderSection(
  section: Section,
  business: Business,
  spec: WebsiteSpec,
  theme: ResolvedTheme,
): string {
  switch (section.type) {
    case "hero":
      return renderHero(section, business, theme, spec.sections);
    case "about":
      return renderAbout(section);
    case "services":
      return renderServices(section, business);
    case "pricing":
      return renderPricing(section);
    case "gallery":
      return renderGallery(section);
    case "testimonials":
      return renderTestimonials(section);
    case "reviews":
      return renderReviews(section);
    case "team":
      return renderTeam(section);
    case "faq":
      return renderFaq(section);
    case "booking":
      return renderBooking(section, business, spec.sections);
    case "contact":
      return renderContact(section, business, spec, spec.sections);
    case "location":
      return renderLocation(section, business);
    case "cta":
      return renderCtaBanner(section, business, spec.sections);
    case "footer":
      // The footer is rendered separately by renderFooter.
      return "";
    default: {
      // Exhaustiveness check.
      const _exhaustive: never = section;
      void _exhaustive;
      return "";
    }
  }
}

function buildDocument(
  spec: WebsiteSpec,
  business: Business,
  _theme: ResolvedTheme,
  body: string,
): string {
  const title = escape(spec.seo.title);
  const description = escape(truncate(spec.seo.description, 320));
  const canonical = spec.seo.canonicalUrl ? sanitizeUrl(spec.seo.canonicalUrl) : "";
  const canonicalLink = canonical ? `<link rel="canonical" href="${escape(canonical)}" />` : "";
  const keywords = spec.seo.keywords?.length
    ? `<meta name="keywords" content="${escape(spec.seo.keywords.join(", "))}" />`
    : "";
  const ogImage = ""; // Placeholder for future og:image

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  ${keywords}
  ${canonicalLink}
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  ${ogImage}
  <meta name="theme-color" content="${escape(_theme.primaryColor)}" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
${body}
</body>
</html>
`;
}

function buildStructuredData(spec: WebsiteSpec, business: Business): string {
  // Schema.org LocalBusiness. This is also accessible as seo.structuredData,
  // but we always emit at least this baseline.
  const sd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.identity.name,
    ...(business.identity.tagline ? { description: business.identity.tagline } : {}),
    telephone: business.contact.phone,
    ...(business.contact.email ? { email: business.contact.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: [business.location.addressLine1, business.location.addressLine2]
        .filter(Boolean)
        .join(", "),
      addressLocality: business.location.city,
      addressRegion: business.location.state,
      postalCode: business.location.postalCode,
      addressCountry: business.location.country,
    },
    ...(business.location.googleMapsUrl
      ? { hasMap: business.location.googleMapsUrl }
      : {}),
    ...(spec.seo.structuredData ?? {}),
  };

  return JSON.stringify(sd, null, 2);
}
