"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";

type Props = {
  lang: Locale;
  name: string;
  category: string;
  photo: string | null;
  verified: boolean;
  rating: { value: number; count: number } | null;
  profileUrl: string;
  reviewUrl: string | null;
};

const W = 1080;
const H = 1350;
const GREEN = "#1f6b4f";
const CREAM = "#f7f4ee";
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

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Рисует карточку 1080×1350 (подходит и для печати, и для поста в соцсетях). */
async function drawCard(p: Props, kind: "card" | "review"): Promise<Blob | null> {
  const t = getDict(p.lang).cabinet;
  await document.fonts?.ready;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // Фон и шапка
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, W, 150);
  ctx.fillStyle = "#fff";
  roundRect(ctx, 70, 45, 60, 60, 14);
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.font = `bold 40px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillText("N", 86, 77);
  ctx.fillStyle = "#e0a526";
  ctx.beginPath();
  ctx.arc(122, 55, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold 46px ${FONT}`;
  ctx.fillText("NomerOk.ge", 150, 76);

  let y = 200;
  if (kind === "card") {
    // Фото или инициалы
    const size = 200;
    const x = (W - size) / 2;
    const img = p.photo ? await loadImage(p.photo) : null;
    ctx.save();
    roundRect(ctx, x, y, size, size, 44);
    ctx.clip();
    if (img) {
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, x, y, size, size);
    } else {
      ctx.fillStyle = "#e7f2ec";
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = GREEN;
      ctx.font = `bold 80px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText(p.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(), W / 2, y + size / 2 + 4);
    }
    ctx.restore();
    y += size + 50;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1c1b18";
  if (kind === "review") {
    ctx.font = `bold 72px ${FONT}`;
    for (const line of wrap(ctx, t.cardReviewTitle, W - 160)) {
      y += 80;
      ctx.fillText(line, W / 2, y);
    }
    ctx.font = `44px ${FONT}`;
    ctx.fillStyle = "#5c5a54";
    for (const line of wrap(ctx, t.cardReviewText, W - 200)) {
      y += 60;
      ctx.fillText(line, W / 2, y);
    }
    y += 30;
  }
  ctx.fillStyle = "#1c1b18";
  ctx.font = `bold ${kind === "card" ? 64 : 48}px ${FONT}`;
  for (const line of wrap(ctx, p.name, W - 160)) {
    y += kind === "card" ? 64 : 60;
    ctx.fillText(line, W / 2, y);
  }
  ctx.font = `40px ${FONT}`;
  ctx.fillStyle = "#5c5a54";
  y += 56;
  ctx.fillText(p.category, W / 2, y);
  if (kind === "card") {
    const bits: string[] = [];
    if (p.rating) bits.push(`★ ${p.rating.value.toFixed(1)} (${p.rating.count})`);
    if (p.verified) bits.push(`✓ ${t.cardVerified}`);
    if (bits.length) {
      y += 56;
      ctx.fillStyle = GREEN;
      ctx.font = `bold 36px ${FONT}`;
      ctx.fillText(bits.join("   ·   "), W / 2, y);
    }
  }

  // QR-код в белой рамке
  const qrSize = kind === "card" ? 380 : 440;
  const qrY = H - qrSize - 190;
  const qr = await QRCode.toDataURL(kind === "card" ? p.profileUrl : p.reviewUrl!, { margin: 1, width: qrSize, color: { dark: "#1c1b18", light: "#ffffff" } });
  const qrImg = await loadImage(qr);
  ctx.fillStyle = "#fff";
  roundRect(ctx, (W - qrSize) / 2 - 30, qrY - 30, qrSize + 60, qrSize + 60, 36);
  ctx.fill();
  if (qrImg) ctx.drawImage(qrImg, (W - qrSize) / 2, qrY, qrSize, qrSize);

  ctx.fillStyle = "#1c1b18";
  ctx.font = `bold 38px ${FONT}`;
  ctx.fillText(`📷 ${t.cardScan}`, W / 2, H - 100);
  ctx.fillStyle = "#5c5a54";
  ctx.font = `32px ${FONT}`;
  ctx.fillText(kind === "card" ? t.cardContacts : "nomerok.ge", W / 2, H - 52);

  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}

/** Кабинет: скачать визитку с QR-кодом и табличку «Оставьте отзыв». */
export function QrCards(props: Props) {
  const t = getDict(props.lang).cabinet;
  const [busy, setBusy] = useState<"" | "card" | "review">("");

  async function download(kind: "card" | "review") {
    setBusy(kind);
    try {
      const blob = await drawCard(props, kind);
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = kind === "card" ? "nomerok-vizitka.png" : "nomerok-otzyv.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="text-[18px] font-bold">{t.qrTitle}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t.qrHint}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => download("card")} disabled={!!busy} className="btn-primary h-12">
          {busy === "card" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {busy === "card" ? t.qrMaking : t.qrCard}
        </button>
        {props.reviewUrl && (
          <button type="button" onClick={() => download("review")} disabled={!!busy} className="btn-ghost h-12">
            {busy === "review" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {busy === "review" ? t.qrMaking : t.qrReview}
          </button>
        )}
      </div>
      {props.reviewUrl && <p className="mt-2 text-[13px] leading-snug text-muted">{t.qrReviewHint}</p>}
    </section>
  );
}
