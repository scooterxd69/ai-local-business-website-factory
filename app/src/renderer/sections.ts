/**
 * Section renderers — one function per section type. Each function takes
 * the typed section content and the Business it belongs to, and returns
 * an HTML fragment (no <html>/<head>/<body> wrapper).
 *
 * Every function MUST escape all user/AI text via the helpers in
 * ../security/escape.js. No raw interpolation. If a function needs to
 * embed a URL, it goes through sanitizeUrl.
 */

import type { Business } from "../business/business-schema.js";
import { escape, escapeUrl, sanitizeUrl, slugify, truncate, whatsappLink } from "../security/escape.js";
import type {
  Section,
  WebsiteSpec,
} from "../website/website-spec.js";
import type { ResolvedTheme } from "./theme.js";
import { resolveCta } from "./cta.js";

// ---- helpers ----

function dayName(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function sectionId(section: Section, fallback: string): string {
  if (section.id) return slugify(section.id);
  if (section.title) return slugify(section.title);
  return slugify(fallback);
}

function formatHours(schedule: ReadonlyArray<{ day: string; open: string; close: string; closed?: boolean | undefined }>): string {
  return schedule
    .map((entry) => {
      if (entry.closed) return `${dayName(entry.day)}: Closed`;
      return `${dayName(entry.day)}: ${entry.open} – ${entry.close}`;
    })
    .join(" · ");
}

function formatAddress(b: Business): string {
  const parts = [
    b.location.addressLine1,
    b.location.addressLine2,
    b.location.city,
    b.location.state,
    b.location.postalCode,
  ].filter((s): s is string => !!s && s.length > 0);
  return parts.join(", ");
}

// ---- Hero ----

export function renderHero(section: Section, b: Business, theme: ResolvedTheme, allSections: Section[]): string {
  if (section.type !== "hero") throw new Error("renderHero called with non-hero section");
  const c = section.content;
  const id = sectionId(section, "hero");
  const overlayClass = c.overlay ? ` overlay-${c.overlay}` : " overlay-dark";
  const bg = c.backgroundImage
    ? ` style="background-image: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${escapeUrl(sanitizeUrl(c.backgroundImage))}')"`
    : ` style="background-color: ${theme.primaryColor}"`;

  const primaryHtml = c.primaryCta
    ? (() => {
        const cta = resolveCta(c.primaryCta, b, allSections);
        return `<a class="btn btn-primary" href="${escapeUrl(cta.href)}"${cta.external ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escape(cta.ariaLabel)}">${escape(cta.label)}</a>`;
      })()
    : "";

  const secondaryHtml = c.secondaryCta
    ? (() => {
        const cta = resolveCta(c.secondaryCta, b, allSections);
        return `<a class="btn btn-secondary" href="${escapeUrl(cta.href)}"${cta.external ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escape(cta.ariaLabel)}">${escape(cta.label)}</a>`;
      })()
    : "";

  return `
<section id="${id}" class="hero${overlayClass}"${bg}>
  <div class="hero-inner">
    <h1 class="hero-headline">${escape(c.headline)}</h1>
    ${c.subheadline ? `<p class="hero-subheadline">${escape(c.subheadline)}</p>` : ""}
    ${c.description ? `<p class="hero-description">${escape(c.description)}</p>` : ""}
    ${primaryHtml || secondaryHtml ? `<div class="hero-ctas">${primaryHtml}${secondaryHtml}</div>` : ""}
  </div>
</section>`.trim();
}

// ---- About ----

export function renderAbout(section: Section): string {
  if (section.type !== "about") throw new Error("renderAbout called with non-about section");
  const c = section.content;
  const id = sectionId(section, "about");
  const paragraphs = c.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escape(p)}</p>`)
    .join("\n");
  const image = c.image
    ? `<div class="about-image"><img src="${escapeUrl(sanitizeUrl(c.image))}" alt="${escape(c.headline ?? "About")}" loading="lazy" /></div>`
    : "";
  return `
<section id="${id}" class="about">
  <div class="about-inner">
    ${c.headline ? `<h2 class="section-headline">${escape(c.headline)}</h2>` : ""}
    <div class="about-body">
      <div class="about-text">${paragraphs}</div>
      ${image}
    </div>
  </div>
</section>`.trim();
}

// ---- Services ----

export function renderServices(section: Section, b: Business): string {
  if (section.type !== "services") throw new Error("renderServices called with non-services section");
  const c = section.content;
  const id = sectionId(section, "services");
  const heading = c.heading ?? section.title ?? "What we offer";
  const layout = c.layout ?? (c.services.length > 6 ? "grid" : "cards");

  const items = c.services
    .map((s, idx) => {
      const img = s.image
        ? `<div class="service-image"><img src="${escapeUrl(sanitizeUrl(s.image))}" alt="${escape(s.name)}" loading="lazy" /></div>`
        : "";
      const price = s.price ? `<div class="service-price">${escape(s.price)}</div>` : "";
      const duration = s.duration ? `<div class="service-duration">${escape(s.duration)}</div>` : "";
      return `
<article class="service-item service-${layout}" aria-labelledby="service-${id}-${idx}">
  ${img}
  <div class="service-body">
    <h3 id="service-${id}-${idx}" class="service-name">${escape(s.name)}</h3>
    ${s.description ? `<p class="service-description">${escape(s.description)}</p>` : ""}
    <div class="service-meta">${price}${duration}</div>
  </div>
</article>`.trim();
    })
    .join("\n");

  return `
<section id="${id}" class="services services-${layout}">
  <div class="services-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <div class="services-grid">${items}</div>
  </div>
</section>`.trim();
}

// ---- Pricing ----

export function renderPricing(section: Section): string {
  if (section.type !== "pricing") throw new Error("renderPricing called with non-pricing section");
  const c = section.content;
  const id = sectionId(section, "pricing");
  const heading = c.heading ?? section.title ?? "Pricing";

  const items = c.pricingItems
    .map(
      (p) => `
<article class="pricing-item">
  <div class="pricing-row">
    <h3 class="pricing-name">${escape(p.name)}</h3>
    <div class="pricing-amount">${escape(p.price)}</div>
  </div>
  ${p.description ? `<p class="pricing-description">${escape(p.description)}</p>` : ""}
  ${p.notes ? `<p class="pricing-notes">${escape(p.notes)}</p>` : ""}
</article>`.trim(),
    )
    .join("\n");

  return `
<section id="${id}" class="pricing">
  <div class="pricing-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <div class="pricing-list">${items}</div>
    ${c.note ? `<p class="pricing-note">${escape(c.note)}</p>` : ""}
  </div>
</section>`.trim();
}

// ---- Gallery ----

export function renderGallery(section: Section): string {
  if (section.type !== "gallery") throw new Error("renderGallery called with non-gallery section");
  const c = section.content;
  const id = sectionId(section, "gallery");
  const heading = c.heading ?? section.title ?? "Gallery";
  const layout = c.layout ?? "grid";

  const items = c.images
    .map((src, idx) => {
      const caption = c.captions?.[idx];
      const img = `<img src="${escapeUrl(sanitizeUrl(src))}" alt="${caption ? escape(caption) : "Gallery image " + (idx + 1)}" loading="lazy" />`;
      return `<figure class="gallery-item">${img}${caption ? `<figcaption>${escape(caption)}</figcaption>` : ""}</figure>`;
    })
    .join("\n");

  return `
<section id="${id}" class="gallery gallery-${layout}">
  <div class="gallery-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <div class="gallery-grid">${items}</div>
  </div>
</section>`.trim();
}

// ---- Testimonials / Reviews ----

export function renderTestimonials(section: Section): string {
  if (section.type !== "testimonials") throw new Error("renderTestimonials called with non-testimonials section");
  const c = section.content;
  const id = sectionId(section, "testimonials");
  const heading = c.heading ?? section.title ?? "What our customers say";

  const items = c.items
    .map(
      (t) => `
<figure class="testimonial-item">
  <blockquote class="testimonial-quote">${escape(t.quote)}</blockquote>
  <figcaption class="testimonial-author">
    ${t.image ? `<img class="testimonial-avatar" src="${escapeUrl(sanitizeUrl(t.image))}" alt="" loading="lazy" />` : ""}
    <div>
      <div class="testimonial-name">${escape(t.author)}</div>
      ${t.role ? `<div class="testimonial-role">${escape(t.role)}</div>` : ""}
    </div>
    ${t.rating ? `<div class="testimonial-rating" aria-label="${t.rating} out of 5">${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}</div>` : ""}
  </figcaption>
</figure>`.trim(),
    )
    .join("\n");

  return `
<section id="${id}" class="testimonials">
  <div class="testimonials-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <div class="testimonials-grid">${items}</div>
    ${c.source ? `<p class="testimonials-source">— ${escape(c.source)}</p>` : ""}
  </div>
</section>`.trim();
}

export function renderReviews(section: Section): string {
  if (section.type !== "reviews") throw new Error("renderReviews called with non-reviews section");
  const c = section.content;
  const id = sectionId(section, "reviews");
  const heading = c.heading ?? section.title ?? "Reviews";

  const items = c.items
    .map((r) => {
      const rating = r.rating ? `<span class="review-rating" aria-label="${r.rating} out of 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>` : "";
      return `
<li class="review-item">
  <div class="review-meta">${rating}${r.date ? `<time>${escape(r.date)}</time>` : ""}</div>
  <p class="review-quote">${escape(r.quote)}</p>
  ${r.author ? `<div class="review-author">— ${escape(r.author)}</div>` : ""}
</li>`.trim();
    })
    .join("\n");

  const aggregate = c.aggregateRating
    ? `<div class="reviews-aggregate"><strong>${c.aggregateRating.ratingValue.toFixed(1)}</strong> <span>★</span> from <strong>${c.aggregateRating.reviewCount}</strong> reviews</div>`
    : "";

  return `
<section id="${id}" class="reviews">
  <div class="reviews-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    ${aggregate}
    <ul class="reviews-list">${items}</ul>
    ${c.source ? `<p class="reviews-source">— ${escape(c.source)}</p>` : ""}
  </div>
</section>`.trim();
}

