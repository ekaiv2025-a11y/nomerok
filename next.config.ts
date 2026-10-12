import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Фото-обложки журнала загружаются через server action (Vercel принимает до 4,5 МБ)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
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
