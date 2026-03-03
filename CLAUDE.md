# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CarDeals is a crowdsourced car pricing platform built with Next.js 15, allowing users to share and discover real car deal prices. Think levels.fyi but for automotive purchases. Live at https://car-price-reports.vercel.app

## Commands

- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run db:backup` - Run Go backup script from /scripts

No test framework is configured.

## Tech Stack

- **Next.js 15** (App Router) with **React 19** and **TypeScript 5**
- **Tailwind CSS v4** (PostCSS plugin, not the older config-based approach)
- **Shadcn/ui** components in `src/components/ui/`
- **Neon PostgreSQL** via `@neondatabase/serverless` (raw SQL, no ORM in practice)
- **NextAuth.js 4** with Google/GitHub OAuth
- **React Hook Form + Zod** for form validation
- **Recharts** for data visualization

## Architecture

### Database Access
The app uses raw SQL queries via `@neondatabase/serverless` HTTP client — there is no ORM layer. The database client singleton is in `src/lib/db.ts`. Schema migrations are done at runtime via helper functions (e.g., `ensureCarDealsColorColumns` in `src/lib/db-migrate.ts`).

**Prices are stored in cents** (integers) — multiply user input by 100 before storing, divide by 100 for display.

### Authentication
Configured in `src/lib/auth.ts`. Uses JWT strategy with custom callbacks that auto-create users on first OAuth login and persist user ID to the session. Admin access is hardcoded by email.

### Guest/Anonymous Support
Users can submit deals without authentication. Guest tracking uses a `cd_anon_id` cookie (1-year expiry) and IP hash (SHA-256).

### Routing & Pages
- `/` — Server-rendered home page with live stats (force-dynamic)
- `/deals` — Client-side deal browsing with filters and pagination
- `/deals/new` — Deal submission form (client component)
- `/deals/[id]` — Individual deal detail
- `/my-deals` — User's submissions dashboard
- `/statistics` — Platform analytics
- `/admin/backup` — Admin-only backup interface

### API Routes (`src/app/api/`)
All API routes use raw SQL with positional parameters (`$1`, `$2`, etc.) to prevent injection. Dynamic SQL composition is used for filtering/sorting in the deals endpoint.

Key endpoints:
- `GET/POST /api/deals` — CRUD with filters, pagination, sorting
- `GET /api/makes`, `GET /api/models` — Vehicle make/model lookups
- `POST /api/makes/create`, `POST /api/models/create` — User-added makes/models
- `GET /api/my-deals` — Authenticated user's deals
- `GET /api/statistics` — Aggregated platform stats

### Components
- `src/components/ui/` — Shadcn/ui primitives (do not edit manually; use shadcn CLI to add new ones)
- `src/components/` — App-specific components (navigation, deal-card, deal-filters, share-deal form)
- `src/components/providers.tsx` — SessionProvider wrapper for NextAuth

### Types
Defined in `src/types/index.ts`: `CarMake`, `CarModel`, `CarDeal` interfaces. NextAuth session types extended in `src/types/next-auth.d.ts`.

## Environment Variables

```
DATABASE_URL          # Neon PostgreSQL connection string
NEXTAUTH_URL          # App URL for OAuth callbacks
NEXTAUTH_SECRET       # JWT signing secret
GOOGLE_CLIENT_ID      # Google OAuth
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID      # GitHub OAuth (optional)
GITHUB_CLIENT_SECRET
```
