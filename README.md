# ghawi.app

Landing page for **Ahmed Ghawi** — software engineer & IT systems specialist.

Built with **Next.js 16 (App Router, Turbopack)**, **React 19**, **Tailwind CSS v4**, and
**TypeScript**. Deployed to **Cloudflare Workers** via the **OpenNext** adapter.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | 307 redirect | → `/en` |
| `/en` | Static | English page (default) |
| `/ar` | Static | Arabic page, full RTL layout |
| `/api/contact` | Dynamic | Contact form endpoint (Workers runtime) |
| `/sitemap.xml`, `/robots.txt` | Generated | From `src/lib/content.ts` |
| `/opengraph-image`, `/icon`, `/apple-icon` | Generated | Built at compile time via `next/og` |

Both language routes declare `canonical` and `hreflang` alternates (`en`, `ar`, `x-default`).

## Editing content

**All copy lives in one file: `src/lib/content.ts`.** You never need to touch a component
to change text.

- `copy.en` / `copy.ar` — hero, about, platform, code, capabilities, contact, form copy
- `platforms.en` / `platforms.ar` — the two platform deep-dives
- `repos.en` / `repos.ar` — the repository table
- `profile` — name, links, contact details, image paths
- `links` — external product URLs
- `marqueeItems` — the scrolling technology strip

To flip which language `/` defaults to, change `defaultLocale`.

Images live in `public/media/`:

- `ahmed.jpg` — portrait (square source, cropped to 4:5 via CSS)
- `gh-store-mark.png` — GH Store logo mark

## Commands

```bash
pnpm dev         # Next.js dev server, Cloudflare bindings simulated locally
pnpm build       # standard Next.js production build
pnpm start       # serve that build in Node
pnpm lint        # eslint

pnpm preview     # build + run inside workerd (closest to production)
pnpm deploy      # build + deploy to Cloudflare Workers
pnpm upload      # build + upload a new version without promoting it
pnpm cf-typegen  # regenerate worker-configuration.d.ts after editing wrangler.jsonc
```

> Always deploy from a clean tree. If you previously saw a 404'd CSS chunk or an
> unstyled page, `rm -rf .next .open-next` and rebuild — a stale build directory is
> the usual culprit on Windows.

## Contact form

`POST /api/contact` → **D1** (source of truth) → **Cloudflare Email Service** (notification).

The endpoint is deliberately defensive:

- **Validation is server-side.** Length caps, an allow-list for `topic`, and a permissive
  but non-trivial email regex. Client checks are a convenience, not a guarantee.
- **Honeypot.** A hidden `company` field. If it is filled, the request is accepted and
  silently dropped — a bot learns nothing.
- **Rate limit.** 5 submissions per IP per hour, counted in D1. If the limiter itself
  errors, the message is still accepted: a limiter outage must never lose mail.
- **D1 is authoritative.** Email failure does not fail the request — the row is already
  safe, and `notified` stays `0` so you can spot undelivered messages.
- **Degrades cleanly.** With no bindings present (plain `next dev`, Vercel), the endpoint
  still validates and logs instead of throwing.

Errors are returned as `{ ok: false, error: "<code>" }`; the client maps codes to localized
strings in `copy.*.contact.form.errors`.

### One-time setup

```bash
# 1. Create the D1 database (or let the first deploy provision it)
pnpm exec wrangler d1 create ghawi-app-contacts

# 2. Onboard the sending domain for transactional email
pnpm exec wrangler email sending enable ghawi.app

# 3. Apply the schema to production
pnpm exec wrangler d1 migrations apply ghawi-app-contacts --remote

# 4. Authenticate, then deploy
pnpm exec wrangler login
pnpm deploy
```

Reading submissions:

```bash
pnpm exec wrangler d1 execute ghawi-app-contacts --remote \
  --command "SELECT id, created_at, name, email, topic, notified
              FROM contact_messages ORDER BY id DESC LIMIT 20"
```

`notified = 0` means the row is stored but the notification email failed — the message is
still there, just not in your inbox.

### What is stored

