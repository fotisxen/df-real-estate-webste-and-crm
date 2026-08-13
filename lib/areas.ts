// A property's "area" for grouping/display purposes: its region if set,
// falling back to municipality, then neighborhood. Properties entered
// without a region (e.g. only municipality/neighborhood filled in) would
// otherwise be invisible in every area-based view — this keeps them
// represented under whatever location info actually exists.
export function effectiveArea(p: {
  region?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
}): string | null {
  return p.region?.trim() || p.municipality?.trim() || p.neighborhood?.trim() || null;
}
