# ghawi.app

Landing page for **Ahmed Ghawi** — software engineer & IT systems specialist.

Built with **Next.js 16 (App Router, Turbopack)**, **React 19**, **Tailwind CSS v4**, and
**TypeScript**. Deployed to **Cloudflare Workers** via the **OpenNext** adapter.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | 307 redirect | → `/en` or `/film/en`, per the admin's live-design setting |
| `/en` | Static | **Grid** design, English (default) |
| `/ar` | Static | **Grid** design, Arabic, full RTL layout |
| `/film/en` | Static | **Film** design, English — a separate presentation of the same page |
| `/film/ar` | Static | **Film** design, Arabic, RTL |
| `/admin`, `/admin/login` | Dynamic | Admin console, `noindex` |
| `/api/contact` | Dynamic | Contact form endpoint (Workers runtime) |
| `/api/site-config` | Dynamic | Public theme + live-design config, edge-cached 60s |
| `/sitemap.xml`, `/robots.txt` | Generated | From `src/lib/content.ts` |
| `/opengraph-image`, `/icon`, `/apple-icon` | Generated | Built at compile time via `next/og` |

Both language routes declare `canonical` and `hreflang` alternates (`en`, `ar`, `x-default`).

## The two designs

The site ships **two independent landing page designs**. They are not two themes —
they share no layout, no stylesheet, no fonts and no components.

| | Grid (`(grid)` group) | Film (`(film-en)` / `(film-ar)` groups) |
| --- | --- | --- |
| Character | Engineering dashboard | Cinematic title card |
| Structure | Hairline grid, bordered cards | No borders; scale and space only |
| Type | Space Grotesk / Inter / JetBrains Mono | Instrument Serif / Plus Jakarta Sans / Noto Kufi |
| Arabic | IBM Plex Sans Arabic | Noto Kufi + Noto Sans Arabic |
| Palette | Three switchable themes (Nocturne, Paper, Ember) | One fixed near-black palette |
| Stylesheet | `src/app/(grid)/globals.css` | `src/styles/film.css` |
| Components | `src/components/*.tsx` | `src/components/film/*.tsx` |

They are built on **separate root layouts** via Next.js route groups, so `/film/*`
never loads the grid stylesheet, fonts or theme script, and `<html lang>`/`dir` is
correct from the root rather than set on a wrapper mid-tree.

The only shared dependency is `src/lib/content.ts` — the copy should not fork.

**Switching between them** is an admin setting (`Settings → Live site design`).
`/` reads the `landing` value from D1 and redirects; both destinations stay
prerendered and directly addressable, so switching costs nothing and loses
nothing.

`/film/*` is a *presentation* of the same content, not a second page: it declares
`canonical` back to `/en` and `/ar` to avoid duplicate-content signals.

## Editing content

**All copy lives in one file: `src/lib/content.ts`.** You never need to touch a component
to change text.

- `copy.en` / `copy.ar` — hero, about, platform, code, capabilities, contact, form copy
- `platforms.en` / `platforms.ar` — the three platform deep-dives
- `repos.en` / `repos.ar` — the repository table (`liveUrl` adds a "live" badge)
- `profile` — name, links, contact details, image paths
- `links` — external product URLs (store, factory, Telegram bot, echocore)
- `marqueeItems` — the scrolling technology strip

Adding a platform means adding one object to `platforms.en` and `platforms.ar`.
If its `id` has no matching case in the `Visual` switch in
`src/components/platform-visuals.tsx`, the Grid card renders without a diagram
rather than the wrong one — add a case alongside.

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

## Admin console

`https://ghawi.app/admin`

**No credential material is in this repository.** The password is stored as a
PBKDF2-SHA256 hash and the session secret is random, both in Workers Secrets.
The username is a plain `vars` entry because it is not a secret.

| Name | Where | Notes |
| --- | --- | --- |
| `ADMIN_USERNAME` | `wrangler.jsonc` → `vars` | `ahmedgh` |
| `ADMIN_PASSWORD_HASH` | Workers Secret | PBKDF2, 100k iterations |
| `ADMIN_SESSION_SECRET` | Workers Secret | HMAC signing key |

Rotating the password:

```bash
node scripts/hash-password.mjs "new-password"
# then pipe the single output line into the secret store
```

> Cloudflare's Web Crypto **rejects PBKDF2 above 100,000 iterations**, so that
> is the ceiling here. The hash stores its own iteration count, so raising it
> later will not invalidate existing credentials.

### How it works

- Password: PBKDF2-SHA256 with a constant-time compare. The KDF always runs, so
  a wrong username and a wrong password take the same wall-clock time — the
  endpoint never reveals which usernames exist.
- Session: stateless HMAC-signed cookie, 8-hour TTL, `HttpOnly` + `Secure` +
  `SameSite=Strict`. Nothing to store server-side, nothing to purge on restart.
- Throttle: 8 attempts per IP with a 15-minute lockout, cleared on success. A
  throttle outage fails closed rather than open.
- `/admin` and `/api` are disallowed in `robots.txt` and send
  `X-Robots-Tag: noindex, nofollow`.

### What it gives you

- **Inbox** — every contact submission with archive, delete, and mailto reply.
  The *Email undelivered* counter surfaces messages that saved to D1 but whose
  notification failed, which is the failure mode storage alone would hide.
- **Settings** — live site design (Grid or Film), title and description per locale,
  a theme picker, and a maintenance toggle. Writes pass a key allow-list, so no
  arbitrary key can be persisted, and enumerated values (`theme`, `landing`) are
  validated against a known set before they are stored — a rejected value can
  never leave the admin believing it applied.
- **System** — deployment facts and the wrangler commands worth remembering.

## Themes

Themes apply to the **Grid** design only. Three are available — Nocturne (dark,
lime signal), Paper (warm off-white, amber) and Ember (forge-warm, molten copper)
— and the admin picks which one is live site-wide. The header toggle lets a
visitor override it for themselves, and that choice is remembered locally.

The Film design has one fixed palette by design and carries no theme toggle.

A tiny inline script applies the choice before first paint, so a returning
visitor never sees the wrong theme flash. It resolves in order: the visitor's own
stored choice → the admin's live choice (a synchronous request against the
edge-cached `/api/site-config`) → the build-time default.

## Film scroll motion

`src/components/film/scroll.tsx` holds the choreography. Five distinct motions,
rather than one reveal repeated:

| | |
| --- | --- |
| `ScrollProgress` | Hairline across the top that fills with read depth |
| `Parallax` | Element drifts against the page as it passes (numbers, portrait) |
| `Scrub` | Mask tracks scroll position instead of playing on entry (statement) |
| `Drift` | Stack strip travels sideways against vertical scroll |
| `CountUp` | Figures count once on entry, expo-eased |

Constraints the module holds to:

- IntersectionObserver decides *when*; only continuous work reads scroll, and all
  of it shares one rAF loop rather than a listener per element.
- Only `transform` and `opacity` are animated, so the page never reflows.
- `prefers-reduced-motion` short-circuits every path to its final state.
- The media query is read with `useSyncExternalStore`, not `useState` + effect.

The backdrop is intentionally flat: a fixed grain layer over the stage colour,
plus the hero's `.shaft`. A video backdrop was tried and removed — it cost the
page its scroll smoothness and added nothing.

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