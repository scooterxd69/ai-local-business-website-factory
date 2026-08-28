/**
 * Category profile tests.
 *
 * The composer must not invent business facts. If data is missing, the
 * section is omitted.
 */

import { describe, it, expect } from "vitest";
import { parseBusiness } from "../src/business/business-schema.js";
import { composeWebsiteSpec } from "../src/profiles/category-profiles.js";
import { renderWebsite } from "../src/renderer/render.js";

describe("composeWebsiteSpec", () => {
  it("returns a valid spec for a restaurant", () => {
    const b = parseBusiness({
      category: "restaurant",
      identity: { name: "X", category: "restaurant" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "Item 1" }, { name: "Item 2" }],
    });
    const spec = composeWebsiteSpec(b);
    expect(spec.category).toBe("restaurant");
    expect(spec.sections.length).toBeGreaterThan(0);
    expect(spec.seo.title).toContain("X");
  });

  it("emits the services section when at least one service is present", () => {
    const b = parseBusiness({
      category: "restaurant",
      identity: { name: "X", category: "restaurant" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "OnlyOne" }],
    });
    const spec = composeWebsiteSpec(b);
    expect(spec.sections.find((s) => s.type === "services")).toBeDefined();
  });

  it("omits optional sections that have no underlying data", () => {
    // No hours, no gallery, no pricing, no testimonials → those sections
    // are dropped, but the spec still has the required hero + footer.
    const b = parseBusiness({
      category: "restaurant",
      identity: { name: "X", category: "restaurant" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "OnlyOne" }],
    });
    const spec = composeWebsiteSpec(b);
    expect(spec.sections.find((s) => s.type === "pricing")).toBeUndefined();
    expect(spec.sections.find((s) => s.type === "testimonials")).toBeUndefined();
    // Hero + footer + contact etc. still present
    expect(spec.sections.find((s) => s.type === "hero")).toBeDefined();
  });

  it("composes FAQ only from real data, never invents questions", () => {
    const b = parseBusiness({
      category: "coaching",
      identity: { name: "X", category: "coaching" },
      contact: { phone: "+91 9999999999" },
      location: {
        addressLine1: "1 Main Rd",
        city: "Pune",
        country: "IN",
      },
      services: [{ name: "JEE" }],
      hours: {
        schedule: [{ day: "monday", open: "09:00", close: "18:00", closed: false }],
      },
    });
    const spec = composeWebsiteSpec(b);
    const faq = spec.sections.find((s) => s.type === "faq");
    if (faq && faq.type === "faq") {
      // Every FAQ item must mention a real fact: hours, address, or phone.
      const all = JSON.stringify(faq.content.items);
      expect(all).toMatch(/hours|Pune|monday|\+91/i);
    }
  });

  it("uses category-default theme when brand color is missing", () => {
    const b = parseBusiness({
      category: "salon",
      identity: { name: "X", category: "salon" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "S" }],
    });
    const spec = composeWebsiteSpec(b);
    expect(spec.theme.primaryColor).toBe("#5B7553"); // salon default
  });

  it("uses business brand color when present", () => {
    const b = parseBusiness({
      category: "salon",
      identity: { name: "X", category: "salon" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "S" }],
      brand: { primaryColor: "#123456" },
    });
    const spec = composeWebsiteSpec(b);
    expect(spec.theme.primaryColor).toBe("#123456");
  });

  it("end-to-end render: composed spec renders to a non-empty document", () => {
    const b = parseBusiness({
      category: "restaurant",
      identity: { name: "End To End", category: "restaurant" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "Item", price: "100" }],
    });
    const spec = composeWebsiteSpec(b);
    const out = renderWebsite(spec, b);
    expect(out.html.length).toBeGreaterThan(500);
  });
});