// ---- Team ----

export function renderTeam(section: Section): string {
  if (section.type !== "team") throw new Error("renderTeam called with non-team section");
  const c = section.content;
  const id = sectionId(section, "team");
  const heading = c.heading ?? section.title ?? "Our team";

  const items = c.members
    .map(
      (m) => `
<article class="team-member">
  ${m.image ? `<img class="team-image" src="${escapeUrl(sanitizeUrl(m.image))}" alt="${escape(m.name)}" loading="lazy" />` : ""}
  <h3 class="team-name">${escape(m.name)}</h3>
  ${m.role ? `<p class="team-role">${escape(m.role)}</p>` : ""}
  ${m.bio ? `<p class="team-bio">${escape(m.bio)}</p>` : ""}
</article>`.trim(),
    )
    .join("\n");

  return `
<section id="${id}" class="team">
  <div class="team-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <div class="team-grid">${items}</div>
  </div>
</section>`.trim();
}

// ---- FAQ ----

export function renderFaq(section: Section): string {
  if (section.type !== "faq") throw new Error("renderFaq called with non-faq section");
  const c = section.content;
  const id = sectionId(section, "faq");
  const heading = c.heading ?? section.title ?? "Frequently asked questions";

  const items = c.items
    .map(
      (item, idx) => `
<details class="faq-item">
  <summary class="faq-question" aria-controls="faq-${id}-${idx}-a">${escape(item.question)}</summary>
  <div id="faq-${id}-${idx}-a" class="faq-answer">${escape(item.answer)}</div>
</details>`.trim(),
    )
    .join("\n");

  return `
<section id="${id}" class="faq">
  <div class="faq-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <div class="faq-list">${items}</div>
  </div>
</section>`.trim();
}

