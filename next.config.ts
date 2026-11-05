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

/*
 * Кеш на CDN Vercel для публичных страниц без входа в кабинет: страница собирается сервером раз в несколько минут,
 * остальные посетители и роботы получают готовую копию. Иначе каждый заход = запуск сервера (лимиты Vercel, ноябрь 2026).
 * Свежесть: 5 минут, потом в фоне пересобирается; старую копию можно отдавать до суток, пока идёт пересборка.
 */
const CDN = [{ key: "Vercel-CDN-Cache-Control", value: "max-age=300, stale-while-revalidate=86400" }];
const PUBLIC_PAGES = [
  "/:lang(ru|en|ka)",
  "/:lang(ru|en|ka)/services/:path*",
  "/:lang(ru|en|ka)/master/:slug",
  "/:lang(ru|en|ka)/orders",
  "/:lang(ru|en|ka)/places",
  "/:lang(ru|en|ka)/places/c/:cat",
  "/:lang(ru|en|ka)/novostroyki/:path*",
  "/:lang(ru|en|ka)/georgia/:path*",
  "/:lang(ru|en|ka)/guide/:path*",
  "/:lang(ru|en|ka)/phones/:path*",
];
// Старый адрес *.vercel.app → основной домен (раньше делал proxy.ts, но proxy теперь не запускается на страницах с /ru, /en, /ka)
const SITE = process.env.NEXT_PUBLIC_SITE_URL;
if (process.env.VERCEL_ENV === "production" && SITE) {
  nextConfig.redirects = async () => [
    { source: "/:path((?!api|admin).*)", has: [{ type: "host", value: "(?<sub>.+)\\.vercel\\.app" }], destination: `${SITE}/:path`, permanent: true },
  ];
}
nextConfig.headers = async () => PUBLIC_PAGES.map((source) => ({ source, headers: CDN }));

export default nextConfig;
