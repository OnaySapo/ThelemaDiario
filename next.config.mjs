/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/media/:path*",
      },
    ];
  },
};

export default nextConfig;
