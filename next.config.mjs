/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["sequelize", "mysql2", "bcryptjs", "mailgun.js", "form-data"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:lang(en|fr)/manifest.webmanifest",
        destination: "/manifest.webmanifest",
      },
      {
        source: "/:lang(en|fr)/sw.js",
        destination: "/sw.js",
      },
      {
        source: "/:lang(en|fr)/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