// ---- Booking ----

export function renderBooking(section: Section, b: Business, allSections: Section[]): string {
  if (section.type !== "booking") throw new Error("renderBooking called with non-booking section");
  const c = section.content;
  const id = sectionId(section, "booking");
  const heading = c.heading ?? section.title ?? "Book an appointment";
  const cta = resolveCta(
    { label: c.ctaText, action: c.action, target: c.target },
    b,
    allSections,
  );

  return `
<section id="${id}" class="booking">
  <div class="booking-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    ${c.description ? `<p class="booking-description">${escape(c.description)}</p>` : ""}
    <a class="btn btn-primary booking-cta" href="${escapeUrl(cta.href)}"${cta.external ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escape(cta.ariaLabel)}">${escape(cta.label)}</a>
    ${c.note ? `<p class="booking-note">${escape(c.note)}</p>` : ""}
  </div>
</section>`.trim();
}

// ---- Contact ----

export function renderContact(section: Section, b: Business, _spec: WebsiteSpec, allSections: Section[]): string {
  if (section.type !== "contact") throw new Error("renderContact called with non-contact section");
  const c = section.content;
  const id = sectionId(section, "contact");
  const heading = c.heading ?? section.title ?? "Contact us";
  const phone = c.phone ?? b.contact.phoneDisplay ?? b.contact.phone;
  const tel = (phone ?? "").replace(/[^\d+]/g, "");
  const wa = whatsappLink(c.whatsapp ?? b.contact.whatsapp ?? b.contact.phone);
  const email = c.email ?? b.contact.email;
  const address = c.address ?? formatAddress(b);
  const mapUrl = sanitizeUrl(c.mapUrl ?? b.location.googleMapsUrl);
  const hours = c.hours ?? (b.hours?.schedule ? b.hours.schedule.map((s) => ({ day: s.day, open: s.open, close: s.close, closed: s.closed })) : undefined);

  const phoneHtml = phone
    ? `<li class="contact-line"><span class="contact-label">Phone</span><a href="tel:${escapeUrl(tel)}">${escape(phone)}</a></li>`
    : "";
  const waHtml = wa
    ? `<li class="contact-line"><span class="contact-label">WhatsApp</span><a href="${escapeUrl(wa)}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>`
    : "";
  const emailHtml = email
    ? `<li class="contact-line"><span class="contact-label">Email</span><a href="mailto:${escapeUrl(email)}">${escape(email)}</a></li>`
    : "";
  const addressHtml = address
    ? `<li class="contact-line"><span class="contact-label">Address</span><span>${escape(address)}</span>${b.location.landmark ? `<small> (${escape(b.location.landmark)})</small>` : ""}</li>`
    : "";
  const mapHtml = mapUrl
    ? `<li class="contact-line"><a class="btn btn-secondary" href="${escapeUrl(mapUrl)}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a></li>`
    : "";
  const hoursHtml = hours && hours.length > 0
    ? `<li class="contact-line"><span class="contact-label">Hours</span><span>${escape(formatHours(hours))}</span></li>`
    : "";

  return `
<section id="${id}" class="contact">
  <div class="contact-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    <ul class="contact-list">
      ${phoneHtml}${waHtml}${emailHtml}${addressHtml}${mapHtml}${hoursHtml}
    </ul>
  </div>
</section>`.trim();
}

