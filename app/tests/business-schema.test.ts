/**
 * Business schema tests.
 *
 * These tests pin the contract: which fields are required, which are optional,
 * and what kinds of values are accepted. The renderer and composer depend on
 * these guarantees.
 */

import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseBusiness } from "../src/business/business-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const samplesDir = resolve(__dirname, "../../samples");

async function loadSample(name: string): Promise<unknown> {
  const text = await readFile(resolve(samplesDir, name), "utf8");
  return JSON.parse(text);
}

describe("parseBusiness", () => {
  it("accepts a valid restaurant business", async () => {
    const raw = await loadSample("restaurant.json");
    const b = parseBusiness(raw);
    expect(b.category).toBe("restaurant");
    expect(b.identity.name).toBe("Sharma Family Restaurant");
    expect(b.services).toHaveLength(5);
  });

  it("accepts a valid salon business", async () => {
    const raw = await loadSample("salon.json");
    const b = parseBusiness(raw);
    expect(b.category).toBe("salon");
    expect(b.identity.ownerName).toBe("Priya Verma");
  });

  it("accepts a valid coaching business", async () => {
    const raw = await loadSample("coaching.json");
    const b = parseBusiness(raw);
    expect(b.category).toBe("coaching");
    expect(b.services).toHaveLength(6);
  });

  it("rejects unknown category", () => {
    expect(() =>
      parseBusiness({
        category: "unknown",
        identity: { name: "X", category: "unknown" },
        contact: { phone: "+91 9999999999" },
        location: { addressLine1: "1 X", city: "X", country: "IN" },
        services: [{ name: "S" }],
      }),
    ).toThrow();
  });

  it("rejects missing required identity.name", () => {
    expect(() =>
      parseBusiness({
        category: "restaurant",
        identity: { category: "restaurant" },
        contact: { phone: "+91 9999999999" },
        location: { addressLine1: "1 X", city: "X", country: "IN" },
        services: [{ name: "S" }],
      }),
    ).toThrow();
  });

  it("rejects non-hex brand color", () => {
    expect(() =>
      parseBusiness({
        category: "restaurant",
        identity: { name: "X", category: "restaurant" },
        contact: { phone: "+91 9999999999" },
        location: { addressLine1: "1 X", city: "X", country: "IN" },
        services: [{ name: "S" }],
        brand: { primaryColor: "red" },
      }),
    ).toThrow();
  });

  it("accepts a minimal valid business with just required fields", () => {
    const b = parseBusiness({
      category: "restaurant",
      identity: { name: "Tiny Diner", category: "restaurant" },
      contact: { phone: "+91 98765 43210" },
      location: { addressLine1: "1 Test", city: "Mumbai", country: "IN" },
      services: [{ name: "Thali" }],
    });
    expect(b.identity.name).toBe("Tiny Diner");
    expect(b.contact.email).toBeUndefined();
  });

  it("requires day in hours.schedule entries", () => {
    expect(() =>
      parseBusiness({
        category: "restaurant",
        identity: { name: "X", category: "restaurant" },
        contact: { phone: "+91 9999999999" },
        location: { addressLine1: "1 X", city: "X", country: "IN" },
        services: [{ name: "S" }],
        hours: { schedule: [{ open: "09:00", close: "18:00" }] },
      }),
    ).toThrow();
  });
});
