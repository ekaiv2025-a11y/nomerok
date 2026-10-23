import "server-only";
import type { ReactElement } from "react";
import QRCode from "qrcode";
import type { PublicMaster } from "./types";
import { categoryLabel, unitLabel } from "./categories";
import { cityLabel } from "./cities";
import { splitPhoto } from "./photo-pos";
import type { Locale } from "./i18n";

/*
 * Карточка специалиста для сторис Instagram (1080×1920).
 * Три оформления: green (зелёный фон), light (светлый), photo (фото на весь верх).
 * Важное — между 250 и 1670 px по высоте: сверху и снизу интерфейс Instagram.
 * Только настоящие данные анкеты: рейтинг и отзывы — если они есть, «номер подтверждён» — если подтверждён.
 */
export type CardStyle = "green" | "light" | "photo";
export const CARD_STYLES: CardStyle[] = ["green", "light", "photo"];
export const W = 1080;
export const H = 1920;

const C = { green: "#1f6b4f", dark: "#154d39", soft: "#e7f2ec", cream: "#f7f4ee", amber: "#e0a526", ink: "#1c1b18", muted: "#6b6a65", sub: "#cfe6da" };
const FONT = "M, MC, G, S";
const SHOW_VERIFIED = false; // «Номер подтверждён» на карточке не пишем (как и в прежней карточке)

const T = {
  ru: { verified: "Номер подтверждён", exp: (n: number) => `${n} ${plural(n, "год", "года", "лет")} опыта`, from: "от", find: "Меня можно найти на NomerOk", more: "Контакты, цены и отзывы — по ссылке", reviews: (n: number) => `${n} ${plural(n, "отзыв", "отзыва", "отзывов")}`, scan: "Наведите камеру" },
  en: { verified: "Verified phone", exp: (n: number) => `${n} yr${n === 1 ? "" : "s"} experience`, from: "from", find: "Find me on NomerOk", more: "Contacts, prices and reviews — via the link", reviews: (n: number) => `${n} review${n === 1 ? "" : "s"}`, scan: "Scan with camera" },
  ka: { verified: "ნომერი დადასტურებულია", exp: (n: number) => `${n} წლის გამოცდილება`, from: "", find: "მიპოვეთ NomerOk-ზე", more: "კონტაქტები, ფასები და შეფასებები — ბმულით", reviews: (n: number) => `${n} შეფასება`, scan: "დაასკანერეთ" },
} as const;

function plural(n: number, one: string, few: string, many: string) {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export type CardData = {
  name: string;
  category: string;
  city: string;
  photo: string | null;
  photoY: number;
  verified: boolean;
  rating: number | null;
  reviews: number;
  exp: number | null;
  services: string[];
  price: string | null;
  priceText: string | null;
  link: string; // без https://
  url: string; // полная ссылка (для QR)
};

export function cardData(m: PublicMaster, lang: Locale, site: string): CardData {
  const t = T[lang];
  const { src, y } = splitPhoto(m.photo_url);
  const host = site.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const path = m.short ? `/${m.short}` : `/${lang}/master/${m.slug}`;
  const services = String(m.services ?? "")
    .split(/\n|;|•/)
    .map((s) => s.replace(/^[\s\-–—*·•✓✔️]+/, "").trim())
    .filter((s) => s.length > 2)
    .map((s) => clip(s, 84));
  // помещаем услуги целиком (до 2 строк каждая), но не больше ~4 строк всего
  const picked: string[] = [];
  let lines = 0;
  for (const s of services) {
    const n = s.length > 42 ? 2 : 1;
    if (picked.length >= 3 || lines + n > 4) break;
    picked.push(s);
    lines += n;
  }
  const price = m.price_from ? `${t.from} ${m.price_from} ₾${m.price_unit ? " / " + unitLabel(m.price_unit, lang) : ""}`.trim() : null;
  return {
    name: clip(m.name, 40),
    category: categoryLabel(m.category, lang),
    city: cityLabel(m.city ?? "batumi", lang),
    photo: src,
    photoY: y,
    verified: !!m.verified,
    rating: m.reviews > 0 ? m.rating : null,
    reviews: m.reviews ?? 0,
    exp: m.experience_years && m.experience_years > 0 ? m.experience_years : null,
    services: picked,
    price: null, // цену на карточке не показываем (решили раньше: цены меняются, пусть смотрят в профиле)
    priceText: price,
    link: host + path,
    url: `${site.replace(/\/$/, "")}${path}`,
  };
}

export async function qrDataUrl(url: string, dark = C.ink): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark, light: "#ffffff" }, errorCorrectionLevel: "M" });
}

/* ---------- мелкие детали ---------- */

