# DF Real Estate — starter

Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion, with
Supabase as the backend (Postgres + Auth + Storage). Public listings site
plus a protected `/admin` panel, a private clients table locked down by
Row Level Security, and a Spitogatos XML feed route.

This is a working starting point, not a finished product — it's built to
run and to extend, with the data model, auth, and SEO plumbing already in
place so you're adding UI and features rather than wiring infrastructure.

## 1. Prerequisites

- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) account (the free tier is fine
  to start)

## 2. Install dependencies

```bash
npm install
```

## 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. In the SQL Editor, paste the entire contents of `supabase/schema.sql`
   and run it. This creates the `agents`, `properties`, `property_images`,
   and `clients` tables plus their Row Level Security policies.
3. Go to **Storage** → **New bucket** → name it exactly `property-images`
   → toggle **Public bucket** on → Create.
4. Back in the SQL Editor, uncomment and run the storage policy block at
   the bottom of `supabase/schema.sql` (the `storage.objects` policies) —
   they're commented out because the bucket has to exist first.
5. Go to **Authentication** → **Users** → **Add user** and create one
   login per agency staff member (email + password). This is how the 1-2
   agents will log into `/admin` — there's no public sign-up form, which
   is intentional.
6. Go to **Settings** → **API Keys**. On the **API Keys** tab (not
   "Legacy API Keys" — new projects don't have those), copy the
   **Publishable key** (`sb_publishable_...`) and reveal/create a
   **Secret key** (`sb_secret_...`). These are Supabase's current
   key system and are drop-in replacements for the old anon/service_role
   keys — same env vars, no code changes.

## 4. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in the three values — `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (paste in the **Publishable key** from
step 3.6 above) and `SUPABASE_SERVICE_ROLE_KEY` (paste in the **Secret
key** from the same step — keep this one out of any client-side code,
it's only ever read server-side).

## 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site, and
`http://localhost:3000/admin/login` to sign in with the user you created
in step 3.5 and start adding properties.

## What's in here

```
app/
  page.tsx                    homepage (hero + featured listings)
  properties/page.tsx         all listings, filterable by sale/rent
  properties/[slug]/page.tsx  single listing, SEO metadata + schema.org JSON-LD
  admin/                      protected panel (see middleware.ts)
  feeds/spitogatos.xml/       XML feed for the Spitogatos integration
  sitemap.ts, robots.ts       generated automatically from live listings
components/                   Nav, Hero, PropertyCard, admin nav, etc.
lib/supabase/                 browser + server Supabase clients
supabase/schema.sql           full DB schema + RLS policies
types/database.ts             hand-written types matching the schema
```

## Design system

Tokens live in `tailwind.config.ts`. Palette and type choices are
explained inline there — short version: `ink` (near-black text),
`limestone` (background), `aegean` (deep teal accent), `clay` (warm
burnt-sienna accent for CTAs), `olive` (used sparingly for tags/labels).
Display font is Fraunces, body is Inter, and JetBrains Mono is used for
prices, specs, and labels to give listing data an architectural,
spec-sheet feel. Change all of this freely — it's a starting point, not
house style carved in stone.

The homepage hero's scrolling photo filmstrip pulls from whatever's in
`property_images` — it's empty until you add your first listing with
photos, and shows a placeholder state until then rather than breaking.

## On the Spitogatos integration

There's no public per-listing "push" API — see `app/feeds/spitogatos.xml/route.ts`
for the full explanation and the feed itself. Once you have a Spitogatos
agency account, you register your feed URL with them
(`https://your-domain.gr/feeds/spitogatos.xml`) and they poll it. Worth
confirming the exact field/category mapping they want for your account
tier directly with their team — the XML structure here covers what's in
this schema, but portals sometimes want specific attribute codes that
only surface once you're registered.

## Before you deploy

- Replace every `example-agency.gr` placeholder (layout metadata,
  sitemap.ts, robots.ts, the JSON-LD block, the feed route) with the real
  domain.
- Replace "Agency Name" in `Nav.tsx` and `Footer.tsx`, and the contact
  details in `Footer.tsx`.
- Decide on hosting: Vercel is the zero-config option for Next.js
  (handles ISR and the feed route out of the box). If you go with
  Hostinger's Next.js-from-GitHub feature instead, confirm it supports
  ISR and serverless route handlers before relying on it — some hosts
  only do static export, which would break the admin panel, the feed
  route, and ISR-based freshness.
- Add Google Tag Manager / a consent banner before wiring up any
  ads pixel — you're handling client PII in the `clients` table, so get
  consent + tracking right from the start rather than bolting it on later.
- Consider generating `types/database.ts` from the live schema instead
  of hand-maintaining it, once the schema settles:
  `npx supabase gen types typescript --project-id <ref> > types/database.ts`
