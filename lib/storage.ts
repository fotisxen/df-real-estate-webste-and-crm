// Property photos are uploaded to the public "property-images" bucket
// (see supabase/schema.sql). We store only the storage_path in the DB
// and build the public URL on read, so changing buckets/CDNs later
// doesn't require a data migration.
export function propertyImageUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/property-images/${storagePath}`;
}