function Logo({ onDark }: { onDark: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: onDark ? "#ffffff" : C.green, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span style={{ fontSize: 50, fontWeight: 800, color: onDark ? C.green : "#ffffff", lineHeight: 1 }}>N</span>
        <div style={{ position: "absolute", top: 9, right: 9, width: 13, height: 13, borderRadius: 13, background: C.amber }} />
      </div>
      <div style={{ display: "flex", fontSize: 46, fontWeight: 800, letterSpacing: -1, color: onDark ? "#ffffff" : C.ink }}>
        <span>Nomer</span>
        <span style={{ color: onDark ? C.amber : C.green }}>Ok</span>
        <span style={{ color: onDark ? C.sub : C.muted, fontWeight: 500 }}>.ge</span>
      </div>
    </div>
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

function Star({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

function Chips({ d, lang, dark, left }: { d: CardData; lang: Locale; dark: boolean; left?: boolean }) {
  const t = T[lang];
  const bg = dark ? "rgba(255,255,255,0.12)" : C.soft;
  const fg = dark ? "#ffffff" : C.dark;
  const chip = { display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 999, background: bg, color: fg, fontSize: 31, fontWeight: 600 } as const;
  const list: ReactElement[] = [];
  if (d.verified && SHOW_VERIFIED)
    list.push(
      <div key="v" style={chip}>
        <Check color={dark ? C.amber : C.green} />
        {t.verified}
      </div>,
    );
  if (d.rating)
    list.push(
      <div key="r" style={chip}>
        <Star color={C.amber} />
        {`${d.rating.toFixed(1).replace(".", lang === "en" ? "." : ",")} · ${t.reviews(d.reviews)}`}
      </div>,
    );
  if (!list.length) return null;
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: left ? "flex-start" : "center", flexShrink: 0 }}>{list}</div>;
}

function Services({ d, dark }: { d: CardData; dark: boolean }) {
  if (!d.services.length && !d.price) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, gap: 16, width: "100%", padding: "34px 44px", borderRadius: 40, background: dark ? "rgba(255,255,255,0.08)" : "#ffffff", border: dark ? "2px solid rgba(255,255,255,0.14)" : `2px solid #ebe6da` }}>
      {d.services.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 20, lineHeight: 1.3, fontSize: 35, fontWeight: 500, color: dark ? "#ffffff" : C.ink }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: C.amber, flexShrink: 0, marginTop: 17 }} />
          <span style={{ flex: 1 }}>{s}</span>
        </div>
      ))}
      {d.price && <div style={{ display: "flex", marginTop: d.services.length ? 6 : 0, fontSize: 44, fontWeight: 800, color: dark ? C.amber : C.green }}>{d.price}</div>}
    </div>
  );
}

