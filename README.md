# Video Hub

A responsive website that displays a gallery of videos hosted on Google Drive. The site owner adds videos by pasting a Google Drive share link; visitors browse a gallery and watch videos embedded directly on the site.

## Features

- **Public Gallery**: Browse videos in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- **Search & Filter**: Search by title and filter by category
- **Video Player**: Embedded Google Drive player with 16:9 aspect ratio
- **Admin Dashboard**: Add, edit, and delete videos with password protection
- **Error Handling**: Graceful fallback when Google Drive quota is exceeded
- **Accessibility**: Skip links, ARIA labels, keyboard navigation, screen reader support

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19
- **Backend**: Next.js API Routes
- **Database**: SQLite (via better-sqlite3)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd video-hub
npm install
```

### Seed the Database

```bash
npm run seed
```

This adds 3 sample videos to demonstrate the gallery.

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Add a New Video

1. Navigate to the [Admin page](http://localhost:3000/admin)
2. Enter the admin password (default: `admin123`)
3. Fill in the form:
   - **Title** (required): The video title
   - **Google Drive URL** (required): Paste the full share link
   - **Description** (optional): Brief description of the video
   - **Category** (optional): For filtering (e.g., "Tutorial", "Music")
4. Click "Add Video"

### Important: Google Drive Sharing Settings

For the embedded player to work, the video file in Google Drive must be set to **"Anyone with the link can view"**:

1. Right-click the file in Google Drive
2. Select "Share" or "Get link"
3. Change access to "Anyone with the link"
4. Copy the link and paste it in the admin form

## How to Change the Admin Password

The admin password is configured via environment variable. Create a `.env.local` file in the project root:

```
ADMIN_PASSWORD=your-new-secure-password
```

Restart the dev server after changing the password.

## Project Structure

```
video-hub/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Public gallery page
│   │   ├── layout.tsx            # Root layout with header
│   │   ├── globals.css           # Global styles
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin dashboard
│   │   ├── video/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Individual video page
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts      # Authentication endpoint
│   │       └── videos/
│   │           ├── route.ts      # GET/POST videos
│   │           └── [id]/
│   │               └── route.ts  # GET/PUT/DELETE video
│   ├── components/
│   │   ├── Header.tsx            # Navigation header
│   │   ├── VideoCard.tsx         # Video card for gallery
│   │   └── VideoPlayer.tsx       # Embedded player component
│   ├── lib/
│   │   ├── db.ts                 # SQLite database setup
│   │   ├── utils.ts              # Server-side utilities
│   │   └── client-utils.ts       # Client-side utilities
│   └── types/
│       └── video.ts              # TypeScript types
├── scripts/
│   └── seed.cjs                  # Database seed script
├── data/                         # SQLite database (auto-created)
└── README.md
```

## Known Limitations

- **No auto-thumbnails**: Google Drive thumbnails require OAuth API access. The MVP uses a placeholder play icon.
- **View quota**: Google Drive enforces daily bandwidth limits. High-traffic embeds may show quota errors. The app handles this gracefully with a fallback link.
- **Single admin**: No multi-user support in v1.

## Production Deployment

```bash
npm run build
npm start
```

Set `ADMIN_PASSWORD` in your production environment for security.

## License

MIT
