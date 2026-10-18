# ghawi.app

The personal site of **Ahmed Ghawi** — software engineer and IT systems specialist,
builder of [GH Store](https://gh-store.me).

Next.js 16 (App Router) · React 19 · TypeScript · plain CSS on GH Store's design tokens ·
Cloudflare Workers via OpenNext · D1 for the contact inbox.

## Synced with GH Store

ghawi.app is built on **GH Store's own design system**, not a lookalike:

- **Tokens.** `src/lib/ghstore-ui.ts` is a verbatim copy of GH Store's
  `packages/ui/src/index.ts` — the four presets (Calm, Energetic, Minimal, Warm),
  each in light and dark, the status colours and the "GH." logo geometry. Refresh it
  with `pnpm sync:design` (from GitHub) or `pnpm sync:design ../GHSTORE-RE/ghstore`
  (from a local checkout), then review the diff. Never edit it here.
- **Components.** `src/styles/base.css` mirrors the store's building blocks — the
  floating glass header, pill tab bar, `.btn`, `.seg`, `.card`, `.badge`, `.tile--art`,
  `.num` and the self-drawing logo — with the same sizes, radii and motion.
- **The live look.** At build time `next.config.ts` reads
  `https://gh-store.me/api/config` and renders the site in whichever preset and
  default mode the store's owner last picked in GH Store's admin. If the store can't
  be reached the build falls back to Energetic, so it never fails over the look.
- **Staying in sync.** The deploy workflow runs every six hours, compares the store's
  look with the deployed page and redeploys only when they differ. "Run workflow" in
  GitHub Actions syncs immediately.
- **Real screenshots.** `public/media/store/` holds retina captures of gh-store.me —
  desktop and phone, Arabic and English, light and dark. The page shows the store in
  its own language and mode. Retake them when the store changes visibly.
- **Showing it off.** The GH Store section has a preset picker that re-themes the whole
  page for the visit. `?preset=calm|energetic|minimal|warm` and `?mode=light|dark`
  preview a look from any URL. The favicon, home-screen icon and link-preview card are
  generated from the same tokens.

Fonts are self-hosted with `next/font` (Rubik, Readex Pro, Alexandria, Tajawal,
El Messiri, JetBrains Mono — every family carries Arabic). Only the live preset's face
is preloaded; the others cost nothing until a preset uses them.

## Themes, and choosing one from the admin

The page can wear six themes: GH Store's four presets (Calm, Energetic, Minimal,
Warm) and two classic ghawi.app themes rebuilt in the same token format
(`src/lib/classic-themes.ts`):

- **Nocturne** — near-black, lime signal, hairline grid, mono labels.
- **Ember** — forge-warm black, molten copper headline, drifting heat, film grain.

Both classics open dark and have a light half (AA-checked), use Space Grotesk and
Inter with IBM Plex Sans Arabic for Arabic, and respect reduced motion.

**Admin → Theme** picks the live theme: *Follow GH Store* (the default) or any of the
six. The choice is stored in D1 (`site_settings.site_theme`) and applied **at the
edge**: `worker.ts` wraps OpenNext's Worker and, for `/en` and `/ar`, rewrites the
`<html>` theme attributes with `HTMLRewriter` as the prerendered page streams
through. Pages stay static; a change is live within 30 seconds (per-isolate cache),
with no deploy. Visitors still choose light or dark themselves.

`next dev` runs without the wrapper, so locally the page shows GH Store's preset;
use `?preset=nocturne` (or `pnpm run preview`) to see a pinned theme.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | Dynamic redirect | → `/ar` or `/en`: the visitor's earlier choice (`lang` cookie), else `Accept-Language`, else English |
| `/en`, `/ar` | Static | The site. Correct `<html lang dir>` from the `[lang]` root layout; Arabic is fully right-to-left |
| `/admin` | Dynamic | The contact inbox, `noindex` (own root layout) |
| `/api/contact` | Dynamic | Contact form endpoint |
| `/api/admin/*` | Dynamic | Inbox sign-in, sign-out, messages |
| `/og.png`, `/favicon.svg`, `/apple-touch-icon.png` | Static | Generated at build from the synced tokens |
| `/sitemap.xml`, `/robots.txt` | Static | |
| `/film/*`, `/atlas/*` | 308 | Old experiments, redirected to `/en` / `/ar` |

## Editing content

All words live in **`src/lib/content.ts`**, both languages side by side (`en`, `ar`).
Components hold no copy. `profile` and `links` hold contact details and URLs.

Arabic strings that contain `C#` carry a `‎` after it so the `#` stays beside its
letter in right-to-left text.