function Cta({ d, lang, qr, variant }: { d: CardData; lang: Locale; qr: string | null; variant: "amber" | "green" | "white" }) {
  const t = T[lang];
  const bg = variant === "amber" ? C.amber : variant === "green" ? C.green : "#ffffff";
  const fg = variant === "green" ? "#ffffff" : C.ink;
  const linkC = variant === "green" ? C.amber : variant === "amber" ? C.dark : C.green;
  const long = d.link.length > 24;
  return (
    <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 32, width: "100%", padding: qr ? "32px 32px 32px 48px" : "44px 48px", borderRadius: 44, background: bg }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <div style={{ display: "flex", fontSize: qr ? 34 : 42, fontWeight: 800, color: fg, letterSpacing: -0.5 }}>{t.find}</div>
        <div style={{ display: "flex", fontSize: qr ? (long ? 34 : 46) : long ? 40 : 56, fontWeight: 800, color: linkC, letterSpacing: -1 }}>{d.link}</div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: variant === "green" ? C.sub : variant === "amber" ? "#4a3a12" : C.muted }}>{t.more}</div>
      </div>
      {qr && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", padding: 14, borderRadius: 28, background: "#ffffff" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} width={220} height={220} alt="" />
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ d, size, radius, ring }: { d: CardData; size: number; radius: number; ring?: string }) {
  const style = { width: size, height: size, borderRadius: radius, ...(ring ? { border: `12px solid ${ring}` } : {}) };
  if (d.photo)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={d.photo} width={size} height={size} alt="" style={{ ...style, objectFit: "cover", objectPosition: `50% ${d.photoY}%` }} />;
  return (
    <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", background: C.soft, color: C.green, fontSize: size * 0.45, fontWeight: 800 }}>
      {d.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

const cityLine = (d: CardData, lang: Locale) => [d.city, d.exp ? T[lang].exp(d.exp) : ""].filter(Boolean).join(" · ");
const NS = { display: "flex", flexShrink: 0 } as const; // блоки не сжимаются

/* ---------- три оформления ---------- */

export function StoryCard({ d, lang, style, qr }: { d: CardData; lang: Locale; style: CardStyle; qr: string | null }) {
  const base = { width: W, height: H, display: "flex", flexDirection: "column", fontFamily: FONT, position: "relative" } as const;
  const nameSize = d.name.length > 26 ? 66 : d.name.length > 18 ? 78 : 92;
  const nameStyle = { ...NS, fontSize: nameSize, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.04 } as const;

  if (style === "light") {
    return (
      <div style={{ ...base, background: C.cream, padding: "190px 72px 250px", alignItems: "center" }}>
        <div style={NS}>
          <Logo onDark={false} />
        </div>
        <div style={{ ...NS, marginTop: 40 }}>
          <Avatar d={d} size={360} radius={56} />
        </div>
        <div style={{ ...nameStyle, marginTop: 34, color: C.ink, textAlign: "center" }}>{d.name}</div>
        <div style={{ ...NS, marginTop: 10, fontSize: 46, fontWeight: 800, color: C.green }}>{d.category}</div>
        <div style={{ ...NS, marginTop: 6, fontSize: 34, fontWeight: 500, color: C.muted }}>{cityLine(d, lang)}</div>
        <div style={{ ...NS, marginTop: 26 }}>
          <Chips d={d} lang={lang} dark={false} />
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 20 }} />
        <div style={{ ...NS, width: "100%", marginBottom: 24 }}>
          <Services d={d} dark={false} />
        </div>
        <Cta d={d} lang={lang} qr={qr} variant="green" />
      </div>
    );
  }

  if (style === "photo" && d.photo) {
    return (
      <div style={{ ...base, background: C.dark }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.photo} width={W} height={1220} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: 1220, objectFit: "cover", objectPosition: `50% ${d.photoY}%` }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: 1222, display: "flex", backgroundImage: `linear-gradient(180deg, rgba(21,77,57,0.55) 0%, rgba(21,77,57,0) 20%, rgba(21,77,57,0) 48%, ${C.dark} 100%)` }} />
        <div style={{ display: "flex", flexDirection: "column", width: W, height: H, padding: "190px 72px 250px", position: "relative" }}>
          <div style={NS}>
            <Logo onDark />
          </div>
          <div style={{ display: "flex", flex: 1 }} />
          <div style={{ ...NS, alignSelf: "flex-start", padding: "12px 28px", borderRadius: 999, background: C.amber, color: C.ink, fontSize: 36, fontWeight: 800 }}>{d.category}</div>
          <div style={{ ...nameStyle, marginTop: 20, color: "#ffffff" }}>{d.name}</div>
          <div style={{ ...NS, marginTop: 8, fontSize: 36, fontWeight: 500, color: C.sub }}>{cityLine(d, lang)}</div>
          <div style={{ ...NS, marginTop: 26 }}>
            <Chips d={d} lang={lang} dark left />
          </div>
          {d.price && <div style={{ ...NS, marginTop: 26, fontSize: 50, fontWeight: 800, color: C.amber }}>{d.price}</div>}
          <div style={{ ...NS, marginTop: 34 }}>
            <Cta d={d} lang={lang} qr={qr} variant="white" />
          </div>
        </div>
      </div>
    );
  }

  // green (и запасной вариант для «photo» без фото)
  return (
    <div style={{ ...base, background: C.green, padding: "190px 72px 250px", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -260, right: -260, width: 720, height: 720, borderRadius: 720, background: "rgba(255,255,255,0.06)", display: "flex" }} />
      <div style={{ position: "absolute", bottom: -200, left: -240, width: 600, height: 600, borderRadius: 600, background: "rgba(224,165,38,0.12)", display: "flex" }} />
      <div style={NS}>
        <Logo onDark />
      </div>
      <div style={{ ...NS, marginTop: 40 }}>
        <Avatar d={d} size={340} radius={340} ring={C.amber} />
      </div>
      <div style={{ ...nameStyle, marginTop: 34, color: "#ffffff", textAlign: "center" }}>{d.name}</div>
      <div style={{ ...NS, marginTop: 10, fontSize: 48, fontWeight: 800, color: C.amber }}>{d.category}</div>
      <div style={{ ...NS, marginTop: 6, fontSize: 34, fontWeight: 500, color: C.sub }}>{cityLine(d, lang)}</div>
      <div style={{ ...NS, marginTop: 26 }}>
        <Chips d={d} lang={lang} dark />
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: 20 }} />
      <div style={{ ...NS, width: "100%", marginBottom: 24 }}>
        <Services d={d} dark />
      </div>
      <Cta d={d} lang={lang} qr={qr} variant="amber" />
    </div>
  );
}
