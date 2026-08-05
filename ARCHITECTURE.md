# Video Hub — Architecture


## 1. Overview

Video Hub is a Netflix-inspired video gallery that streams videos hosted on Google Drive.
Features a Gen Z color palette, animated gradient backgrounds, horizontal scroll rails,
glassmorphism, and SVG art hero.

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
  │  (HTTPS)
  ▼
Vercel (Next.js 15 serverless)
  ├── Static pages       /            HeroGraphic + Netflix scroll rails + search/filter
  ├── Static pages       /admin       admin CRUD (password-gated client-side)
  ├── Dynamic page       /video/[id]  cinematic player + ambient glow + related videos
  └── API Routes
        ├── GET/POST     /api/videos
        ├── GET/PUT/DELETE /api/videos/[id]
        ├── GET          /api/drive-status   checks Drive file is publicly embeddable
        └── POST         /api/auth    admin password check
              │
              │  @supabase/supabase-js (service role key, server-side only)
              ▼
        Supabase (PostgreSQL)  ──  `videos` table
              ▲
              │  iframe: https://drive.google.com/file/d/{fileId}/preview
              ▼
        Google Drive (actual video bytes)
```

### UI Component Hierarchy
```
layout.tsx
├── ThemeProvider.tsx (dark/light theme context)
├── Header.tsx (fixed, glass effect on scroll, theme toggle)
├── ErrorBoundary.tsx
│   └── page.tsx (home / admin / video/[id])
├── CookieConsent.tsx (fixed bottom)
├── ScrollToTop.tsx (floating, appears after 400px scroll)
└── MobileNav.tsx (fixed bottom, mobile only)

Home (page.tsx):
├── AuroraContainer (3x animated gradient blobs)
├── HeroGraphic.tsx (permanent SVG art: rings, dots, geometry)
├── Search + Filter Pills
└── Scroll Rails (one per category)
    └── VideoCard.tsx (rail tile, hover expand, :has() dimming)