// ---- Location ----

export function renderLocation(section: Section, b: Business): string {
  if (section.type !== "location") throw new Error("renderLocation called with non-location section");
  const c = section.content;
  const id = sectionId(section, "location");
  const heading = c.heading ?? section.title ?? "Find us";
  const address = c.address ?? formatAddress(b);
  const mapUrl = sanitizeUrl(c.mapEmbed ?? b.location.googleMapsUrl);

  // We never render a raw iframe with user content. If a Google Maps embed
  // URL is present, we render an "Open in Google Maps" link instead.
  return `
<section id="${id}" class="location">
  <div class="location-inner">
    <h2 class="section-headline">${escape(heading)}</h2>
    ${address ? `<p class="location-address">${escape(address)}</p>` : ""}
    ${b.location.landmark ? `<p class="location-landmark">Landmark: ${escape(b.location.landmark)}</p>` : ""}
    ${c.directions ? `<p class="location-directions">${escape(c.directions)}</p>` : ""}
    ${c.transport ? `<p class="location-transport">${escape(c.transport)}</p>` : ""}
    ${mapUrl ? `<a class="btn btn-primary" href="${escapeUrl(mapUrl)}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>` : ""}
  </div>
</section>`.trim();
}

// ---- CTA banner ----

export function renderCtaBanner(section: Section, b: Business, allSections: Section[]): string {
  if (section.type !== "cta") throw new Error("renderCtaBanner called with non-cta section");
  const c = section.content;
  const id = sectionId(section, "cta");
  const button = resolveCta(c.button, b, allSections);
  const styleAttr = c.background && /^#[0-9A-Fa-f]{6}$/.test(c.background)
    ? ` style="background-color: ${c.background}"`
    : "";
  return `
<section id="${id}" class="cta-banner"${styleAttr}>
  <div class="cta-banner-inner">
    <h2 class="cta-banner-headline">${escape(c.heading)}</h2>
    ${c.description ? `<p class="cta-banner-description">${escape(c.description)}</p>` : ""}
    <a class="btn btn-primary" href="${escapeUrl(button.href)}"${button.external ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escape(button.ariaLabel)}">${escape(button.label)}</a>
  </div>
</section>`.trim();
}

// ---- Footer ----

export function renderFooter(section: Section | undefined, b: Business, spec: WebsiteSpec): string {
  // If no footer is provided, we still emit one. The site needs a footer.
  const businessName = (section?.type === "footer" ? section.content.businessName : null)
    ?? b.identity.name;
  const tag = (section?.type === "footer" ? section.content.tag : null)
    ?? b.identity.tagline;
  const year = new Date().getFullYear();
  const copyright = (section?.type === "footer" ? section.content.copyright : null)
    ?? `© ${year} ${businessName}. All rights reserved.`;

  const social = (section?.type === "footer" ? section.content.social : null)
    ?? (b.social
      ? {
          instagram: b.social.instagram,
          facebook: b.social.facebook,
          youtube: b.social.youtube,
          twitter: b.social.twitter,
          linkedin: b.social.linkedin,
          googleBusinessUrl: b.social.googleBusinessUrl,
          justdial: b.social.justdial,
        }
      : null);

  const socialHtml = social
    ? Object.entries(social)
        .filter(([, v]) => typeof v === "string" && v.length > 0)
        .map(([k, v]) => {
          const url = sanitizeUrl(v as string);
          if (!url) return "";
          return `<a href="${escapeUrl(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(k)}">${escape(k)}</a>`;
        })
        .filter(Boolean)
        .join(" ")
    : "";

  const links = (section?.type === "footer" ? section.content.links : null) ?? [];
  const linkHtml = links
    .map((l) => {
      const url = sanitizeUrl(l.url);
      if (!url) return "";
      return `<a href="${escapeUrl(url)}">${escape(l.label)}</a>`;
    })
    .filter(Boolean)
    .join(" ");

  const description = b.identity.description
    ? `<p class="footer-description">${escape(truncate(b.identity.description, 200))}</p>`
    : "";

  return `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="footer-name">${escape(businessName)}</div>
      ${tag ? `<div class="footer-tag">${escape(tag)}</div>` : ""}
      ${description}
    </div>
    ${linkHtml ? `<nav class="footer-links" aria-label="Footer">${linkHtml}</nav>` : ""}
    ${socialHtml ? `<div class="footer-social">${socialHtml}</div>` : ""}
  </div>
  <div class="footer-bottom">${escape(copyright)}</div>
</footer>`.trim();
}