## Commands

```bash
pnpm dev            # next dev; Cloudflare bindings simulated locally
pnpm build          # next build
pnpm lint
pnpm typecheck      # needs worker-configuration.d.ts: run `pnpm cf-typegen` once
pnpm sync:design    # pull GH Store's tokens

pnpm run preview    # build the Worker and run it in workerd (closest to production)
pnpm run deploy     # build and deploy to Cloudflare
pnpm cf-typegen     # regenerate binding types after editing wrangler.jsonc
```

Use `pnpm run deploy`, not `pnpm deploy` — the latter is pnpm's own built-in command.

Preview another look locally: `GHSTORE_PRESET=warm GHSTORE_MODE=dark pnpm dev`.

Pushing to `main` deploys through `.github/workflows/deploy.yml` (lint → binding types →
typecheck → build → deploy), using the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` repository secrets.

## Contact form

`POST /api/contact` → **D1** (source of truth) → **Cloudflare Email** (notification).

- Validation runs in the browser for quick feedback and again on the server, which
  has the final word.
- **Turnstile** in "interaction-only" mode: invisible unless Cloudflare needs the
  visitor to act. Its script loads only when the form comes near the screen; a submit
  waits for the token, and fails fast if the widget errors or is blocked.
- **Honeypot** field: filled means a bot; it gets a success-shaped answer and is dropped.
- **Rate limit**: 5 messages per IP per hour, counted in D1. A limiter error never loses
  a message.
- **D1 first**: if the email fails, the row is still saved with `notified = 0`, and
  the inbox shows it under *Email undelivered*.

Read submissions from the terminal:

```bash
pnpm exec wrangler d1 execute ghawi-app-contacts --remote \
  --command "SELECT id, created_at, name, email, topic, notified FROM contact_messages ORDER BY id DESC LIMIT 20"
```

## Admin inbox

`https://ghawi.app/admin` — every contact message, with filters (Inbox, Archived,
All), search, reply by email, archive and delete.

| Name | Where | Notes |
| --- | --- | --- |
| `ADMIN_USERNAME` | `wrangler.jsonc` → `vars` | not a secret |
| `ADMIN_PASSWORD_HASH` | Workers Secret | PBKDF2-SHA256, 100,000 iterations |
| `ADMIN_SESSION_SECRET` | Workers Secret | HMAC key for the session cookie |

Rotate the password with `node scripts/hash-password.mjs "new-password"` and store the
printed line with `pnpm exec wrangler secret put ADMIN_PASSWORD_HASH`.

- The KDF always runs, so a wrong username and a wrong password take the same time.
- Sessions are stateless signed cookies: 8 hours, `HttpOnly`, `Secure`, `SameSite=Strict`.
- 8 failed attempts per IP lock sign-in for 15 minutes. The window slides: a failure
  after a quiet spell starts counting again. If the throttle can't be read, sign-in
  fails closed.

Workers' Web Crypto rejects PBKDF2 above 100,000 iterations; the stored hash records
its own count, so raising it later won't invalidate existing credentials.

## Wedding invitation · invite.ghawi.app

An Arabic, right-to-left wedding invitation on its own subdomain, served by the
same Worker. `next.config.ts` rewrites the host onto `/invite`: `invite.ghawi.app/`
is the general link (`/invite/general`), `invite.ghawi.app/haifa` a guest's own.
Under `next dev`, `http://invite.localhost:3000/haifa` behaves the same.

- **The page** (`src/components/invite/`): a sealed envelope that opens on a tap,
  swipe, scroll or key — the seal gives, the flap lifts, the card rises with
  «أحمد ♥ كريمته» — then the page: the couple in a square frame, the invitation as one sentence,
  the date (with the Hijri date) and a left-to-right countdown, the two halls (both
  parties start at the same time), gentle requests (no children, no hookahs), a
  reply card with numbers, and a farewell. One motion throughout: a soft fade-up.
  Light by default; the guest can switch to dark. Four themes (navy, blush, ivory —
  burgundy on ivory, the default — and terracotta) and six font pairings, both picked in the admin.
- **After the wedding**: on "auto" the invitation ends by itself once the wedding
  day is over (midnight, venue time) and every link shows a «تمّ الزواج» thank-you
  page in the same theme; the admin can also keep it live or end it now. Replies
  stay open until then (no deadline). Preview it with `?preview=1&ended=1`.
- **Opening**: a welcome screen first («تمّت دعوتك», the guest's title and name, a
  warm line; on the general link «دعوة خاصة · لحضور حفل زفاف · أحمد ♥ كريمته»;
  ~3.6 s, a tap skips it), then the envelope. Once open, a tap anywhere
  that isn't a control brings the next section to the top — no scrolling needed.
