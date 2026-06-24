import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  async redirects() {
    return [{ source: "/login", destination: "/sign-in", permanent: true }];
  },
};

export default nextConfig;
