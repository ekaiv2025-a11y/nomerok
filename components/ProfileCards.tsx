"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Copy, Download, Loader2, Share2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { splitPhoto } from "@/lib/photo-pos";

/*
 * Карточка специалиста для Instagram и Telegram — без QR-кода (по телефону его никто не сканирует).
 * Сторис 1080×1920 (внизу место под стикер «Ссылка») и пост 1080×1350.
 * Рядом — кнопки «Скопировать ссылку» (для стикера и шапки профиля) и «Поделиться» (сразу в Instagram с телефона).
 */

export type CardData = {
  lang: Locale;
  name: string;
  role: string;
  photo: string | null;
  verified: boolean;
  rating: { value: number; count: number } | null;
  price: string | null;
  services: string[];
  linkText: string; // nomerok.ge/anna
  url: string; // полная ссылка
};

const T = {
  ru: {
    title: "📲 Карточка для Instagram и Telegram",
    hint: "Красивая карточка вашего профиля. Выложите в сторис и добавьте стикер «Ссылка» — клиенты откроют профиль в одно касание.",
    story: "Сторис",
    post: "Пост",
    download: "Скачать",
    share: "Поделиться",
    copy: "Скопировать ссылку",
    copied: "✓ Ссылка скопирована",
    making: "Готовим…",
    howTitle: "Как выложить в Instagram",
    how: [
      "Нажмите «Поделиться» (или «Скачать») и выберите Instagram → История.",
      "Нажмите «Скопировать ссылку» здесь.",
      "В истории добавьте стикер «Ссылка» и вставьте её — положите стикер на стрелку внизу карточки.",
      "Ту же ссылку поставьте в шапку профиля Instagram: «Редактировать профиль» → «Ссылки».",
    ],
    verified: "Номер подтверждён",
    reviews: (n: number) => `${n} отзыв${n % 10 === 1 && n % 100 !== 11 ? "" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "а" : "ов"}`,
    find: "Меня можно найти на NomerOk.ge",
    cta: "Контакты, цены и отзывы — по ссылке",
    ctaPost: "Контакты, цены и отзывы:",
  },
  en: {
    title: "📲 Card for Instagram and Telegram",
    hint: "A beautiful card of your profile. Post it as a story and add a Link sticker — clients open your profile in one tap.",
    story: "Story",
    post: "Post",
    download: "Download",
    share: "Share",
    copy: "Copy link",
    copied: "✓ Link copied",
    making: "Making…",
    howTitle: "How to post on Instagram",
    how: [
      "Tap “Share” (or “Download”) and choose Instagram → Story.",
      "Tap “Copy link” here.",
      "In the story add a Link sticker and paste it — place the sticker over the arrow at the bottom.",
      "Put the same link in your Instagram bio: Edit profile → Links.",
    ],
    verified: "Verified number",
    reviews: (n: number) => `${n} review${n === 1 ? "" : "s"}`,
    find: "Find me on NomerOk.ge",
    cta: "Contacts, prices and reviews — via the link",
    ctaPost: "Contacts, prices and reviews:",
  },
  ka: {
    title: "📲 ბარათი Instagram-ისა და Telegram-ისთვის",
    hint: "თქვენი პროფილის ლამაზი ბარათი. გამოაქვეყნეთ სთორიში და დაამატეთ სტიკერი «ბმული» — კლიენტები ერთი შეხებით გახსნიან პროფილს.",
    story: "სთორი",
    post: "პოსტი",
    download: "ჩამოტვირთვა",
    share: "გაზიარება",
    copy: "ბმულის კოპირება",
    copied: "✓ დაკოპირდა",
    making: "მზადდება…",
    howTitle: "როგორ გამოვაქვეყნოთ Instagram-ში",
    how: [
      "დააჭირეთ «გაზიარებას» (ან «ჩამოტვირთვას») და აირჩიეთ Instagram → სთორი.",
      "დააჭირეთ «ბმულის კოპირებას» აქ.",
      "სთორიში დაამატეთ სტიკერი «ბმული» და ჩასვით — დადეთ ისარზე ბარათის ქვემოთ.",
      "იგივე ბმული ჩასვით Instagram-ის პროფილში: «პროფილის რედაქტირება» → «ბმულები».",
    ],
    verified: "ნომერი დადასტურებულია",
    reviews: (n: number) => `${n} შეფასება`,
    find: "მიპოვეთ NomerOk.ge-ზე",
    cta: "კონტაქტები, ფასები და შეფასებები — ბმულით",
    ctaPost: "კონტაქტები, ფასები და შეფასებები:",
  },
} as const;

const GREEN = "#1f6b4f";
const GREEN_D = "#174f3b";
const AMBER = "#e0a526";
const CREAM = "#f7f4ee";
const INK = "#1c1b18";
const MUTED = "#6b6a65";
const FONT = '"Noto Sans Georgian", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Перенос строк с ограничением: лишнее обрезаем многоточием. */
function lines(ctx: CanvasRenderingContext2D, text: string, maxW: number, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  if (out.length > max) {
    const cut = out.slice(0, max);
    let last = cut[max - 1];
    while (last && ctx.measureText(last + "…").width > maxW) last = last.slice(0, -1);
    cut[max - 1] = last.trimEnd() + "…";
    return cut;
  }
  return out;
}

