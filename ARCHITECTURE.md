# V HUB — Architecture

## 1. Overview

V HUB is a Netflix-inspired video gallery that streams videos hosted on Google Drive.
Features a Gen Z color palette, animated gradient backgrounds, horizontal scroll rails,
glassmorphism, SVG art hero, admin panel with analytics, multi-category management,
pagination, footer navigation with content pages, like/dislike reactions with fingerprint
deduplication, deterministic fake engagement stats, and a title-case formatter for video entries.

| Aspect | Value |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) — free tier |
| Video storage | Google Drive (files shared "Anyone with the link can view") |
| Hosting | Vercel (serverless) |
| Production URL | https://video-hub-one-tawny.vercel.app |

### Design System

| Color | Hex | Usage |
|---|---|---|
| Neon Indigo | `#6C63FF` | Primary accent, buttons, glows |
| Cyber Lime | `#D0FF14` | Secondary accent, highlights |
| Cool Coral | `#FF6B6B` | Danger states, secondary glow |
| Digital Lavender | `#BFA2DB` | Tertiary, gradient transitions |
| Abyss | `#0D0F1A` | Background base |
| Abyss Card | `#1A1E35` | Card backgrounds |
| Abyss Surface | `#252A42` | Input fields, elevated surfaces |

### Key Visual Effects

1. **Animated Conic Gradient** — `@property --gradient-angle` with `conic-gradient` rotating via keyframes
2. **Aurora Mesh Blobs** — 3x `radial-gradient` with `filter: blur(80px)`, floating animation
3. **Netflix Horizontal Rails** — `scroll-snap-type: x mandatory`, hidden scrollbar, fade edges
4. **`:has()` Sibling Dimming** — Hovered tile scales 1.15x, siblings dim to 0.4 opacity
5. **Glassmorphism** — `backdrop-filter: blur(20px)`, translucent bg, hairline borders
6. **Ken Burns Hero** — SVG art with rotating rings, orbiting dots, pulsing glow
7. **Animated Gradient Text** — 5-color cycling with `background-size: 200% 200%`
8. **Dark/Light Theme** — `[data-theme]` CSS variables, persisted to `localStorage`, respects `prefers-color-scheme`
9. **Page Transitions** — CSS `@keyframes page-enter` fade-in-up on route change
10. **Next.js Image** — Optimized thumbnails via `next/image` with `fill` + `sizes` for responsive loading

## 2. High-Level Architecture

```
Browser
  |  (HTTPS)
  v
Vercel (Next.js 15 serverless)
  +-- Static pages       /              HeroGraphic + Netflix scroll rails + search/filter + pagination
  +-- Static pages       /admin         Admin CRUD (email + password gated)
  +-- Dynamic page       /video/[id]    Cinematic player + ambient glow + "Up Next" sidebar
  +-- Static pages       /terms, /privacy, /cookies, /dmca, /faq, /contact,
  |                      /content-removal, /press, /blog, /creators-blog, /advertising
  +-- API Routes
        +-- GET/POST     /api/videos             List/create with pagination support
        +-- GET/PUT/DELETE /api/videos/[id]      Single video CRUD (title auto-formatted to Title Case)
        +-- POST         /api/videos/[id]/view   Increment view count
        +-- GET          /api/drive-status       Check Drive file is publicly embeddable
        +-- POST         /api/auth               Admin email + password check
        +-- GET/POST     /api/categories         List/create categories
        +-- DELETE       /api/categories/[id]    Delete category
        +-- POST         /api/analytics          Track page_view and video_view events
        +-- POST         /api/analytics/search   Track search queries
        +-- GET          /api/admin/stats        Aggregated analytics for dashboard
              |
              |  @supabase/supabase-js (service role key, server-side only)
              v
        Supabase (PostgreSQL)  --  `videos`, `categories`, `analytics`, `searches` tables
              ^
              |  iframe: https://drive.google.com/file/d/{fileId}/preview
              v
        Google Drive (actual video bytes)
```

