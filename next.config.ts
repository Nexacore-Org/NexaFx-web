import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

// Enable bundle analysis with `npm run analyze` (sets ANALYZE=true). The
// analyzer wrapper is applied conditionally so a plain `next build` is never
// affected, including when @next/bundle-analyzer is not yet installed (it is
// added by the bundle-size-budget CI work).
let config: NextConfig = nextConfig;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require("@next/bundle-analyzer");
  if (process.env.ANALYZE === "true") {
    config = withBundleAnalyzer({ enabled: true })(nextConfig);
  }
} catch {
  // @next/bundle-analyzer not installed — keep the plain config.
}

export default config;