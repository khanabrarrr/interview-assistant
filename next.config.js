/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  // pdfjs-dist and mammoth use Node-specific file/module APIs that shouldn't
  // be bundled by webpack for serverless functions — keep them external.
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist", "mammoth"],
  },
};

module.exports = nextConfig;
