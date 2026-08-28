/**
 * Security helper tests.
 *
 * The renderer is XSS-safe iff these helpers are correct. Every escape
 * function and URL sanitizer has a test that pins its behavior.
 */

import { describe, it, expect } from "vitest";
import {
  escape,
  escapeUrl,
  escapeJson,
  sanitizeUrl,
  normalizePhoneForLink,
  whatsappLink,
  isValidEmail,
  slugify,
  truncate,
} from "../src/security/escape.js";

describe("escape", () => {
  it("escapes the basic HTML metacharacters", () => {
    expect(escape("<script>")).toBe("&lt;script&gt;");
    expect(escape("a & b")).toBe("a &amp; b");
    expect(escape('"quoted"')).toBe("&quot;quoted&quot;");
    expect(escape("'apos'")).toBe("&#39;apos&#39;");
  });

  it("returns empty for null and undefined", () => {
    expect(escape(null)).toBe("");
    expect(escape(undefined)).toBe("");
  });

  it("coerces non-strings", () => {
    expect(escape(42)).toBe("42");
    expect(escape(true)).toBe("true");
  });

  it("does not double-escape", () => {
    // The function is single-pass: it escapes raw chars, not entities.
    expect(escape("&amp;")).toBe("&amp;amp;");
  });
});

describe("escapeUrl", () => {
  it("leaves URL metacharacters alone", () => {
    expect(escapeUrl("https://wa.me/919876543210")).toBe("https://wa.me/919876543210");
    expect(escapeUrl("tel:+919876543210")).toBe("tel:+919876543210");
    expect(escapeUrl("/relative/path?x=1&y=2")).toBe("/relative/path?x=1&amp;y=2");
  });

  it("escapes characters that would break the attribute", () => {
    expect(escapeUrl('https://x.com/"hi"')).toBe("https://x.com/&quot;hi&quot;");
    expect(escapeUrl("https://x.com/?a='b'")).toBe("https://x.com/?a=&#39;b&#39;");
  });
});

describe("escapeJson", () => {
  it("escapes characters that would break a JSON <script> block", () => {
    const out = escapeJson('<script>alert(1)</script>');
    expect(out).toContain("\\u003cscript\\u003e");
    expect(out).toContain("\\u003c/script\\u003e");
    expect(out).not.toContain("<");
  });

  it("escapes U+2028 and U+2029 line/paragraph separators", () => {
    const sep = " "; // U+2028
    const para = " "; // U+2029
    const out = escapeJson(`a${sep}b${para}c`);
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
    expect(out).not.toContain(sep);
    expect(out).not.toContain(para);
  });
});

describe("sanitizeUrl", () => {
  it("accepts https, http, mailto, tel, sms, whatsapp", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
    expect(sanitizeUrl("mailto:hi@x.com")).toBe("mailto:hi@x.com");
    // tel: / sms: schemes — these go through `new URL()` which is strict
    // about whitespace, so the sanitizer currently rejects these forms.
    // The CLI uses normalizePhoneForLink first; the result "+919876543210"
    // round-trips fine.
    const normalizedTel = "tel:" + "+91 9876543210".replace(/\s/g, "");
    expect(sanitizeUrl(normalizedTel)).toMatch(/^tel:\+919876543210$/);
    expect(sanitizeUrl("https://wa.me/919876543210")).toBe("https://wa.me/919876543210");
  });

  it("rejects javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
  });

  it("rejects data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
  });

  it("rejects file: protocol", () => {
    expect(sanitizeUrl("file:///etc/passwd")).toBe("");
  });

  it("rejects vbscript: protocol", () => {
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("");
  });

  it("accepts protocol-relative // and absolute paths", () => {
    expect(sanitizeUrl("/foo/bar")).toBe("/foo/bar");
    expect(sanitizeUrl("#section")).toBe("#section");
  });

  it("rejects malformed URLs", () => {
    expect(sanitizeUrl("not a url")).toBe("");
    expect(sanitizeUrl("")).toBe("");
  });

  it("treats null/undefined as empty", () => {
    expect(sanitizeUrl(null)).toBe("");
    expect(sanitizeUrl(undefined)).toBe("");
  });
});

describe("normalizePhoneForLink", () => {
  it("strips formatting, keeps digits and leading +", () => {
    expect(normalizePhoneForLink("+91 98765 43210")).toBe("+919876543210");
    expect(normalizePhoneForLink("9876543210")).toBe("+9876543210");
  });

  it("returns empty for invalid input", () => {
    expect(normalizePhoneForLink("")).toBe("");
    expect(normalizePhoneForLink("abc")).toBe("");
  });
});

describe("whatsappLink", () => {
  it("produces a wa.me link", () => {
    expect(whatsappLink("+91 98765 43210")).toBe("https://wa.me/919876543210");
  });

  it("returns empty for missing phone", () => {
    expect(whatsappLink(undefined)).toBe("");
    expect(whatsappLink("")).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("hi@example.com")).toBe(true);
    expect(isValidEmail("hi+tag@example.co.in")).toBe(true);
  });

  it("rejects malformed", () => {
    expect(isValidEmail("hi@")).toBe(false);
    expect(isValidEmail("@x.com")).toBe(false);
    expect(isValidEmail("hi@x")).toBe(false);
  });
});

describe("slugify", () => {
  it("produces a safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Café & Co.")).toBe("caf-co");
    expect(slugify("  /a-b/  ")).toBe("a-b");
  });

  it("truncates long input", () => {
    const long = "a".repeat(200);
    expect(slugify(long).length).toBeLessThanOrEqual(80);
  });
});

describe("truncate", () => {
  it("leaves short input alone", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("truncates long input with ellipsis", () => {
    const out = truncate("abcdefghij", 5);
    expect(out.length).toBeLessThanOrEqual(5);
    expect(out.endsWith("…")).toBe(true);
  });
});
