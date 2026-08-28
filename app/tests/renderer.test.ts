/**
 * Renderer tests.
 *
 * The renderer is the security boundary. These tests pin that:
 *   - All text in input becomes escaped in output
 *   - All URLs are sanitized
 *   - The basic shape of the document is correct (head, body, footer)
 *   - The three categories render with their distinct themes
 */

import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseBusiness } from "../src/business/business-schema.js";
import { composeWebsiteSpec } from "../src/profiles/category-profiles.js";
import { renderWebsite } from "../src/renderer/render.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const samplesDir = resolve(__dirname, "../../samples");

async function loadAndRender(sample: string) {
  const raw = JSON.parse(await readFile(resolve(samplesDir, sample), "utf8"));
  const business = parseBusiness(raw);
  const spec = composeWebsiteSpec(business);
  return { business, spec, rendered: renderWebsite(spec, business) };
}

describe("renderWebsite", () => {
  it("produces a complete document with html/head/body and a footer", async () => {
    const { rendered } = await loadAndRender("restaurant.json");
    expect(rendered.html).toMatch(/^<!doctype html>/i);
    expect(rendered.html).toContain("<head>");
    expect(rendered.html).toContain("</head>");
    expect(rendered.html).toContain("<body>");
    expect(rendered.html).toContain("</body>");
    expect(rendered.html).toContain("</html>");
    expect(rendered.html).toContain("class=\"site-footer\"");
  });

  it("escapes XSS attempts in business data", async () => {
    const business = parseBusiness({
      category: "restaurant",
      identity: {
        name: "<script>alert('xss')</script>",
        tagline: "Café & Co",
        category: "restaurant",
      },
      contact: { phone: "+91 98765 43210" },
      location: {
        addressLine1: "1 Test St",
        city: "Mumbai",
        country: "IN",
      },
      services: [
        { name: "<img src=x onerror=alert(1)>", description: "<b>bold</b>" },
      ],
    });
    const spec = composeWebsiteSpec(business);
    const rendered = renderWebsite(spec, business);
    expect(rendered.html).not.toContain("<script>alert");
    expect(rendered.html).toContain("&lt;script&gt;alert");
    // Café passes through unchanged (é is not an HTML metacharacter);
    // & becomes the entity.
    expect(rendered.html).toContain("Café &amp; Co");
    // The literal <img in a service name must be neutralized. The escape()
    // helper turns `=` and `/` into entities too, so we look for the
    // escaped open-angle and the onerror attribute string.
    expect(rendered.html).toContain("&lt;img");
    expect(rendered.html).toContain("onerror");
  });

  it("strips dangerous URLs from the output", async () => {
    const business = parseBusiness({
      category: "restaurant",
      identity: { name: "X", category: "restaurant" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "S" }],
      social: { facebook: "javascript:alert(1)" },
    });
    const spec = composeWebsiteSpec(business);
    const rendered = renderWebsite(spec, business);
    expect(rendered.html).not.toMatch(/href="javascript:/);
  });

  it("renders all three categories with distinct themes", async () => {
    // Use synthetic businesses WITHOUT a brand.primaryColor so each
    // category's default theme color shows through.
    const synth = (cat: "restaurant" | "salon" | "coaching", name: string) =>
      parseBusiness({
        category: cat,
        identity: { name, category: cat },
        contact: { phone: "+91 9999999999" },
        location: { addressLine1: "1 Main", city: "Pune", country: "IN" },
        services: [{ name: "S1" }],
      });
    const r = renderWebsite(composeWebsiteSpec(synth("restaurant", "R")), synth("restaurant", "R"));
    const s = renderWebsite(composeWebsiteSpec(synth("salon", "S")), synth("salon", "S"));
    const c = renderWebsite(composeWebsiteSpec(synth("coaching", "C")), synth("coaching", "C"));
    expect(r.css).toContain("--color-primary: #8B1A1A");
    expect(s.css).toContain("--color-primary: #5B7553");
    expect(c.css).toContain("--color-primary: #1E3A5F");
  });

  it("emits valid structured data JSON", async () => {
    const { rendered } = await loadAndRender("restaurant.json");
    const parsed = JSON.parse(rendered.structuredData);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("LocalBusiness");
    expect(parsed.name).toBe("Sharma Family Restaurant");
    expect(parsed.telephone).toBeDefined();
  });

  it("includes the phone number and WhatsApp CTA in the hero", async () => {
    const { rendered } = await loadAndRender("restaurant.json");
    expect(rendered.html).toMatch(/href="tel:\+919455012345"/);
    expect(rendered.html).toMatch(/href="https:\/\/wa\.me\/919455012345"/);
  });

  it("honors visible:false on a section", async () => {
    const { business } = await loadAndRender("restaurant.json");
    const spec = composeWebsiteSpec(business);
    // Make every section after the hero invisible.
    const patchedSections = spec.sections.map((s, i) => ({
      ...s,
      visible: i === 0 ? true : false,
    }));
    const mutated = { ...spec, sections: patchedSections };
    const rendered = renderWebsite(mutated, business);
    expect(rendered.html).toContain("class=\"hero");
    expect(rendered.html).not.toContain("class=\"services");
  });

  it("renders without error when a section type returns null content (no data)", async () => {
    const business = parseBusiness({
      category: "restaurant",
      identity: { name: "Minimal", category: "restaurant" },
      contact: { phone: "+91 9999999999" },
      location: { addressLine1: "1 X", city: "X", country: "IN" },
      services: [{ name: "S" }],
    });
    const spec = composeWebsiteSpec(business);
    const rendered = renderWebsite(spec, business);
    expect(rendered.html).toBeTruthy();
    // No <script> leak
    expect(rendered.html).not.toMatch(/<script>alert/);
  });

  it("renders all three samples and produces a footer for each", async () => {
    for (const s of ["restaurant.json", "salon.json", "coaching.json"]) {
      const { rendered } = await loadAndRender(s);
      expect(rendered.html).toContain("class=\"site-footer\"");
      expect(rendered.css).toContain(":root {");
    }
  });

  it("the page has skip link for accessibility", async () => {
    const { rendered } = await loadAndRender("restaurant.json");
    expect(rendered.html).toContain("class=\"skip-link\"");
  });

  it("the document references the stylesheet", async () => {
    const { rendered } = await loadAndRender("restaurant.json");
    expect(rendered.html).toContain('href="styles.css"');
  });
});
