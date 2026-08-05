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
    ],
  },
};

module.exports = nextConfig;
