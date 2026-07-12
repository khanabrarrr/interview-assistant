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
    // pdfjs-dist loads its worker file dynamically at runtime, which
    // Vercel's automatic file tracing doesn't detect on its own — this
    // forces that file to be included in the deployed function bundle.
    outputFileTracingIncludes: {
      "/api/resume/extract/**": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    },
  },
};

module.exports = nextConfig;
