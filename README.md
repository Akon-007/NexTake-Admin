# NexTake Admin

The authenticated editorial console for the **NexTake** technology news wire.
It shares one data model with the public NexTake blog: admins write, schedule
and place stories here, and the blog renders them from the same Supabase
tables — no duplicated schema, no hardcoded content.

> The public blog page is untouched. This repository only contains the admin
> console and the shared database schema it depends on.

---

## 1. Authentication

The old hardcoded login — a fixed admin email plus a masked passkey field that
granted access on click — has been **removed**. Sign in is now a two-step
identity verification backed by Supabase Auth:

1. **Credentials** — the email and password are checked by Supabase Auth
   (bcrypt-hashed server side). No credential material exists in the bundle.
2. **Email verification** — a time-limited 6-digit code (or a secure link,
   depending on the project's email template) is sent to the administrator's
   registered address.
3. **Access** — only after the code is verified is a session created *and*
   the account confirmed to exist in `public.admin_profiles`.

### Guarantees

| Requirement | Implementation |
| --- | --- |
| No hardcoded credentials | No emails, passwords or tokens in source |
| Password hashing | Handled by Supabase Auth (never client-side) |
| Session persistence | `persistSession` + `autoRefreshToken`; survives refresh, expires with the refresh token |
| Route protection | `AppShell` renders the console only when `status === "authenticated"` |
| API protection | Row level security on every table; writes require `public.is_admin()` |
| Logout | `supabase.auth.signOut()` clears the persisted session |
| Errors | Invalid credentials, expired/incorrect codes, unconfirmed emails, rate limits and delivery failures all map to readable messages |

### First-time setup

```bash
cp .env.example .env      # add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Then, in Supabase:

1. **Push the schema** (Supabase CLI, or paste the SQL manually):

   ```bash
   npm run db:migrate   # runs `supabase db push` — requires `supabase link`
   ```

   Or paste `supabase/migrations/0001_nextake_admin.sql` into the SQL Editor
   (the file is idempotent — safe on a project that already hosts the blog).

2. **Seed reference data** — run the contents of `supabase/seed.sql` in the
   SQL Editor (companies, site copy, default settings). For a local Supabase
   stack, `npm run db:seed` runs `supabase db reset --local` which applies
   both migrations and seeds in one step.

3. **Authentication → Users → Add user** and set the admin's password.
4. Promote them:

   ```sql
   select public.promote_admin('editor@nextake.africa');
   ```

5. **Authentication → Emails** — keep the *Confirm signup* / OTP template so a
   6-digit code is mailed at step 2.

### Demo mode

Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the console runs against
a **local demo workspace** (in-memory/localStorage, clearly badged in the UI).
Any well-formed email plus an 8+ character password passes step 1 and the
verification code is shown in a demo panel instead of being emailed. No
credentials are stored anywhere.

---

## 2. Editorial CMS

`Articles → New story` covers every field the public blog displays. The editor
is split into the same four groups used by the spec:

**A. Source & link** — source URL (required), source name (required), source
logo/favicon (upload or URL), original author byline, original publication
date, link behaviour (`external` → straight to the publisher, `reader` → the
NexTake reader with source credit).

**B. Content & editorial** — headline (required, slug auto-generated),
executive summary (required), key takeaways (add / edit / reorder / remove),
category (shared list with the blog), tags (multi-add, stored as JSON so they
can be filtered), cover image (required, upload or URL with preview and
validation), image credit, estimated reading time.

**C. SEO & syndication** — canonical URL (required), syndication licence
(Fair Use Summary / Full Licensed Syndication / Press Release) and a rich-text
syndicated body. Choosing *Fair Use Summary* while a body is present is
rejected, so full text can only be stored where the rights exist.

**D. Placement & visibility** — status (draft / published / scheduled /
archived), publish date-time, hero carousel priority 1–5, The Daily Edit
toggle, breaking-news toggle and related companies/operators.

Validation runs **client-side** (`src/lib/validation.ts`) and **server-side**
(`CHECK` constraints, `NOT NULL`, RLS in the migration).

---

## 3. How the blog consumes this data

| Blog surface | Source |
| --- | --- |
| Feed wire / category pages | `published_articles` view (`status = 'published'` and `published_at <= now()`) |
| Hero carousel | `hero_carousel` view — ordered by `hero_priority` |
| Breaking banner | `breaking_alert` view — `is_breaking` |
| The Daily Edit | `daily_edit_queue` view — `in_daily_edit` |
| Article / reader page | `articles` row by `slug`; `link_behavior` decides whether the reader opens internally or jumps to `source_url` |
| Newsletter | `newsletter_subscribers` (Daily / Weekend / All Signals) |
| Media | `nextake-media` storage bucket (public read, admin write) |

`src/lib/backend/mappers.ts` is tolerant in both directions: legacy columns
(`excerpt`, `content`, `image`, `read_time`, `is_new`) are kept in sync so an
older blog build keeps rendering while the CMS fields take over.

**Live preview** in the console renders the public feed, hero carousel and
breaking banner from these exact records, so placement can be checked before
publishing.

---

## 4. Brand consistency

| Token | Value |
| --- | --- |
| Mint | `#00F2AA` (highlight `#3DF2AC`) |
| Canvas / navy | `#05080C`, `#040A12` |
| Navigation & surfaces | `#070B10`, `#090D14`, `#0D1624`, `#0E1726` |
| Borders | `#161F2C`, `#1F2937` |
| Text | `#FFFFFF`, `#F8FAFC`, `#94A3B8`, `#64748B` |

* Display / wordmark: **Cabinet Grotesk** with **Plus Jakarta Sans** fallback
  (700/800/900, tight tracking).
* Body: **Plus Jakarta Sans** 400/500/600, line-height 1.6.
* Technical text (category pills, dates, reading times, telemetry, slogan,
  ticker): **JetBrains Mono**.
* Brand artwork (drop the files straight into `public/` — they are picked up
  automatically):

  | File | Size | Used for |
  | --- | --- | --- |
  | `icon.png` | square | UI logo lockup, browser tab and touch icon (falls back to `icon.svg`) |
  | `header.png` | 1800×420 | Desktop banner on the public header and the sign-in screen |
  | `footer.png` | 1800×500 | Brand showcase across the top of the public and admin footers |

  `public/icon.svg` holds the scalable NT mark — navy vertical pillar, 95px
  lower diagonal mint ribbon, angled negative-space channel and the mint
  accent polygon folded over the T's crossbar.
* Mobile keeps the compact lockup: small square icon plus the NEXTAKE
  wordmark with the AKE portion in mint, above a news-wire bar carrying the
  slogan.

---

## 5. Project layout

```
src/
  lib/
    config.ts               env + brand constants
    supabase.ts             guarded client (null when unconfigured)
    validation.ts           shared client-side rules
    auth/AuthProvider.tsx   session + two-step verification state machine
    backend/                supabase ⇄ demo implementations of one interface
    store/CmsProvider.tsx   articles, companies, settings, activity
  components/
    brand/                  NexTake mark + wordmark
    auth/                   sign-in screen, six-digit code entry
    admin/                  header, sidebar, footer, layout, logout
    pages/                  dashboard, article list, editor, placement, preview
    ui/                     buttons, fields, image upload, rich text, modal
supabase/
  migrations/               shared schema, RLS, views, storage policies
  seed.sql                  companies + site copy + admin bootstrap
scripts/smoke.mjs           headless flow test (jsdom)
```

## 6. Testing

```bash
npm run build      # type-check + production build
npm run lint
npm run smoke      # headless: auth → validation → publish → preview → logout
```

The smoke test boots the built bundle in jsdom and asserts:

1. the auth screen renders with no hardcoded credentials,
2. email/password validation rejects bad input,
3. credentials trigger an emailed verification code,
4. a wrong code is rejected,
5. the correct code opens the console,
6. the editor exposes all four CMS field groups,
7. server-equivalent validation blocks an incomplete story,
8. publishing a story lands it in the list **and** on the public feed preview,
9. logout clears the persisted session.