Video Detail (video/[id]/page.tsx):
├── AuroraContainer + Ambient blur glow (from thumbnail)
├── VideoPlayer.tsx (Drive embed with loading states)
├── Description (glass card)
└── Related videos sidebar
```

Flow:
1. The gallery page (`/`) renders a permanent `<HeroGraphic>` with animated SVG art,
   then fetches videos from `GET /api/videos` with optional `?search=` and `?category=` params.
2. Videos are displayed in Netflix-style horizontal scroll rails (one per category),
   with `<VideoCard>` tiles that expand on hover via CSS `:has()` sibling dimming.
3. Clicking a card opens `/video/[id]`, which fetches the video and related
   videos, increments the view count via `POST /api/videos/[id]/view`,
   then renders `<VideoPlayer>` with an ambient blur glow from the thumbnail.
4. `<VideoPlayer>` checks `/api/drive-status` before embedding the Drive iframe.
   Restricted files show a clear error with the "Open in Google Drive" fallback.

## 3. Directory Structure

```
video-hub/
├── scripts/
│   └── seed-supabase.mjs      # deletes old placeholder rows, seeds real Drive videos
├── src/
│   ├── app/
│   │   ├── page.tsx           # gallery: hero + Netflix horizontal scroll rails
│   │   ├── layout.tsx         # root layout + nav + ErrorBoundary
│   │   ├── globals.css        # design system (CSS vars, animations, glassmorphism)
│   │   ├── admin/page.tsx     # admin panel (login, add/edit/delete)
│   │   ├── video/[id]/page.tsx# video page: ambient glow, player, related
│   │   └── api/
│   │       ├── auth/route.ts          # admin password check
│   │       ├── videos/route.ts        # GET (list/filter), POST (create)
│   │       ├── videos/[id]/route.ts   # GET, PUT, DELETE
│   │       └── drive-status/route.ts  # GET - Google Drive file status check
│   ├── components/
│   │   ├── HeroGraphic.tsx    # permanent SVG art hero (rings, dots, geometry)
│   │   ├── Header.tsx         # glass nav (transparent -> solid on scroll) + theme toggle
│   │   ├── VideoCard.tsx      # Netflix rail tile (hover expand, :has() dimming, view count)
│   │   ├── VideoPlayer.tsx    # Drive iframe player with loading states
│   │   ├── VideoEditor.tsx    # rich text editor for video descriptions
│   │   ├── ThumbnailPicker.tsx# Google Drive thumbnail size selector
│   │   ├── CookieConsent.tsx  # cookie consent banner
│   │   ├── ErrorBoundary.tsx  # React error boundary
│   │   ├── ThemeProvider.tsx  # dark/light theme context + localStorage persistence
│   │   ├── ScrollToTop.tsx    # floating scroll-to-top button
│   │   └── MobileNav.tsx      # fixed bottom nav bar for mobile
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client singleton (service role)
│   │   └── client-utils.ts    # Drive URL helpers (extract, validate, embed)
│   └── types/video.ts         # Video, VideoFormData types
├── .env.local                 # local env vars (see §7)
├── architecture.md            # this file
├── next.config.js
├── tailwind.config.js         # Gen Z palette, animations, keyframes
└── package.json
```

## 4. Data Model — Supabase `videos` table

```sql
CREATE TABLE videos (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT DEFAULT '',
  drive_url     TEXT NOT NULL,      -- full https://drive.google.com/file/d/.../view URL
  drive_file_id TEXT NOT NULL,      -- extracted file ID used for embeds
  thumbnail_url TEXT DEFAULT '',    -- user-selected thumbnail override
  category      TEXT DEFAULT '',
  view_count    INTEGER DEFAULT 0,  -- incremented on each video page visit
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

- RLS policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` all `USING (true)` /
  `WITH CHECK (true)` — open access (acceptable for MVP; writes are gated by the
  app-level admin password check in `/api/auth`).
- Supabase project ref: stored in `.env.local`.

## 5. API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/videos` | List all videos, `?search=` (title ILIKE) and `?category=` (exact match), ordered `created_at DESC` |
| POST | `/api/videos` | Create video. Validates title + drive_url, extracts file ID, inserts |
| GET | `/api/videos/[id]` | Fetch single video (404 if missing) |
| PUT | `/api/videos/[id]` | Update fields; re-extracts file ID only when `drive_url` changes |
| DELETE | `/api/videos/[id]` | Delete video |
| POST | `/api/videos/[id]/view` | Increment view count by 1, returns new count |
| GET | `/api/drive-status` | `?id=` — server-side HEAD-ish check of the Drive file; returns `ok` / `restricted` (401/403) / `missing` (404) / `unknown` |
| POST | `/api/auth` | Admin login check against `ADMIN_PASSWORD` |

Before mounting the Drive iframe, `<VideoPlayer>` calls `/api/drive-status`.
Restricted files (not shared "Anyone with the link") make Google's embed render a
cryptic "400. That's an error..." page; the check catches them first and shows a
clear message with the "Open in Google Drive" fallback instead.

All DB access uses the Supabase **service role key** (server-side only, never exposed
to the browser). `NEXT_PUBLIC_*` keys are safe for the client; `SUPABASE_SERVICE_ROLE_KEY`
must never be in client bundles.

## 6. Deployment

- Provider: Vercel (project `video-hub`)
- Build: `npm run build` → `npx vercel --prod --yes` (with env flags, see §7).
- ⚠️ Vercel does **not** persist env vars for this project — they must be re-passed
  via `--env` flags on every deploy (or added in the Vercel dashboard → Project → Settings → Environment Variables).
- Full deploy command:

```bash
cd /Users/mohitkashyap/video-hub
npx vercel --prod --yes \
  --env NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url> \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key> \
  --env SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key> \
  --env ADMIN_PASSWORD=<your-admin-password>
```

- Local dev: `npm run dev` (reads `.env.local`).
- Seed: `npm run seed` (runs `node scripts/seed-supabase.mjs`).

## 7. Environment Variables

> Store these in `.env.local` for local dev; pass to Vercel at deploy time.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ADMIN_PASSWORD` | Password for admin panel access |

### Vercel
| Variable | Description |
|---|---|
| Project | `video-hub` |
| Production URL | `https://video-hub-one-tawny.vercel.app` |
| Admin panel | `https://video-hub-one-tawny.vercel.app/admin` |

## 8. Component Interactions

| Component | Behavior |
|---|---|
| **Header** | Transparent on load; gains `backdrop-filter: blur(20px)` + solid bg after 40px scroll. Dark/light theme toggle button. |
| **ThemeProvider** | Persists theme to `localStorage`, respects `prefers-color-scheme`, applies `data-theme` attribute to `<html>` |
| **HeroGraphic** | Permanent SVG art with 3 rotating rings, orbiting dots, geometric shapes, pulsing glow |
| **VideoCard (rail)** | Hover: scales to 1.15x, z-index 10, play button fades in. Siblings dim to 0.4 opacity via `:has()`. Shows view count. |
| **VideoPlayer** | Click-to-play with gradient spinner, progress bar, Drive status pre-check before embed |
| **ThumbnailPicker** | Tests 4 sizes (Default/Large/HD/Square), shows only valid ones |
| **ScrollToTop** | Appears after 400px scroll, smooth scrolls to top, positioned above MobileNav |
| **MobileNav** | Fixed bottom bar on mobile (<768px) with Home, Browse, Admin icons |
| **CookieConsent** | localStorage + cookie, shown once until dismissed |

## 9. Known Gotchas

- **Drive sharing required**: every video's Drive file MUST be set to
  "Anyone with the link can view". Restricted files return HTTP 401 and show the
  "Fix common issues related to storage access" error in the embed.
- **No `sandbox` on the iframe**: sandboxing blocks Drive cookies/storage, which
  breaks playback. The player deliberately omits it.
- **Drive quota**: Google Drive has per-file daily view limits; on high traffic the
  embed may fail. The fallback "Open in Google Drive" link mitigates this.
- **Seeds**: `scripts/seed-supabase.mjs` deletes rows whose `drive_file_id` matches
  known fake placeholder IDs, then inserts public sample videos (skipping duplicates).
- **Vercel env vars**: must be re-passed via `--env` flags on every deploy (not persisted).
- **`@property` CSS**: conic gradient animation uses `@property --gradient-angle` which requires
  Chromium browsers. Falls back to static gradient in Firefox/Safari.
- **`:has()` selector**: sibling dimming uses CSS `:has()` which requires Chromium 105+ / Safari 15.4+.
  Fallback: tiles display normally without dimming in older browsers.
- **`next/image`**: thumbnails use `unoptimized` mode because Google Drive CDN doesn't support
  Next.js image optimization. The `fill` + `sizes` pattern is used for responsive loading.
- **Theme persistence**: stored in `localStorage` under `vh-theme` key. Falls back to
  `prefers-color-scheme` media query on first visit.
