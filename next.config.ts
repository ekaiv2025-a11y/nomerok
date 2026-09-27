import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Фото специалистов (Supabase) и примеров (Unsplash) сжимаются под размер экрана и кэшируются
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    // Имена файлов уникальные, картинки не меняются — храним сжатые версии месяц
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;