Name, email, topic, message, locale, plus IP and user agent. The IP and UA are kept for
rate limiting and abuse investigation only. If you would rather not retain them, delete the
two columns in `migrations/0001_contact_messages.sql` and the corresponding bind values in
the route.

## Cloudflare configuration

`wrangler.jsonc` is the source of truth for the Worker.

| Key | Purpose |
| --- | --- |
| `compatibility_flags` | `nodejs_compat` is **required** by the adapter |
| `compatibility_date` | Must be `2024-09-23` or later |
| `assets` | Serves `.open-next/assets` with the `ASSETS` binding |
| `services` | Self-reference used by image optimization |
| `r2_buckets` | `NEXT_INC_CACHE_R2_BUCKET` for the incremental cache |
| `d1_databases` | `CONTACT_DB` — contact submissions |
| `send_email` | `EMAIL` — contact notifications |
| `vars` | `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — non-secret config |

`public/_headers` sets long-lived immutable caching for hashed Next assets and a one-week
window for `public/media` (those filenames are not content-hashed, so a swap would
otherwise go stale).

### Regenerating binding types

`worker-configuration.d.ts` is generated and gitignored. Run `pnpm cf-typegen` after any
change to `wrangler.jsonc`, otherwise the compiler will not notice a renamed binding. The
route reads its bindings from this generated `CloudflareEnv` type, so drift is a build
error rather than a runtime surprise.

## Pointing ghawi.app at it

After the first deploy, the Worker exists at `ghawi-app.<your-subdomain>.workers.dev`.
Attach the custom domain from the Cloudflare dashboard (**Workers → ghawi-app → Settings →
Domains & Routes → Add Custom Domain**), or add a route in `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "ghawi.app", "custom_domain": true }]
```

For the DNS side at Name.com, the cleanest path is to put the zone on Cloudflare: add
`ghawi.app` in the Cloudflare dashboard, then set Name.com's nameservers to the pair
Cloudflare assigns. That gives you Workers routing, caching, and TLS without manual record
chasing. If you would rather keep Name.com's DNS, add a CNAME for `www` pointing at the
Worker and an `A`/`AAAA` for the apex.

## Design system

Tokens are CSS custom properties in `src/app/globals.css`, exposed to Tailwind v4 through
`@theme inline`:

| Token | Value | Use |
| --- | --- | --- |
| `--bg`, `--bg-1/2/3` | `#07080a` → `#151a1f` | Canvas and elevated surfaces |
| `--fg`, `--fg-2`, `--fg-3` | `#edf0f2` → `#67717a` | Text hierarchy |
| `--acc` | `#d4ff3f` | Single signal accent |
| `--line`, `--line-2`, `--line-3` | white at 8 / 14 / 24 % | Hairlines |

Type: **Space Grotesk** (display), **Inter** (body), **JetBrains Mono** (labels, metadata),
**IBM Plex Sans Arabic** (Arabic glyphs). Latin faces come first in every font stack and
IBM Plex Sans Arabic picks up Arabic characters per-glyph, so mixed-script lines need no
special-casing. Letter-spacing is neutralised on the Arabic route.

Hairline grids are built with `gap-px` over a line-coloured background rather than borders —
that keeps dividers correct in both writing directions with no `rtl:` overrides.

Motion respects `prefers-reduced-motion`; `.reveal` elements are forced visible when scripting
is unavailable, so content is never trapped behind an observer.

## Notes

- `cacheComponents` is intentionally **off**. There is no ISR and no request-time page
  data; the Cache Components model would only add constraints.
- The platform diagrams in `src/components/platform-visuals.tsx` are drawn in HTML/CSS
  rather than screenshots — they stay sharp, weight nothing, and never go stale.
- `node-linker: hoisted` in `pnpm-workspace.yaml` is required. OpenNext copies
  `node_modules` into its output and esbuild walks that tree; pnpm's symlinked layout is
  unreadable from there on Windows.
- Cloudflare now steers new apps toward **vinext**. OpenNext is used here because it is
  the documented path for an existing Next.js app and is not in beta.