// Single source of truth for the site's public origin. Set
// NEXT_PUBLIC_SITE_URL in the hosting environment for production —
// everything that needs an absolute URL (metadata, sitemap, robots.txt,
// the Spitogatos feed, JSON-LD) reads from here instead of a hardcoded
// domain, so the same build works in dev, staging, and production.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
