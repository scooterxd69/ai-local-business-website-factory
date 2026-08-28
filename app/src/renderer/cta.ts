/**
 * CTA action resolution.
 *
 * The renderer's CTA buttons resolve an "action" (call, whatsapp, scroll, ...)
 * into a concrete href and a target. The action+target pair is the only
 * thing the AI sets; the renderer owns the URL.
 */

import type { Business } from "../business/business-schema.js";
import {
  escape,
  isValidEmail,
  normalizePhoneForLink,
  sanitizeUrl,
  whatsappLink,
} from "../security/escape.js";
import type { CtaAction, CtaButton, Section } from "../website/website-spec.js";
import { slugify } from "../security/escape.js";

/** A resolved CTA button: a printable href and an aria-label. */
export interface ResolvedCta {
  href: string;
  label: string;
  ariaLabel: string;
  external: boolean;
  kind: CtaAction;
}

export function resolveCta(
  button: CtaButton,
  business: Business,
  sections: Section[],
): ResolvedCta {
  const label = escape(button.label);
  const base: Pick<ResolvedCta, "label" | "kind"> = { label, kind: button.action };

  switch (button.action) {
    case "call": {
      const phone = button.target ?? business.contact.phone;
      const tel = normalizePhoneForLink(phone);
      if (!tel) {
        return {
          ...base,
          href: "#",
          ariaLabel: "Phone number unavailable",
          external: false,
        };
      }
      return {
        ...base,
        href: "tel:" + tel,
        ariaLabel: "Call " + escape(phone ?? ""),
        external: false,
      };
    }
    case "whatsapp": {
      const phone = button.target ?? business.contact.whatsapp ?? business.contact.phone;
      const link = whatsappLink(phone);
      if (!link) {
        return {
          ...base,
          href: "#",
          ariaLabel: "WhatsApp number unavailable",
          external: false,
        };
      }
      return {
        ...base,
        href: link,
        ariaLabel: "Chat on WhatsApp",
        external: true,
      };
    }
    case "scroll": {
      const target = button.target ?? "";
      const slug = slugify(target);
      if (!slug) {
        return { ...base, href: "#", ariaLabel: label, external: false };
      }
      return { ...base, href: "#" + slug, ariaLabel: label, external: false };
    }
    case "form": {
      // The renderer will mount the contact form inline. Anchor points to
      // the contact section if present, else a stub.
      const contact = sections.find((s) => s.type === "contact");
      const id = contact?.id ?? "contact";
      return { ...base, href: "#" + id, ariaLabel: label, external: false };
    }
    case "map": {
      const url = sanitizeUrl(business.location.googleMapsUrl);
      return {
        ...base,
        href: url || "#",
        ariaLabel: "Open in Google Maps",
        external: true,
      };
    }
    case "email": {
      const email = button.target ?? business.contact.email ?? "";
      if (!email || !isValidEmail(email)) {
        return { ...base, href: "#", ariaLabel: "Email unavailable", external: false };
      }
      return { ...base, href: "mailto:" + email, ariaLabel: "Email us", external: false };
    }
    case "externalLink": {
      const url = sanitizeUrl(button.target ?? "");
      return {
        ...base,
        href: url || "#",
        ariaLabel: label,
        external: !!url,
      };
    }
    default: {
      // Exhaustiveness check — TypeScript will error here if CtaAction gains a case.
      const _exhaustive: never = button.action;
      void _exhaustive;
      return { ...base, href: "#", ariaLabel: label, external: false };
    }
  }
}
