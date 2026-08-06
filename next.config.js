/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Supabase Storage public bucket URLs look like:
        // https://<project-ref>.supabase.co/storage/v1/object/public/...
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        // Contentful asset CDN, used by the blog cover images.
        hostname: "images.ctfassets.net",
      },
    ],
  },
};

module.exports = nextConfig;
