"use client";

import dynamic from "next/dynamic";

/** Карта без серверного рендера (Leaflet работает только в браузере). */
export const Map = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[320px] animate-pulse rounded-2xl bg-cream" />,
});
export type { MapPoint } from "./LeafletMap";