### UI Component Hierarchy

```
layout.tsx
+-- ThemeProvider.tsx (dark/light theme context)
+-- Header.tsx (fixed, glass effect on scroll, theme toggle, conditional logo link)
+-- ErrorBoundary.tsx
|   +-- page.tsx (home / admin / video/[id] / content pages)
+-- Footer.tsx (3-column navigation: vHub, Help, Legal)
+-- CookieConsent.tsx (fixed bottom)
+-- ScrollToTop.tsx (floating, appears after 400px scroll)
+-- MobileNav.tsx (fixed bottom, mobile only)

Home (page.tsx):
+-- AuroraContainer (3x animated gradient blobs)
+-- HeroGraphic.tsx (permanent SVG art: rings, dots, geometry)
+-- Search + Filter Pills
+-- "All Videos" scroll rail (25 most recent, fetched with ?limit=25)
+-- Category scroll rails (50 per page, with Previous/Next pagination, **video count shown in header**)
    +-- VideoCard.tsx (rail tile, hover expand, :has() dimming)

Video Detail (video/[id]/page.tsx):
+-- AuroraContainer + Ambient blur glow (from thumbnail)
+-- VideoPlayer.tsx (Drive embed with loading states, pop-out blocker overlay)
+-- Description + metadata (category tag, view count, date)
+-- "Up Next" sidebar (6 same-category videos, no repeats across navigations via sessionStorage)

Content Pages (/terms, /privacy, /cookies, /dmca, /faq, /contact, /content-removal,
                /press, /blog, /creators-blog, /advertising):
+-- ContentPage.tsx (shared layout: aurora background + glass card + back link)

Admin (/admin):
+-- Dashboard tab (analytics: total users, active users, page views, countries,
|                   top videos, most-searched topics, recent searches)
+-- Add Video tab (form with category dropdown, thumbnail picker, title auto-formats to Title Case)
+-- Editor tab (edit existing videos)
+-- Categories tab (add/delete categories)
```

### Flow

1. The gallery page (`/`) renders a permanent `<HeroGraphic>` with animated SVG art,
   then fetches 25 most recent videos from `GET /api/videos?limit=25&page=1` for the
   "All Videos" row, and fetches each category's videos with `?category=X&limit=50&page=N`.
2. Videos are displayed in Netflix-style horizontal scroll rails. Category rows include
   Previous/Next pagination buttons when more than one page exists.
3. Search and filter modes fetch without pagination limits (show all matching results).
4. Clicking a card opens `/video/[id]`, which fetches the video and 6 related videos
   (same category preferred, no repeats via sessionStorage tracking), increments the
   view count via `POST /api/videos/[id]/view`, and renders `<VideoPlayer>`.
5. `<VideoPlayer>` checks `/api/drive-status` before embedding the Drive iframe.
   A transparent overlay blocks Google Drive's pop-out button.
6. All video titles are auto-formatted to Title Case on create/update via `toTitleCase()`.
7. Admin panel uses email + password authentication (env vars, no hardcoded fallback).
8. Analytics tracking fires fire-and-forget POST requests for page views, video views,
   and search queries.
9. Footer appears on all pages with links to 11 content pages (terms, privacy, cookies,
   dmca, faq, contact, content-removal, press, blog, creators-blog, advertising).

## 3. Directory Structure

