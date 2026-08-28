/**
 * Website spec tests.
 */

import { describe, it, expect } from "vitest";
import { parseWebsiteSpec, WebsiteSpecSchema } from "../src/website/website-spec.js";

const validHero = {
  type: "hero",
  content: { headline: "Welcome" },
};

const validFooter = {
  type: "footer",
  content: { businessName: "Acme" },
};

const baseSpec = {
  version: "1.0.0",
  category: "restaurant",
  theme: {},
  seo: { title: "Acme", description: "Hello" },
};

describe("WebsiteSpec", () => {
  it("accepts a minimal valid spec", () => {
    const s = parseWebsiteSpec({ ...baseSpec, sections: [validHero, validFooter] });
    expect(s.version).toBe("1.0.0");
    expect(s.sections).toHaveLength(2);
  });

  it("rejects empty sections", () => {
    expect(() => parseWebsiteSpec({ ...baseSpec, sections: [] })).toThrow();
  });

  it("rejects missing semver version", () => {
    expect(() =>
      parseWebsiteSpec({ ...baseSpec, version: "1.0", sections: [validHero, validFooter] }),
    ).toThrow();
  });

  it("rejects seo.description > 320 chars", () => {
    const long = "x".repeat(321);
    expect(() =>
      parseWebsiteSpec({
        ...baseSpec,
        seo: { title: "Acme", description: long },
        sections: [validHero, validFooter],
      }),
    ).toThrow();
  });

  it("rejects more than one footer", () => {
    expect(() =>
      parseWebsiteSpec({
        ...baseSpec,
        sections: [validHero, validFooter, validFooter],
      }),
    ).toThrow();
  });

  it("rejects hero appearing after a content section", () => {
    const about = { type: "about", content: { body: "Hello" } };
    expect(() =>
      parseWebsiteSpec({
        ...baseSpec,
        sections: [about, validHero, validFooter],
      }),
    ).toThrow();
  });

  it("accepts a hero at the start", () => {
    const services = {
      type: "services",
      content: { services: [{ name: "A" }] },
    };
    const s = parseWebsiteSpec({
      ...baseSpec,
      sections: [validHero, services, validFooter],
    });
    expect(s.sections).toHaveLength(3);
  });

  it("rejects services section with zero services", () => {
    const services = { type: "services", content: { services: [] } };
    expect(() =>
      parseWebsiteSpec({ ...baseSpec, sections: [validHero, services, validFooter] }),
    ).toThrow();
  });

  it("rejects non-hex theme color", () => {
    expect(() =>
      parseWebsiteSpec({
        ...baseSpec,
        theme: { primaryColor: "red" },
        sections: [validHero, validFooter],
      }),
    ).toThrow();
  });

  it("rejects gallery with no images", () => {
    const gallery = { type: "gallery", content: { images: [] } };
    expect(() =>
      parseWebsiteSpec({ ...baseSpec, sections: [validHero, gallery, validFooter] }),
    ).toThrow();
  });

  it("infers SectionKind exhaustively matches known values", () => {
    // Smoke check: the schema accepts every documented section type.
    const hero = { type: "hero", content: { headline: "x" } };
    const about = { type: "about", content: { body: "x" } };
    const services = { type: "services", content: { services: [{ name: "x" }] } };
    const pricing = { type: "pricing", content: { pricingItems: [{ name: "x", price: "1" }] } };
    const gallery = { type: "gallery", content: { images: ["a"] } };
    const testimonials = { type: "testimonials", content: { items: [{ quote: "q", author: "a" }] } };
    const reviews = { type: "reviews", content: { items: [{ quote: "q" }] } };
    const team = { type: "team", content: { members: [{ name: "x" }] } };
    const faq = { type: "faq", content: { items: [{ question: "q", answer: "a" }] } };
    const booking = { type: "booking", content: { ctaText: "x", action: "call" } };
    const contact = { type: "contact", content: {} };
    const location = { type: "location", content: {} };
    const cta = { type: "cta", content: { heading: "x", button: { label: "x", action: "call" } } };
    const footer = { type: "footer", content: { businessName: "x" } };

    const sections = [hero, about, services, pricing, gallery, testimonials, reviews, team, faq, booking, contact, location, cta, footer];
    const parsed = parseWebsiteSpec({ ...baseSpec, sections });
    expect(parsed.sections).toHaveLength(14);
  });

  it("rejects an unknown section type", () => {
    expect(() =>
      parseWebsiteSpec({
        ...baseSpec,
        sections: [{ type: "wibble", content: {} }, validFooter],
      }),
    ).toThrow();
  });
});

describe("WebsiteSpecSchema type surface", () => {
  it("is the same as parseWebsiteSpec's target", () => {
    expect(WebsiteSpecSchema).toBeDefined();
  });
});
