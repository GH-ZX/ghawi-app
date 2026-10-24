# ghawi.app

The personal site of **Ahmed Ghawi** — software engineer and IT systems specialist,
builder of [GH Store](https://gh-store.me).

Next.js 16 (App Router) · React 19 · TypeScript · plain CSS on GH Store's design tokens ·
Cloudflare Workers via OpenNext · D1 for the inbox, the editable content and the stats.

Every word, link, price and CV line is edited in the admin (**Admin → Site**, and the
**CV builder** at `cv.ghawi.app/edit`) and live within 30 seconds, no deploy.

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
- **Showing it off.** The footer has a preset picker that re-themes the whole
  page for the visit (Admin → Site → Basics can hide it). `?preset=calm|energetic|minimal|warm` and `?mode=light|dark`
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
edge**: `worker.ts` wraps OpenNext's Worker and, for `/en`, `/ar` and the case
studies, rewrites the `<html>` theme attributes with `HTMLRewriter` as the page
streams through. A change is live within 30 seconds (per-isolate cache), with no
deploy. Visitors still choose light or dark themselves.

`next dev` runs without the wrapper, so locally the page shows GH Store's preset;
use `?preset=nocturne` (or `pnpm run preview`) to see a pinned theme.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | Dynamic redirect | → `/ar` or `/en`: the visitor's earlier choice (`lang` cookie), else `Accept-Language`, else English |
| `/en`, `/ar` | Dynamic, edge-cached | The site, from the content in D1. Correct `<html lang dir>` from the `[lang]` root layout; Arabic is fully right-to-left |
| `/en/work/<slug>`, `/ar/work/<slug>` | Dynamic, edge-cached | Case studies: `gh-store`, `store-bot`, `storefront` |
| `cv.ghawi.app` (`/`, `/ar`) | Dynamic, edge-cached | The CV, black on white (`/resume/[lang]`, own root layout) |
| `cv.ghawi.app/edit` | Dynamic | The CV builder: sign in, edit with a live preview, print to PDF (`/resume/edit`) |
| `cv.ghawi.app/ahmed-ghawi-cv(-ar).pdf` | Dynamic | The CV as PDF: the one uploaded in the builder, else `public/media/cv` (`/cv/[file]`) |
| `/admin` | Dynamic | Invitation, inbox, site content, stats and theme; `noindex` (own root layout) |
| `boti.ghawi.app` (`/boti`) | Dynamic | boti, the Plus Store X client panel: sign in, then clients, ship, new client, API library; `noindex` (own root layout) |
| `/api/boti/*` | Dynamic | boti's API (admin session): clients, ship, runs, wizard, adapters |
| `/api/library` | Dynamic | The API library for client bots (`Authorization: Bearer <library key>`) |
| `/api/contact` | Dynamic | Contact form endpoint |
| `/api/track` | Dynamic | The page's visit and click counter (no cookies) |
| `/api/admin/*` | Dynamic | Sign-in, sign-out, messages, site content, files, stats, theme, invitation |
| `/og.png`, `/favicon.svg`, `/apple-touch-icon.png` | Static | Generated at build from the synced tokens |
| `/sitemap.xml`, `/robots.txt` | Static | |
| `/film/*`, `/atlas/*` | 308 | Old experiments, redirected to `/en` / `/ar` |

## Editing content

**Admin → Site** edits everything on the page, English and Arabic side by side:
the hero, every section, prices, process steps, testimonials, case studies, menus,
search titles, and under **Basics** the contact details, GH Store links, availability
(the badge's colour), where the hero's chat button goes, and the order and visibility
of the sections. **Admin → Stats** shows visits, clicks (Telegram, WhatsApp, the
store bot, the CV…), messages, referrers and countries — counted by the site itself,
no cookies, the admin's own visits left out.

The edits are one JSON document in D1 (`site_settings.site_content`) laid over the
defaults in **`src/lib/content.ts`** — both languages side by side, plus the shape of
everything editable. `sanitizeContent` (`src/lib/site-content.ts`) reshapes every save
to that shape, so a field the code adds later simply appears with its default, and the
page never sees junk. Components hold no copy.

Pages render per request from that document; `worker.ts` keeps the rendered HTML in
the edge cache under the deploy's id (`CF_VERSION_METADATA`) and the content's save
time, so visitors get a cached page and a save or a deploy starts fresh. A signed-in
admin always sees a fresh render.

### The CV

`cv.ghawi.app` is the CV, `cv.ghawi.app/edit` its builder (the admin account; sign in
once per subdomain). Saving there writes the same content document. **Print / PDF**
prints the preview; upload that PDF in the builder and "Download PDF" serves it — the
builder flags a PDF older than the last save. Without an upload, the PDFs in
`public/media/cv/` are served. Under `next dev`, `http://cv.localhost:3000` and `/edit`
work the same, and the site links to `/resume/en` instead.

Arabic strings that contain `C#` carry a `‎` after it so the `#` stays beside its
letter in right-to-left text.

## Commands

```bash
pnpm dev            # next dev; Cloudflare bindings simulated locally
pnpm build          # next build
pnpm lint
pnpm typecheck      # needs worker-configuration.d.ts: run `pnpm cf-typegen` once
pnpm sync:design    # pull GH Store's tokens
pnpm test           # vitest: boti's crypto, JSON paths, spec validator, wrangler.jsonc editor

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
  Light by default; the guest can switch to dark. Six themes (burgundy on ivory —
  the default — navy, blush, terracotta, white & black, olive), and an ornament
  colour chosen apart from the theme (gold, silver, rose gold, pearl white — pale
  pearl grey on light pages — or the theme's own colour) and six font pairings, both picked in the admin.
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
- **The logo** is the couple's engagement mark — أ and إ as two interlaced alefs,
  the hamza above the first and below the second. The original artwork is kept in
  `src/assets/invite/logo-source.jpg`; `scripts/trace-logo.py` traces it (smoothing
  the JPEG edges, dropping a stray overlap line) into `public/invite-logo.svg` and
  `src/lib/invite-logo.ts`, which every surface draws from: the seal, the hero, the
  welcome screen, QR cards, `/invite/og.png` and the tab icon. An uploaded logo
  replaces it everywhere.
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

- `contact_messages` — the inbox (with the visitor's `budget` range since 0007).
- `admin_login_attempts` — the sign-in throttle.
- `site_settings` — `site_theme` (the landing theme) and `site_content` (every word
  on the site and the CV, as JSON), both read by `worker.ts`. Older keys from the
  previous settings page are unused.
- `site_files` — the CV PDFs uploaded in the builder (`cv-en`, `cv-ar`).
- `site_events` — Admin → Stats: per-day counts of views, clicks, messages, referrers
  and countries. Nothing per person.
- `invite_settings`, `invite_guests`, `invite_rsvps`, `invite_photos` — the wedding
  invitation (photo files themselves live in R2).
- `boti_clients`, `boti_adapters`, `boti_events` — boti: what GitHub doesn't know about
  each client (domain, bot, Supabase ref, the library key's SHA-256), the API library's
  specs, and the activity log (since 0008).

Timestamps are stored as `strftime('%Y-%m-%dT%H:%M:%fZ')`. Compare them against
`new Date().toISOString()` (see `minutesAgo` in `src/lib/request.ts`), never a
space-separated date, or the string comparison stops being a time comparison.

## Cloudflare

`wrangler.jsonc` is the source of truth for the Worker `ghawi-app`. Its `main` is
`worker.ts`, which wraps the generated `.open-next/worker.js`. Also: `nodejs_compat`,
static assets, the R2 incremental cache, D1 (`CONTACT_DB`), email (`EMAIL`), the image
binding, `CF_VERSION_METADATA` (the deploy's id, for the edge cache), the
`ghawi.app`, `www.ghawi.app`, `invite.ghawi.app`, `cv.ghawi.app` and `boti.ghawi.app` custom domains,
and the non-secret vars.
`public/_headers` sets long-lived caching for hashed assets and a week for `/media`.

`node-linker: hoisted` in `pnpm-workspace.yaml` is required: OpenNext copies
`node_modules` into its output, and pnpm's symlinked layout is unreadable there on
Windows.

If a build ever serves unstyled pages, `rm -rf .next .open-next` and rebuild — a stale
build directory is the usual culprit on Windows.

## boti · boti.ghawi.app

The coder's control panel for the **Plus Store X** client bots. The product repo
(`BOTI_REPO`, `GH-ZX/plus-store-x`) has one branch per client, `client/<name>`, listed
in `.github/clients.json`. Its *Sync client repo* Action mirrors a client branch to the
client's own repo on every push, and the client's Cloudflare deploys it. boti drives that
flow from a browser. Sign in with the ghawi.app admin account (each host keeps its own
session cookie, like `cv.ghawi.app/edit`).

| Tab | What it does |
| --- | --- |
| **Clients** | Every client in `clients.json` with the details boti keeps (domain, bot, Supabase ref, notes): site up or down (`https://<domain>/health`), updates behind `main` (compare API), the last sync run, links to the store, panel and bot. **Activity** lists the latest boti actions. |
| **Ship** | Pick clients (or "the ones behind"), then merge `main` into each `client/<name>`. Every merge starts that client's sync; the page follows the runs live. A conflict links to the compare page: resolve it locally. |
| **New client** | Name, client repo, Supabase URL/ref, Worker name, domain, bot. Steps, each retryable: **Deploy key** (Ed25519 pair made in the Worker; the private key goes straight into the repo secret `DEPLOY_KEY_<NAME>`, only the public key comes back), **Register** (adds the entry to `clients.json` on `main`), **Client branch** (`client/<name>` from `main`, with `"name"` and `vars.SUPABASE_URL` set in `wrangler.jsonc`, comments kept), **Keys** (`ENCRYPTION_KEY`, `TELEGRAM_WEBHOOK_SECRET`, a library key — shown once). Then a printable checklist for the owner, and **Run first sync** for when they have added the deploy key. |
| **API library** | Provider and payment APIs as JSON specs (format below): edit with live validation, enable/disable; the version goes up on every save. **Try it** runs one endpoint from the server with a token typed in the form (never stored) and shows the request, the mapped result and the raw reply. |

Setup, once:

1. `pnpm exec wrangler d1 migrations apply ghawi-app-contacts --remote` (adds 0008).
2. A fine-grained GitHub token for `GH-ZX/plus-store-x` only, with **Contents: read and
   write**, **Actions: read and write**, **Secrets: read and write** and **Metadata: read**:
   `pnpm exec wrangler secret put GITHUB_TOKEN`. `BOTI_REPO` is a var in `wrangler.jsonc`.
3. Deploy (push to `main`). The `boti.ghawi.app` custom domain is in `wrangler.jsonc`'s routes.

Locally, `boti.localhost:3000` (or `localhost:3000/boti`) works under `pnpm dev`, with
`GITHUB_TOKEN` and `BOTI_REPO` in `.dev.vars`.

Client bots read the library at `https://boti.ghawi.app/api/library` with
`Authorization: Bearer <LIBRARY_KEY>` (their Cloudflare secret `LIBRARY_KEY`, var
`LIBRARY_URL`). Only the key's SHA-256 is stored here; **Keys** issues a new one.

### Adapter spec

One JSON object per API. `src/lib/boti/spec.ts` holds the types and the validator, and
`src/lib/boti/examples.ts` the two examples below. The bot implements the same format.

**Common fields**

- `kind`: `"provider"` or `"payment"`; `id`: a slug; `name`; `version`: a whole number
  (boti bumps it on every save).
- `base_url`: the default `https://` base; a client may override it in their panel.
- `auth`: `{"type":"header","name":"Authorization","format":"Bearer {token}"}`,
  `{"type":"query","name":"api_key"}` or `{"type":"none"}`.
- **Templates:** `"{var}"` in `path`, `query` values, `body` strings and the auth
  `format`. A body value that is exactly `"{var}"` keeps the variable's type (numbers stay numbers).
- **JSON paths** (a subset): `$` is the whole body, then `.field` and `[index]` steps:
  `$.data.items[0].code`. `list` is the path of the array to iterate; `map` values are
  paths relative to each list item, or to the body when there is no `list`.
- **Endpoint:** `{"method","path","query"?,"body"?,"list"?,"map"}`.

**Provider**

- `endpoints.balance` (map `amount`, `currency`?).
- `endpoints.products` (needs `list`; map `id`, `name`, `price`, and optionally `stock`,
  `description`, `image`, `min_qty`, `max_qty`).
- `endpoints.order` (vars `product_id`, `quantity`, `reference`, plus each `requires`
  field the customer typed, like `{email}`; map `order_id`, `status`, `items`? — an
  array of strings or one string).
- `endpoints.status` (var `order_id`; map `status`, `items`?).
- `status_map`: `{"delivered":[…],"pending":[…],"failed":[…]}` — the API's status
  values in each group.
- Optional: `price_currency` (`"USD"`) and `requires`: `[{"key","label_en","label_ar"}]`.

**Payment**

- `create` (vars `amount`, `currency`, `reference`, `webhook_url`, `return_url`; map
  `id`, and optionally `pay_url`, `address`, `pay_amount`, `pay_currency`, `expires_at`).
- `status` (var `id`; map `status`, `paid_amount`?).
- `status_map`: `{"paid","pending","expired","failed"}`.
- `webhook`? — `{"signature":{"type":"hmac-sha256"|"hmac-sha512"|"none","header","encoding":"hex"|"base64"},"map":{"id","status"}}`.

Example provider (a typical "products / order / order status" store API):

```json
{
  "kind": "provider", "id": "example-store", "name": "Example Store API", "version": 1,
  "base_url": "https://api.example-store.com/v1",
  "auth": { "type": "header", "name": "Authorization", "format": "Bearer {token}" },
  "endpoints": {
    "balance":  { "method": "GET", "path": "/me/balance", "map": { "amount": "$.data.balance", "currency": "$.data.currency" } },
    "products": { "method": "GET", "path": "/products", "query": { "page_size": "200" }, "list": "$.data",
                  "map": { "id": "$.id", "name": "$.title", "price": "$.price", "stock": "$.stock",
                           "description": "$.description", "image": "$.image_url", "min_qty": "$.min", "max_qty": "$.max" } },
    "order":    { "method": "POST", "path": "/orders",
                  "body": { "product_id": "{product_id}", "quantity": "{quantity}", "reference": "{reference}", "email": "{email}" },
                  "map": { "order_id": "$.data.id", "status": "$.data.status", "items": "$.data.items" } },
    "status":   { "method": "GET", "path": "/orders/{order_id}", "map": { "status": "$.data.status", "items": "$.data.items" } }
  },
  "status_map": { "delivered": ["completed", "delivered"], "pending": ["pending", "processing"], "failed": ["failed", "cancelled", "refunded"] },
  "price_currency": "USD",
  "requires": [{ "key": "email", "label_en": "Account email", "label_ar": "بريد الحساب" }]
}
```

Example payment (crypto invoices):

```json
{
  "kind": "payment", "id": "example-pay", "name": "Example Crypto Invoices", "version": 1,
  "base_url": "https://api.example-pay.com",
  "auth": { "type": "header", "name": "X-Api-Key", "format": "{token}" },
  "create": { "method": "POST", "path": "/v1/invoices",
              "body": { "amount": "{amount}", "currency": "{currency}", "order_id": "{reference}",
                        "callback_url": "{webhook_url}", "success_url": "{return_url}" },
              "map": { "id": "$.result.uuid", "pay_url": "$.result.url", "address": "$.result.address",
                       "pay_amount": "$.result.payer_amount", "pay_currency": "$.result.payer_currency", "expires_at": "$.result.expired_at" } },
  "status": { "method": "GET", "path": "/v1/invoices/{id}", "map": { "status": "$.result.status", "paid_amount": "$.result.paid_amount" } },
  "status_map": { "paid": ["paid", "paid_over"], "pending": ["check", "process", "confirm_check"],
                  "expired": ["cancel", "expired"], "failed": ["fail", "system_fail", "wrong_amount"] },
  "webhook": { "signature": { "type": "hmac-sha256", "header": "X-Signature", "encoding": "hex" }, "map": { "id": "$.uuid", "status": "$.status" } }
}
```
