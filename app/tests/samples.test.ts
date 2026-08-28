/**
 * Sample data tests.
 *
 * The samples are the demo material. They must always parse and always
 * render. If someone breaks a sample, the rest of the pipeline is broken.
 */

import { describe, it, expect } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseBusiness } from "../src/business/business-schema.js";
import { composeWebsiteSpec } from "../src/profiles/category-profiles.js";
import { renderWebsite } from "../src/renderer/render.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const samplesDir = resolve(__dirname, "../../samples");

async function* walkJson(dir: string): AsyncIterable<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) yield* walkJson(full);
    else if (entry.name.endsWith(".json")) yield full;
  }
}

describe("samples", () => {
  it("every sample JSON parses as a Business", async () => {
    let found = 0;
    for await (const path of walkJson(samplesDir)) {
      const raw = JSON.parse(await readFile(path, "utf8"));
      const b = parseBusiness(raw);
      expect(b.identity.name).toBeTruthy();
      found++;
    }
    expect(found).toBeGreaterThanOrEqual(3);
  });

  it("every sample renders without error", async () => {
    for await (const path of walkJson(samplesDir)) {
      const raw = JSON.parse(await readFile(path, "utf8"));
      const b = parseBusiness(raw);
      const spec = composeWebsiteSpec(b);
      const rendered = renderWebsite(spec, b);
      expect(rendered.html).toContain("<!doctype html>");
      expect(rendered.css).toContain(":root {");
    }
  });

  it("every sample includes a real address in the rendered HTML", async () => {
    for await (const path of walkJson(samplesDir)) {
      const raw = JSON.parse(await readFile(path, "utf8"));
      const b = parseBusiness(raw);
      const spec = composeWebsiteSpec(b);
      const rendered = renderWebsite(spec, b);
      // city must appear in the contact/location block
      expect(rendered.html.toLowerCase()).toContain(b.location.city.toLowerCase());
    }
  });

  it("no sample contains 'lorem ipsum' or placeholder text", async () => {
    for await (const path of walkJson(samplesDir)) {
      const raw = JSON.parse(await readFile(path, "utf8"));
      const b = parseBusiness(raw);
      const spec = composeWebsiteSpec(b);
      const rendered = renderWebsite(spec, b);
      const haystack = rendered.html.toLowerCase();
      expect(haystack).not.toContain("lorem ipsum");
      expect(haystack).not.toContain("placeholder");
    }
  });
});