- **The date** is a slip of a calendar: five days in a line, left to right, the
  wedding day larger in the middle on a heart. Below the invitation text and before the farewell, two Islamic marks
  (`components/invite/islamic.tsx`): the verse of affection and mercy in an ogee
  cartouche, and an eight-pointed star holding two interlocked rings over the
  Prophet's blessing for the couple. Both texts are editable, each can be hidden.
  `components/invite/art.tsx` draws the marriage contract (a sealed scroll and a
  quill, «على سُنّة الله ورسوله») and the newlyweds as a plain black silhouette.
- **Contact**: people guests can reach, each with a WhatsApp button (`wa.me`) and
  their number; edited in the admin. Every text on the page uses the chosen
  font pairing — no generic sans for labels and buttons.
- **Wedding photos** (Admin → Invitation → Photos) appear on the invitation, on the
  thank-you page, or both — chosen per photo (`placement`, migration 0006). The
  invitation's photo section only exists once it has photos.
  The admin's browser resizes each photo (2000 px and a 640 px thumbnail) before
  upload; files go to R2 (`INVITE_PHOTOS`, bucket `ghawi-invite-photos`), rows to
  `invite_photos`. Every photo has an audience — everyone, or one party's guests
  only — checked on each request to `/api/invite/photo/<id>`: the general link
  sees "everyone" photos, a guest also their own party's. Ids are random UUIDs.
- **Reduced motion** keeps the fades and the tap-to-open envelope and drops travel
  and loops. Cutting animations to zero would leave their delays, so things pop in
  one by one — many Windows machines have "animation effects" off.
- **The monogram** (`src/lib/invite-monogram.ts`): أ and إ from Amiri (OFL) as SVG
  paths — the hamza above Ahmed's alef and below his bride's. An uploaded logo
  replaces it everywhere. `/invite/og.png` is the link preview, `/invite/monogram.svg`
  the mark on its own.
- **Admin → Invitation**: guests (personal link, honorific, which party they see,
  how many people, an optional theme and personal line), copy / WhatsApp / preview,
  who opened their link and when, every reply and the totals per party; and the
  settings — names (with a "deceased" option per father), every line of wording,
  the date and time (shared by both parties), each hall and its map link, the
  fathers' titles, theme, font, rules, logo, and the page's status.
- **Data**: `invite_settings` (the config JSON and the logo), `invite_guests`,
  `invite_rsvps` — migration `0004_invite.sql`. Nothing is hard-coded on the page;
  `DEFAULT_CONFIG` in `src/lib/invite.ts` only fills gaps.
- Opens are counted by a beacon the page sends (once per browser session), so
  WhatsApp's link-preview fetch and `?preview=1` visits from the admin don't count.
- The general link takes replies with a name, capped at 8 per IP per hour.

## Database

D1 database `ghawi-app-contacts`, migrations in `migrations/` (append-only; apply with
`pnpm exec wrangler d1 migrations apply ghawi-app-contacts --remote`).

- `contact_messages` — the inbox.
- `admin_login_attempts` — the sign-in throttle.
- `site_settings` — `site_theme` (the landing theme, read by `worker.ts`). Older keys
  from the previous settings page are unused.
- `invite_settings`, `invite_guests`, `invite_rsvps`, `invite_photos` — the wedding
  invitation (photo files themselves live in R2).

Timestamps are stored as `strftime('%Y-%m-%dT%H:%M:%fZ')`. Compare them against
`new Date().toISOString()` (see `minutesAgo` in `src/lib/request.ts`), never a
space-separated date, or the string comparison stops being a time comparison.

## Cloudflare

`wrangler.jsonc` is the source of truth for the Worker `ghawi-app`. Its `main` is
`worker.ts`, which wraps the generated `.open-next/worker.js`. Also: `nodejs_compat`,
static assets, the R2 incremental cache, D1 (`CONTACT_DB`), email (`EMAIL`), the image
binding, the `ghawi.app`, `www.ghawi.app` and `invite.ghawi.app` custom domains, and the non-secret vars.
`public/_headers` sets long-lived caching for hashed assets and a week for `/media`.

`node-linker: hoisted` in `pnpm-workspace.yaml` is required: OpenNext copies
`node_modules` into its output, and pnpm's symlinked layout is unreadable there on
Windows.

If a build ever serves unstyled pages, `rm -rf .next .open-next` and rebuild — a stale
build directory is the usual culprit on Windows.
