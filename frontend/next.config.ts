import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      // Запросы со слешем — проксируем как есть
      {
        source: "/api/v1/:path*/",
        destination: `${BACKEND_URL}/api/v1/:path*/`,
      },
      // Запросы без слеша — добавляем слеш чтобы FastAPI не делал 307
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*/`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