```
video-hub/
+-- scripts/
|   +-- seed-supabase.mjs              # seeds sample videos
+-- supabase/
|   +-- migrations/
|       +-- 001_create_categories.sql   # categories table
|       +-- 002_create_analytics.sql    # analytics + searches tables
|       +-- 20250101000000_add_thumbnail_url.sql
+-- src/
|   +-- app/
|   |   +-- page.tsx                   # gallery: hero + paginated scroll rails
|   |   +-- layout.tsx                 # root layout + Header + Footer + ErrorBoundary
|   |   +-- globals.css                # design system (CSS vars, animations, glassmorphism)
|   |   +-- admin/page.tsx             # admin panel (login, dashboard, add/edit, categories)
|   |   +-- video/[id]/page.tsx        # video page: ambient glow, player, "Up Next" sidebar
|   |   +-- terms/page.tsx             # Terms of Use (11 sections)
|   |   +-- privacy/page.tsx           # Privacy Policy (11 sections)
|   |   +-- cookies/page.tsx           # Cookies Policy (6 sections)
|   |   +-- dmca/page.tsx              # DMCA/Copyright Policy (7 sections)
|   |   +-- faq/page.tsx               # FAQ with 8 collapsible accordion items
|   |   +-- contact/page.tsx           # Contact form + email addresses
|   |   +-- content-removal/page.tsx   # Content removal request process
|   |   +-- press/page.tsx             # Press info + brand guidelines
|   |   +-- blog/page.tsx              # Blog with sample posts
|   |   +-- creators-blog/page.tsx     # Creator guidelines + tips
|   |   +-- advertising/page.tsx       # Advertising options + policy
|   |   +-- api/
|   |       +-- auth/route.ts              # admin email + password check
|   |       +-- videos/route.ts            # GET (list/filter/paginate), POST (create, title-case)
|   |       +-- videos/[id]/route.ts       # GET, PUT (title-case), DELETE
|   |       +-- videos/[id]/view/route.ts  # POST - increment view count
|   |       +-- drive-status/route.ts      # GET - Google Drive file status check
|   |       +-- categories/route.ts        # GET (list all), POST (create new)
|   |       +-- categories/[id]/route.ts   # DELETE category by ID
|   |       +-- analytics/route.ts         # POST - track page_view / video_view events
|   |       +-- analytics/search/route.ts  # POST - track search queries
|   |       +-- admin/stats/route.ts       # GET - aggregated analytics for dashboard
|   +-- components/
|   |   +-- HeroGraphic.tsx         # permanent SVG art hero (rings, dots, geometry)
|   |   +-- Header.tsx              # glass nav (transparent -> solid on scroll) + theme toggle
|   |   +-- Footer.tsx              # 3-column footer nav (vHub, Help, Legal) + copyright
|   |   +-- VideoCard.tsx           # Netflix rail tile (hover expand, :has() dimming, view count)
|   |   +-- VideoPlayer.tsx         # Drive iframe player with loading states + pop-out blocker
|   |   +-- VideoEditor.tsx         # rich text editor for video descriptions
|   |   +-- ThumbnailPicker.tsx     # Google Drive thumbnail size selector
|   |   +-- ContentPage.tsx         # shared layout for content pages (aurora + glass card)
|   |   +-- CookieConsent.tsx       # cookie consent banner
|   |   +-- ErrorBoundary.tsx       # React error boundary
|   |   +-- ThemeProvider.tsx       # dark/light theme context + localStorage persistence
|   |   +-- ScrollToTop.tsx         # floating scroll-to-top button
|   |   +-- MobileNav.tsx           # fixed bottom nav bar for mobile
|   +-- lib/
|   |   +-- supabase.ts             # Supabase client singleton (service role)
|   |   +-- utils.ts                # Drive URL helpers + toTitleCase formatter
|   |   +-- client-utils.ts         # Drive URL helpers (client-side)
|   +-- types/
|       +-- video.ts                # Video, VideoFormData types
+-- .env.local                      # local env vars (see section 8)
+-- ARCHITECTURE.md                 # this file
+-- next.config.js
+-- tailwind.config.js              # Gen Z palette, animations, keyframes
+-- package.json
```

## 4. Data Model

### `videos` table

