/**
 * Security helpers for the renderer.
 *
 * The renderer's contract: it never trusts user/AI content as HTML.
 * All text passes through escape() before being placed in the document.
 * All URLs pass through sanitizeUrl() before being placed in href/src.
 *
 * If you need to add a feature that "would be easier" with innerHTML or
 * dangerouslySetInnerHTML, don't. Add a new section type instead.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape a string for safe interpolation into HTML text or an attribute value.
 * Always returns a string; never returns the input unchanged.
 */
export function escape(input: unknown): string {
  if (input === null || input === undefined) return "";
  const s = String(input);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    out += HTML_ENTITIES[ch] ?? ch;
  }
  return out;
}

/**
 * Escape a URL for use in an attribute value (href, src). Differs from
 * escape() in that `/`, `:`, `=`, `?`, `&`, `+` are kept as-is because
 * they are valid URL characters and over-escaping them produces invalid
 * URLs (e.g. https:&#x2F;&#x2F;wa.me).
 *
 * Use this only after the URL has already been validated by sanitizeUrl.
 * It only escapes characters that could break out of the attribute
 * double-quote context.
 */
export function escapeUrl(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input.charAt(i);
    switch (ch) {
      case "&":
        out += "&amp;";
        break;
      case '"':
        out += "&quot;";
        break;
      case "'":
        out += "&#39;";
        break;
      case "<":
        out += "&lt;";
        break;
      case ">":
        out += "&gt;";
        break;
      default:
        out += ch;
    }
  }
  return out;
}

/**
 * Escape a string for use in a JSON <script> block (e.g. SEO structured data).
 * This is intentionally stricter than escape() because it sits inside a script
 * tag, where a </script> in user data would otherwise break out.
 *
 * Uses String.fromCharCode(0x2028) and String.fromCharCode(0x2029) to avoid
 * embedding those code points literally in source (which TS cannot parse inside
 * a regex literal).
 */
export function escapeJson(input: string): string {
  const LINE_SEPARATOR = String.fromCharCode(0x2028);
  const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
  return input
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LINE_SEPARATOR).join("\\u2028")
    .split(PARAGRAPH_SEPARATOR).join("\\u2029");
}

const ALLOWED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "whatsapp:",
  "sms:",
]);

/**
 * Validate and normalize a URL for use in href / src.
 *
 * Returns the original string for relative URLs and allowed protocols.
 * Returns "" for anything else (javascript:, data:, file:, malformed).
 *
 * Defense in depth: the renderer never lets user-controlled URLs reach
 * the document unfiltered.
 */
export function sanitizeUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const value = String(raw).trim();
  if (!value) return "";

  // Allow relative URLs starting with "/" (but not "//", which is protocol-relative).
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  if (value.startsWith("#")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (ALLOWED_URL_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Build a "tel:" link from a phone number. Strips everything except digits
 * and a leading +.
 */
export function normalizePhoneForLink(phone: string | undefined | null): string {
  if (!phone) return "";
  const match = String(phone).match(/^\+?([\d\s\-()]+)$/);
  if (!match) return "";
  const cleaned = (match[1] ?? "").replace(/\D/g, "");
  if (!cleaned) return "";
  return "+" + cleaned;
}

/**
 * Normalize a phone number to a WhatsApp wa.me link.
 * Returns "" if the phone is missing or invalid.
 */
export function whatsappLink(phone: string | undefined | null): string {
  const normalized = normalizePhoneForLink(phone);
  if (!normalized) return "";
  return "https://wa.me/" + normalized.replace(/^\+/, "");
}

/**
 * Validate an email address with a strict regex. Used for the contact form
 * "to" address; not for user display.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Truncate a string to a maximum number of characters, adding an ellipsis
 * if it was truncated. Used to keep meta descriptions within SEO limits.
 */
export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Slugify a string for use in URLs and CSS class names.
 * Pure ASCII output; non-ASCII characters are dropped.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