function logo(ctx: CanvasRenderingContext2D, x: number, y: number, onPhoto: boolean) {
  // плашка-логотип
  ctx.font = `bold 38px ${FONT}`;
  const w = 64 + 18 + ctx.measureText("NomerOk.ge").width + 34;
  ctx.fillStyle = onPhoto ? "rgba(255,255,255,0.92)" : "#fff";
  rr(ctx, x, y, w, 76, 38);
  ctx.fill();
  ctx.fillStyle = GREEN;
  rr(ctx, x + 10, y + 10, 56, 56, 14);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold 36px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("N", x + 38, y + 40);
  ctx.fillStyle = AMBER;
  ctx.beginPath();
  ctx.arc(x + 62, y + 14, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.font = `bold 38px ${FONT}`;
  ctx.fillStyle = INK;
  ctx.fillText("Nomer", x + 82, y + 40);
  const w1 = ctx.measureText("Nomer").width;
  ctx.fillStyle = GREEN;
  ctx.fillText("Ok", x + 82 + w1, y + 40);
  const w2 = ctx.measureText("Ok").width;
  ctx.fillStyle = MUTED;
  ctx.font = `600 38px ${FONT}`;
  ctx.fillText(".ge", x + 82 + w1 + w2, y + 40);
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, size = 34): number {
  ctx.font = `bold ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + size * 1.3;
  const h = size * 1.9;
  ctx.fillStyle = bg;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, x + size * 0.65, y + h / 2 + 1);
  return w;
}

async function draw(d: CardData, kind: "story" | "post"): Promise<HTMLCanvasElement> {
  await document.fonts?.ready;
  const t = T[d.lang];
  const W = 1080;
  const H = kind === "story" ? 1920 : 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // 1) Фото во всю ширину (или зелёный фон с инициалами)
  const photoH = kind === "story" ? 900 : 700;
  const { src, y: posY } = splitPhoto(d.photo);
  const img = src ? await loadImage(src) : null;
  if (img) {
    const scale = Math.max(W / img.width, photoH / img.height);
    const sw = W / scale;
    const sh = photoH / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) * (posY / 100);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, photoH);
  } else {
    const g = ctx.createLinearGradient(0, 0, W, photoH);
    g.addColorStop(0, GREEN);
    g.addColorStop(1, GREEN_D);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, photoH);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.font = `bold ${kind === "story" ? 360 : 260}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(), W / 2, photoH / 2);
  }
  // затемнение снизу — чтобы имя читалось на любом фото
  const fade = ctx.createLinearGradient(0, photoH * 0.45, 0, photoH);
  fade.addColorStop(0, "rgba(20,30,25,0)");
  fade.addColorStop(1, "rgba(20,30,25,0.82)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, photoH);

  const pad = 72;
  // логотип: в сторис — ниже верхних 250px (там интерфейс Instagram)
  logo(ctx, pad, kind === "story" ? 260 : 56, true);

  // 2) Имя и профессия поверх фото
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${kind === "story" ? 92 : 80}px ${FONT}`;
  const nameLines = lines(ctx, d.name, W - pad * 2, 2);
  const lh = kind === "story" ? 98 : 86;
  let y = photoH - 70 - (nameLines.length - 1) * lh - 58;
  for (const l of nameLines) {
    ctx.fillText(l, pad, y);
    y += lh;
  }
  ctx.font = `600 ${kind === "story" ? 44 : 40}px ${FONT}`;
  ctx.fillStyle = AMBER;
  ctx.fillText(lines(ctx, d.role, W - pad * 2, 1)[0] ?? "", pad, y - lh + 62);

  // 3) Плашки: оценка и цена (если есть)
  y = photoH + 44;
  let x = pad;
  const chips: [string, string, string][] = [];
  if (d.rating) chips.push([`★ ${d.rating.value.toFixed(1)} · ${t.reviews(d.rating.count)}`, "#fdf3dc", "#7a5a12"]);
  if (d.price) chips.push([d.price, "#fff", INK]);
  const chipSize = kind === "story" ? 34 : 30;
  for (const [txt, bg, fg] of chips) {
    ctx.font = `bold ${chipSize}px ${FONT}`;
    const w = ctx.measureText(txt).width + chipSize * 1.3;
    if (x + w > W - pad) {
      x = pad;
      y += chipSize * 1.9 + 16;
    }
    x += pill(ctx, txt, x, y, bg, fg, chipSize) + 14;
  }
  if (chips.length) y += chipSize * 1.9 + (kind === "story" ? 28 : 18);
  else y += kind === "story" ? 10 : 0;

  // 4) Услуги: каждая — до 2 строк, без обрезки на полуслове; сколько влезает до плашки со ссылкой
  const bandH = kind === "story" ? 280 : 230;
  const bandY = kind === "story" ? H - 250 - bandH - 10 : H - bandH;
  const limit = bandY - (kind === "story" ? 40 : 30);
  const fs = kind === "story" ? 40 : 34;
  const lh2 = Math.round(fs * 1.32);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `${fs}px ${FONT}`;
  const clean = d.services
    .map((s) => s.replace(/^[\p{Extended_Pictographic}\p{So}\uFE0F\s•·*\-–—]+/u, "").trim())
    .filter((s) => s && !/:$/.test(s));
  for (const s of clean.slice(0, 4)) {
    const ls = lines(ctx, s, W - pad * 2 - 46, 2);
    if (y + 16 + ls.length * lh2 > limit) break;
    y += 16;
    for (let i = 0; i < ls.length; i++) {
      y += lh2;
      if (i === 0) {
        ctx.fillStyle = GREEN;
        ctx.beginPath();
        ctx.arc(pad + 11, y - fs * 0.34, fs * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = INK;
      ctx.fillText(ls[i], pad + 46, y);
    }
  }

  // 5) «Меня можно найти на NomerOk.ge» + ссылка
  const fit = (text: string, size: number, weight: string, maxW: number) => {
    let f = size;
    ctx.font = `${weight} ${f}px ${FONT}`;
    while (ctx.measureText(text).width > maxW && f > 24) {
      f -= 2;
      ctx.font = `${weight} ${f}px ${FONT}`;
    }
  };
  ctx.fillStyle = GREEN;
  if (kind === "story") rr(ctx, pad - 12, bandY, W - (pad - 12) * 2, bandH, 40);
  else {
    ctx.beginPath();
    ctx.rect(0, bandY, W, bandH);
  }
  ctx.fill();
  ctx.textAlign = "center";
  const inner = W - pad * 2 - 40;
  ctx.fillStyle = "#fff";
  fit(t.find, kind === "story" ? 46 : 42, "bold", inner);
  ctx.fillText(t.find, W / 2, bandY + (kind === "story" ? 76 : 66));
  ctx.fillStyle = "#cfe6da";
  fit(t.cta, kind === "story" ? 32 : 28, "600", inner);
  ctx.fillText(t.cta, W / 2, bandY + (kind === "story" ? 130 : 112));
  ctx.fillStyle = AMBER;
  const link = kind === "story" ? `👇 ${d.linkText}` : d.linkText;
  fit(link, kind === "story" ? 58 : 52, "bold", inner);
  ctx.fillText(link, W / 2, bandY + (kind === "story" ? 220 : 186));
  return c;
}

const toBlob = (c: HTMLCanvasElement) => new Promise<Blob | null>((r) => c.toBlob((b) => r(b), "image/png"));

export function ProfileCards(d: CardData) {
  const t = T[d.lang];
  const [kind, setKind] = useState<"story" | "post">("story");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let alive = true;
    setPreview(null);
    draw(d, kind).then(async (c) => {
      const b = await toBlob(c);
      if (!b || !alive) return;
      url = URL.createObjectURL(b);
      setPreview(url);
    });
    try {
      const f = new File([new Blob()], "x.png", { type: "image/png" });
      setCanShare(!!navigator.canShare?.({ files: [f] }));
    } catch {}
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, d.photo, d.name]);

  const fileName = `nomerok-${kind === "story" ? "story" : "post"}.png`;

  async function download() {
    setBusy(true);
    try {
      const b = await toBlob(await draw(d, kind));
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    setBusy(true);
    try {
      const b = await toBlob(await draw(d, kind));
      if (!b) return;
      const file = new File([b], fileName, { type: "image/png" });
      await navigator.share({ files: [file] }).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(d.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">{t.title}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.hint}</p>

      <div className="mt-4 inline-flex rounded-full bg-cream p-1">
        {(["story", "post"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-full px-4 py-1.5 text-[14px] font-semibold ${kind === k ? "bg-white shadow-sm" : "text-muted"}`}>
            {t[k]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-[240px_1fr]">
        <div className={`overflow-hidden rounded-2xl border border-line bg-cream ${kind === "story" ? "aspect-[9/16]" : "aspect-[4/5]"} w-full max-w-[240px]`}>
          {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted"><Loader2 className="h-5 w-5 animate-spin" /></div>}
        </div>
        <div>
          <div className="flex flex-col gap-2">
            {canShare && (
              <button type="button" onClick={share} disabled={busy} className="btn-primary h-11">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} {t.share}
              </button>
            )}
            <button type="button" onClick={download} disabled={busy} className={canShare ? "btn-ghost h-11" : "btn-primary h-11"}>
              {busy && !canShare ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t.download}
            </button>
            <button type="button" onClick={copy} className="btn-ghost h-11">
              <Copy className="h-4 w-4" /> {copied ? t.copied : t.copy}
            </button>
            <p className="break-all text-center text-[13px] text-muted">{d.url.replace(/^https?:\/\//, "")}</p>
          </div>
          <p className="mt-4 text-[14px] font-semibold">{t.howTitle}</p>
          <ol className="mt-2 space-y-1.5 text-[13px] leading-snug text-muted">
            {t.how.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-dark">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
