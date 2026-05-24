# TODO Implementation References — Maan Special Education Center

This file lists every piece of information the redesign needs from the client
to remove a placeholder or activate a feature. Items here are intentionally
**not invented** in code — they wait for verified content from the center.

Last updated: 2026-05-24
Branch: `redesign`

---

## Brand & Visual Assets

- [ ] **Final SVG logo** — current implementation uses `/public/logo-transparent.png`.
      `app/components/AppLogo.vue` will swap to the SVG by name when provided.
- [ ] **Center photography (consented)** — for hero, program landing pages, and
      Dr. Osama portrait. The hero currently uses the logo + ambient gradients
      as a calm placeholder.
- [ ] **Brand color confirmation** — palette derived from the logo
      (peach `#E94B35` for CTAs, sky `#3D8AC5` for autism awareness,
      mint `#2BA365` for Down syndrome, violet `#7C61DC` for learning
      difficulties). Confirm with the center before printing materials.

## Dr. Osama Madbooly

- [ ] **Official biography** (qualifications, accreditations, years of
      experience, languages, professional memberships). Body copy in
      `app/components/MaanDrOsamaCard.vue` uses a non-specific placeholder.
- [ ] **Portrait photo** — replace the icon placeholder in the same component.
- [ ] **License numbers** and any specialty accreditations to display under
      the bio card.

## Center Identity & Legal

- [ ] **Exact business address** (building, road, block, area) — currently
      shows "Kingdom of Bahrain" only in the footer.
- [ ] **Google Maps embed / geo coordinates** (latitude/longitude) — for the
      contact page map and LocalBusiness schema.
- [ ] **Official working hours** — currently footer shows
      "Working hours: to be announced".
- [ ] **Licenses and accreditations** — footer line + LocalBusiness schema.
- [ ] **Commercial Registration (CR) number** — for the footer / legal page.
- [ ] **Privacy policy + terms of service** — needed before launch.

## Analytics & Verification (Phase 6)

- [ ] **GA4 Measurement ID** — env var `NUXT_PUBLIC_GA_MEASUREMENT_ID`.
- [ ] **Google Search Console verification token** — env var
      `NUXT_PUBLIC_GSC_VERIFICATION`.
- [ ] **Google Business Profile URL** — for LocalBusiness schema `sameAs[]`.
- [ ] **Bing/Yandex verification** if applicable.

## Social & Contact (Phase 3 — HeyLink replacement)

WhatsApp number `+97332055666` is already wired everywhere (FAB, mobile bar,
hero CTAs, final CTA). Other channels remain unconfirmed:

- [ ] **Instagram URL**
- [ ] **Facebook URL**
- [ ] **YouTube URL**
- [ ] **TikTok URL** (if used)
- [ ] **Snapchat handle** (if used)
- [ ] **LinkedIn profile** (for Dr. Osama)
- [ ] **Public email address** — currently absent from footer.
- [ ] **Direct landline** (in addition to mobile/WhatsApp).

Until provided, do **not** add invented profile links in the footer or the
internal contact hub.

## Forms & Notifications (Phase 8)

- [ ] **Notification email** that receives new contact-form submissions.
      Env var: `NUXT_MAIL_TO`.
- [ ] **SMTP credentials** or transactional email provider (Postmark, Resend,
      SES) — env vars: `NUXT_MAIL_HOST`, `NUXT_MAIL_USER`, `NUXT_MAIL_PASS`.
- [ ] **WhatsApp Business API** (Twilio, MessageBird, or Meta directly) —
      if outbound automation is required beyond `wa.me`.

## Content Migration (Phase 5 — Blogger)

Source: https://osama-madbooly2.blogspot.com/p/blog-page_30.html

- [ ] **Full Blogger export file** (Atom XML) — needed to migrate all posts.
- [ ] **Existing Blogger URL → new article URL map** — for 301 redirects.
- [ ] **Featured-image rights** for each migrated article.
- [ ] **Author bios** for any non-Dr.-Osama contributors.
- [ ] **Library PDFs** — for the "المكتبة الرقمية" category currently empty.

## Statistics (Homepage)

- [ ] **Audited figures** for the four stat tiles (children supported,
      training hours, families supported, years of experience). Current
      values are marked as estimates.

## Testimonials

- [ ] **Approved parent quotes with written consent** — the three currently
      shown are illustrative placeholders attributed only to "Parent, City"
      with no children identified. Replace once real, consented testimonials
      are collected.

## Hosting & Infrastructure (Phase 9)

The app is already on Fly.io at `maan.center`. Outstanding items:

- [ ] **Backup destination** for Postgres + Tigris media (S3-compatible
      bucket name + retention policy).
- [ ] **Retention policy** (e.g., 30 daily, 12 monthly, 7 yearly).
- [ ] **Uptime monitor** (UptimeRobot, Better Stack, or Sentry Crons).
- [ ] **CDN configuration for static assets** if Tigris isn't sufficient.
- [ ] **Apex/www redirect behavior confirmation** (currently apex serves;
      www should 301 to apex).

## Phase 8 — Exit-Intent / Lead Magnet

- [ ] **Free PDF / guide asset** (Arabic + English) — exit-intent popup is
      scaffolded but **disabled** until a real downloadable is provided.
      Do not enable until the asset exists.

## Accessibility (Phase 7)

- [ ] **Listen-to-article TTS provider** decision (built-in Web Speech vs.
      ElevenLabs vs. Amazon Polly) — only commit when chosen.
- [ ] **WCAG AA contrast spot-check on real photography** — only possible
      once final images land.

---

> **Rule:** if an item above is unanswered, the corresponding UI keeps a clean
> placeholder, an empty state, or a `TODO_IMPLEMENTATION_REFERENCES` HTML
> comment near the relevant component. **Never** invent the missing data.
