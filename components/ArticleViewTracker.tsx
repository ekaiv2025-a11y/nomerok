"use client";

import { useEffect } from "react";

/** Отмечает просмотр статьи один раз при открытии. */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const u = new URL(window.location.href);
    const body = JSON.stringify({ slug, ref: document.referrer, utm: u.searchParams.get("utm_source") ?? u.searchParams.get("from") ?? "" });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/article-view", new Blob([body], { type: "application/json" }));
    else fetch("/api/article-view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
