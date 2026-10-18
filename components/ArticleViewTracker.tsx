"use client";

import { useEffect } from "react";

/** Отмечает просмотр статьи один раз при открытии. */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const body = JSON.stringify({ slug });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/article-view", new Blob([body], { type: "application/json" }));
    else fetch("/api/article-view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
