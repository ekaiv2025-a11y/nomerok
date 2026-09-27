"use client";

import { useEffect } from "react";

/** Отмечает просмотр профиля один раз при открытии страницы. */
export function ViewTracker({ masterId }: { masterId: string }) {
  useEffect(() => {
    const body = JSON.stringify({ masterId });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/view", new Blob([body], { type: "application/json" }));
    else fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [masterId]);
  return null;
}
