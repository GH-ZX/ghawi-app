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

## Database

D1 database `ghawi-app-contacts`, migrations in `migrations/` (append-only; apply with
`pnpm exec wrangler d1 migrations apply ghawi-app-contacts --remote`).

- `contact_messages` — the inbox.
- `admin_login_attempts` — the sign-in throttle.
- `site_settings` — `site_theme` (the landing theme, read by `worker.ts`). Older keys
  from the previous settings page are unused.

Timestamps are stored as `strftime('%Y-%m-%dT%H:%M:%fZ')`. Compare them against
`new Date().toISOString()` (see `minutesAgo` in `src/lib/request.ts`), never a
space-separated date, or the string comparison stops being a time comparison.

## Cloudflare

`wrangler.jsonc` is the source of truth for the Worker `ghawi-app`. Its `main` is
`worker.ts`, which wraps the generated `.open-next/worker.js`. Also: `nodejs_compat`,
static assets, the R2 incremental cache, D1 (`CONTACT_DB`), email (`EMAIL`), the image
binding, the `ghawi.app` and `www.ghawi.app` custom domains, and the non-secret vars.
`public/_headers` sets long-lived caching for hashed assets and a week for `/media`.

`node-linker: hoisted` in `pnpm-workspace.yaml` is required: OpenNext copies
`node_modules` into its output, and pnpm's symlinked layout is unreadable there on
Windows.

If a build ever serves unstyled pages, `rm -rf .next .open-next` and rebuild — a stale
build directory is the usual culprit on Windows.