```sql
CREATE TABLE videos (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,           -- auto-formatted to Title Case on create/update
  description   TEXT DEFAULT '',
  drive_url     TEXT NOT NULL,           -- full Google Drive view URL
  drive_file_id TEXT NOT NULL,           -- extracted file ID used for embeds
  thumbnail_url TEXT DEFAULT '',         -- user-selected thumbnail override
  category      TEXT DEFAULT '',         -- legacy single-category field (still populated)
  view_count    INTEGER DEFAULT 0,       -- incremented on each video page visit
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### `categories` table

```sql
CREATE TABLE categories (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `video_categories` junction table (many-to-many)

```sql
CREATE TABLE video_categories (
  video_id    BIGINT REFERENCES videos(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);
```

Videos can belong to multiple categories. The API returns `category_ids: number[]` on each
video. Category filtering uses a subquery on this junction table. The legacy `category` column
on `videos` is retained for backward compatibility but the junction table is the source of truth.

### `video_reactions` table

```sql
CREATE TABLE video_reactions (
  id                BIGSERIAL PRIMARY KEY,
  video_id          BIGINT REFERENCES videos(id) ON DELETE CASCADE,
  user_fingerprint  TEXT NOT NULL,
  reaction          TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_fingerprint)
);
```

One reaction per user per video (deduped by browser fingerprint stored in `localStorage`).
Toggling the same reaction removes it; switching reaction type updates the row.

### `analytics` table

```sql
CREATE TABLE analytics (
  id          BIGSERIAL PRIMARY KEY,
  event_type  TEXT NOT NULL,             -- 'page_view', 'video_view'
  ip_address  TEXT,
  country     TEXT,
  metadata    JSONB DEFAULT '{}',        -- { video_id, title } for video_view
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `searches` table

```sql
CREATE TABLE searches (
  id            BIGSERIAL PRIMARY KEY,
  query         TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

SQL migration files are at `supabase/migrations/001_create_categories.sql`,
`002_create_analytics.sql`, `003_create_video_categories.sql`,
`004_create_video_reactions.sql`, and `20250101000000_add_thumbnail_url.sql`.
These must be run manually in the Supabase SQL Editor dashboard.

- RLS policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` all `USING (true)` /
  `WITH CHECK (true)` — open access (acceptable for MVP; writes are gated by the
  app-level admin auth check in `/api/auth`).
- Supabase project ref: stored in `.env.local`.

## 5. API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/videos` | List videos. `?search=` (title ILIKE), `?category=` (exact match), `?limit=N`, `?page=N`. Without pagination params returns full array (backward-compatible). With params returns `{ data, total, page, pageSize, totalPages }` |
| POST | `/api/videos` | Create video. Validates title + drive_url, extracts file ID, auto-formats title to Title Case, **rejects duplicate titles** (409), inserts |
| GET | `/api/videos/[id]` | Fetch single video (404 if missing) |
| PUT | `/api/videos/[id]` | Update fields; auto-formats title to Title Case; **rejects duplicate titles** (409); re-extracts file ID only when `drive_url` changes |
| DELETE | `/api/videos/[id]` | Delete video |
| POST | `/api/videos/[id]/view` | Increment view count by 1, returns new count |
| GET | `/api/drive-status` | `?id=` — server-side check of the Drive file; returns `ok` / `restricted` / `missing` / `unknown` |
| POST | `/api/auth` | Admin login check. Validates email + password against `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars. No hardcoded fallback |
| GET | `/api/categories` | List all categories, ordered by name. Returns `[]` if table doesn't exist |
| POST | `/api/categories` | Create category. Validates name, handles unique constraint (409), missing table (500). Broadened error handling for `42P01`, `42703`, `42501` codes |
| DELETE | `/api/categories/[id]` | Delete category by ID |
| GET | `/api/videos/[id]/reactions` | Get like/dislike counts + user's reaction. Query param `?fingerprint=` for per-user reaction lookup |
| POST | `/api/videos/[id]/reactions` | Toggle like/dislike. Body: `{ fingerprint, reaction }`. Toggles off if same reaction, switches if different. Returns updated counts |
| POST | `/api/analytics` | Track event. Accepts `{ event_type, metadata }`. Extracts client IP from headers. Fire-and-forget from client |
| POST | `/api/analytics/search` | Track search query. Accepts `{ query, results_count }` |
| GET | `/api/admin/stats` | Aggregated analytics: total users, active users (7d), countries, top 5 videos, most-searched topics, most-searched videos, recent searches, total page views |

### Title Case Formatting

All video titles are auto-formatted to Title Case on create and update via `toTitleCase()`
in `src/lib/utils.ts`. Small words (a, an, the, and, of, in, etc.) remain lowercase unless
they are the first word. Example: "the lord of the rings" becomes "The Lord of the Rings".

### Duplicate Title Prevention

Both create (POST) and update (PUT) endpoints check for existing videos with the same title
before saving. The check is **case-insensitive** (`ilike`). If a duplicate is found, the
API returns HTTP 409 with a descriptive error message (e.g., `A video with the title "..." already exists`).
The admin dashboard displays this as a red error notification via `formError`.

### Pop-Out Button Blocker

A transparent overlay (`.drive-popout-blocker` CSS class + React event handlers) is placed
over the top-right 56x56px corner of every video player iframe. It intercepts and blocks
all pointer events (click, mousedown, mouseup, pointerdown) to prevent users from clicking
Google Drive's built-in pop-out button. The overlay uses `!important` CSS and cannot be
overridden. This is necessary because the pop-out button lives inside a cross-origin iframe
and cannot be removed via URL parameters.

### Pagination

The videos API supports optional pagination via `?limit=N&page=N` query params.
When provided, it returns `{ data, total, page, pageSize, totalPages }` using
Supabase's `range()` for efficient offset-based pagination.

Homepage behavior:
- "All Videos" row: fetches 25 most recent (`?limit=25&page=1`)
- Category rows: fetches 50 per page (`?category=X&limit=50&page=N`) with Previous/Next buttons
- Search/filter mode: no pagination limits (shows all results)

## 6. Deployment

- Provider: Vercel (project `video-hub`)
- Build: `npm run build` then `npx vercel --prod --yes`.
- Env vars are persisted on Vercel (added via `npx vercel env add`), so future deploys
  don't need `--env` flags. If vars are missing, re-add them with `npx vercel env add`.
- Deploy command:

```bash
cd /Users/mohitkashyap/video-hub
npm run build
npx vercel --prod --yes
```

- Local dev: `npm run dev` (reads `.env.local`).
- Seed: `npm run seed` (runs `node scripts/seed-supabase.mjs`).
- GitHub repo: https://github.com/seenewood-cpu/xhub

## 7. Analytics Dashboard

The admin panel includes a Dashboard tab that displays aggregated analytics:

| Metric | Source |
|---|---|
| Total users | Distinct IPs from `analytics` table |
| Active users (7d) | Distinct IPs from last 7 days |
| Total page views | Row count of `analytics` table |
| Countries | Grouped by `country` column in `analytics` |
| Top 5 most-viewed videos | `videos` table ordered by `view_count` DESC |
| Most-searched topics | Top 10 repeated queries from `searches` table |
| Most-searched videos | Top 5 queries with `results_count > 0` |
| Recent searches | Last 20 entries from `searches` table |

Tracking is fire-and-forget from the client side:
- Homepage mount: `POST /api/analytics` with `event_type: 'page_view'`
- Video page mount: `POST /api/analytics` with `event_type: 'video_view'`
- Search execution: `POST /api/analytics/search` with query + result count

## 8. Environment Variables

> Store these in `.env.local` for local dev. Vercel env vars are persisted (added via
> `npx vercel env add`). Never commit secrets to git.

| Variable | Description | Exposed to client |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | No (server-side only) |
| `ADMIN_EMAIL` | Email for admin panel login | No (server-side only) |
| `ADMIN_PASSWORD` | Password for admin panel login | No (server-side only) |

### Vercel

| Property | Value |
|---|---|
| Project | `video-hub` |
| Production URL | `https://video-hub-one-tawny.vercel.app` |
| Admin panel | `https://video-hub-one-tawny.vercel.app/admin` |
| GitHub repo | `https://github.com/seenewood-cpu/xhub` |

## 9. Component Interactions

| Component | Behavior |
|---|---|
| **Header** | Transparent on load; gains `backdrop-filter: blur(20px)` + solid bg after 40px scroll. Dark/light theme toggle. Logo links to `/admin` when on admin pages, `/` otherwise |
| **Footer** | 3-column nav (vHub, Help, Legal) with 11 links to content pages. Appears on all pages including admin |
| **ThemeProvider** | Persists theme to `localStorage` (`vh-theme` key), respects `prefers-color-scheme`, applies `data-theme` attribute to `<html>` |
| **HeroGraphic** | Permanent SVG art with 3 rotating rings, orbiting dots, geometric shapes, pulsing glow |
| **VideoCard (rail)** | Hover: scales to 1.15x, z-index 10, play button fades in. Siblings dim to 0.4 opacity via `:has()`. Shows fake deterministic view count and category badge |
| **VideoPlayer** | Click-to-play with gradient spinner, progress bar, Drive status pre-check. Pop-out button blocked via transparent overlay with `!important` CSS |
| **ThumbnailPicker** | Tests 4 sizes (Default/Large/HD/Square), shows only valid ones |
| **ContentPage** | Shared layout for all content pages: aurora background, glass card, back link, title + last-updated date |
| **ScrollToTop** | Appears after 400px scroll, smooth scrolls to top, positioned above MobileNav |
| **MobileNav** | Fixed bottom bar on mobile (<768px) with Home, Browse, Admin icons |
| **CookieConsent** | localStorage + cookie, shown once until dismissed |

## 10. Content Pages

11 static content pages share the `ContentPage` component for consistent layout:

| Page | Route | Sections |
|---|---|---|
| Terms of Use | `/terms` | 11 sections covering eligibility, accounts, content, conduct, IP, termination, disclaimers, liability, changes, governing law, contact |
| Privacy Policy | `/privacy` | 11 sections covering data collection, usage, cookies, third parties, retention, security, children, rights, changes, contact |
| Cookies Policy | `/cookies` | 6 sections covering what cookies are, types used, third-party cookies, managing cookies, changes, contact |
| DMCA/Copyright | `/dmca` | 7 sections covering policy, reporting infringement, counter-notices, repeat infringers, fair use, contact, acknowledgments |
| FAQ | `/faq` | 8 collapsible accordion items covering account, browsing, video issues, uploads, mobile, privacy, content removal, contact |
| Contact | `/contact` | Contact form + email addresses for general, support, business, legal inquiries |
| Content Removal | `/content-removal` | Request process, what's needed, what happens after removal, direct Google Drive removal steps |
| Press | `/press` | Press kit info, brand guidelines, key facts, media assets, brand usage rules |
| Blog | `/blog` | Blog section with sample posts about platform features |
| Creator's Blog | `/creators-blog` | Creator guidelines, tips for uploading, best practices for thumbnails, titles, descriptions |
| Advertising | `/advertising` | Advertising options, policy, ad formats, targeting, budget info, contact |

## 11. Admin Panel

The admin panel (`/admin`) has four tabs:

| Tab | Description |
|---|---|
| **Dashboard** | Analytics overview: users, page views, countries, top videos, search trends, recent searches |
| **Add Video** | Form with title (auto-formatted to Title Case), description, Google Drive URL, multi-category checkboxes with video counts (from `categories` table), thumbnail picker |
| **Editor** | Lists all videos with edit/delete actions. Edit pre-fills the form with existing data including selected categories |
| **Categories** | Add new categories, delete existing ones. Categories populate the video form checkboxes and homepage filter pills. Shows category count based on `video_categories` junction |

Authentication: email + password via `POST /api/auth`. Credentials checked against
`ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. Client-side state only
(no server session/cookie).

## 12. "Up Next" Sidebar Behavior

The video detail page sidebar shows 6 related videos with the following logic:

1. **Shared categories first** — Prioritizes videos that share at least one category with the current video (via `video_categories` junction)
2. **No repeats** — Uses `sessionStorage` (`vh-up-next-seen`) to track every video ID
   that has appeared in "Up Next" during the browser session. Previously shown IDs are
   excluded from future lists
3. **Fallback to all videos** — If same-category videos run out, fills remaining
   slots from ALL videos (also excluding seen IDs), not just other categories
4. **Auto-reset** — When all videos are exhausted, clears the seen list and starts fresh
5. **Persists across navigations** — `sessionStorage` survives page-to-page navigation
   within the same tab; clears on tab close

## 13. Fake Engagement Stats

View counts, likes, and dislikes displayed on video pages, the Up Next sidebar, and the
homepage VideoCard are **deterministic fake numbers** — not real. They are generated by
`fakeEngagement(videoId)` in `src/lib/utils.ts` using bitwise operations on the video ID
to produce unique-per-video but non-real values:

- Views: 5,000 – 85,000
- Likes: 800 – 12,000
- Dislikes: 12% – 25% of likes

The user's own like/dislike adjusts the displayed count by +1 from the base. Real
`view_count` from the database is not displayed to end users. Real upload dates are
also hidden from the video detail page.

## 14. Like/Dislike Reactions

The video detail page has like/dislike buttons with a small percentage meter.
Reactions are stored in the `video_reactions` table, deduped by browser fingerprint
(stored in `localStorage` as `vh-fingerprint`). Behavior:

- Click like when no reaction: inserts a like
- Click like when already liked: removes the like (toggle off)
- Click dislike when liked: switches to dislike
- Click like when disliked: switches to like
- Counts returned by `GET /api/videos/[id]/reactions?fingerprint=...`
- User's current reaction returned so buttons can show active state

## 15. Known Gotchas

- **Drive sharing required**: every video's Drive file MUST be set to
  "Anyone with the link can view". Restricted files return HTTP 401 and show the
  "Fix common issues related to storage access" error in the embed.
- **No `sandbox` on the iframe**: sandboxing blocks Drive cookies/storage, which
  breaks playback. The player deliberately omits it.
- **Drive quota**: Google Drive has per-file daily view limits; on high traffic the
  embed may fail. The fallback "Open in Google Drive" link mitigates this.
- **Seeds**: `scripts/seed-supabase.mjs` deletes rows whose `drive_file_id` matches
  known fake placeholder IDs, then inserts public sample videos (skipping duplicates).
- **Vercel env vars**: persisted via `npx vercel env add`. If missing after deploy, re-add them in Vercel dashboard or CLI.
- **`@property` CSS**: conic gradient animation uses `@property --gradient-angle` which requires
  Chromium browsers. Falls back to static gradient in Firefox/Safari.
- **`:has()` selector**: sibling dimming uses CSS `:has()` which requires Chromium 105+ / Safari 15.4+.
  Fallback: tiles display normally without dimming in older browsers.
- **`next/image`**: thumbnails use `unoptimized` mode because Google Drive CDN doesn't support
  Next.js image optimization. The `fill` + `sizes` pattern is used for responsive loading.
- **Theme persistence**: stored in `localStorage` under `vh-theme` key. Falls back to
  `prefers-color-scheme` media query on first visit.
- **Pop-out blocker**: uses a transparent overlay with `!important` CSS and JavaScript event
  interception. It cannot remove the Google Drive pop-out button from the DOM (cross-origin
  iframe limitation) but prevents all pointer events from reaching it.
- **Title Case**: applied server-side on create/update only. Existing titles in the database
  are not retroactively formatted. Re-save videos to normalize old titles.
- **Categories table**: must be created manually via SQL in Supabase dashboard before the
  category dropdown works. Migration SQL is at `supabase/migrations/001_create_categories.sql`.
- **Analytics tables**: must be created manually via SQL in Supabase dashboard. Migration SQL
  is at `supabase/migrations/002_create_analytics.sql`.
- **Pagination**: search/filter mode returns all results without pagination. Only the
  homepage default view (no search, no filter) uses paginated fetching.
