"use client";

import { useEffect } from "react";

/** Отмечает заход на сайт один раз за вкладку: откуда пришёл человек. */
export function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("nm_visit")) return;
      sessionStorage.setItem("nm_visit", "1");
    } catch {}
    const u = new URL(window.location.href);
    const body = JSON.stringify({ ref: document.referrer, utm: u.searchParams.get("utm_source") ?? u.searchParams.get("from") ?? "", path: u.pathname });
    fetch("/api/visit", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, []);
  return null;
}
