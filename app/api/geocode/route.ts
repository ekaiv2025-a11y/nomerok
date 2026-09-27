import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-info";

/*
 * Поиск адреса на карте (OpenStreetMap Nominatim) — только для кабинета специалиста.
 * ?q=адрес → координаты;  ?lat=..&lng=.. → адрес точки.
 */
const UA = "Nomerok.ge/1.0 (https://nomerok.ge)";
// Батуми и окрестности — искать в первую очередь здесь
const VIEWBOX = "41.52,41.75,41.85,41.50";

export async function GET(req: NextRequest) {
  if (!rateLimit("geo:" + (await clientIp()), 30, 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") ?? "ru";
  try {
    if (sp.get("q")) {
      const q = sp.get("q")!.slice(0, 200);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ge&viewbox=${VIEWBOX}&accept-language=${lang}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
      const j = (await res.json()) as { lat: string; lon: string; display_name: string }[];
      if (!j[0]) return NextResponse.json({ ok: false });
      return NextResponse.json({ ok: true, lat: Number(j[0].lat), lng: Number(j[0].lon), address: j[0].display_name });
    }
    const lat = Number(sp.get("lat"));
    const lng = Number(sp.get("lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ ok: false }, { status: 400 });
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&accept-language=${lang}&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
    const j = (await res.json()) as { address?: Record<string, string>; display_name?: string };
    const a = j.address ?? {};
    const short = [a.road, a.house_number].filter(Boolean).join(" ") || a.suburb || a.neighbourhood || "";
    const city = a.city || a.town || a.village || "";
    return NextResponse.json({ ok: true, address: [city, short].filter(Boolean).join(", ") || j.display_name || "" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
