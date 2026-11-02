"use client";

/*
 * Шаги в формах для воронок (lib/funnel.ts). Только что сделал человек — без того, что он ввёл.
 * События копятся и уходят пачкой; при уходе со страницы — через sendBeacon.
 */
export type Funnel = "request" | "message" | "join" | "project";
type Ev = { ev: string; f: Funnel; path: string; p?: Record<string, unknown> };

let queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function sid(): string {
  try {
    let s = sessionStorage.getItem("nm_sid");
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("nm_sid", s);
    }
    return s;
  } catch {
    return "nosession";
  }
}

export function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const body = JSON.stringify({ sid: sid(), e: queue.splice(0, 20) });
  try {
    if (navigator.sendBeacon?.("/api/ev", new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/ev", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
}

export function track(ev: string, f: Funnel, p?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  queue.push({ ev, f, path: location.pathname + (location.search.includes("t=") ? "?form" : ""), p });
  if (queue.length >= 10) flush();
  else if (!timer) timer = setTimeout(flush, 1500);
  // для опроса «что помешало?»
  if (ev === "start") started.add(f);
  if (ev === "done") finished.add(f);
}

export const started = new Set<Funnel>();
export const finished = new Set<Funnel>();

/** Какая воронка у страницы: /ru/request → request и т. д. */
export function funnelOfPath(path: string): Funnel | null {
  const p = path.replace(/^\/(ru|en|ka)(?=\/|$)/, "");
  if (/^\/request\/?$/.test(p)) return "request";
  if (/^\/master\/[^/]+\/message\/?$/.test(p)) return "message";
  if (/^\/join\/?$/.test(p)) return "join";
  if (/^\/novostroyki(\/|$)/.test(p)) return "project";
  return null;
}
