/*
 * Короткое «чем занимается» для карточки каталога: 2–3 услуги из анкеты без цен и эмодзи.
 * Если услуги написаны сплошным текстом — первая фраза.
 */
const PRICE = /\s*(?:[—–\-:]\s*)?(?:от\s*)?\(?\s*(?:от\s*)?\d[\d\s.,]*\s*(?:₾|лари|лар|л\b|gel|lari|\$|usd|€)[^,;)]*\)?/gi;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

function clean(s: string): string {
  return s
    .replace(EMOJI, " ")
    .replace(PRICE, "")
    .replace(/\(\s*\)/g, "")
    .replace(/^[\s•·\-–—*✓✔︎\d.)]+/, "")
    .replace(/\s+([,;])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/[\s,;:.—–-]+$/, "")
    .trim();
}

export function cardSummary(services: string, about = ""): string {
  const lines = (services || "")
    .split(/\n+/)
    .map(clean)
    .filter((l) => l.length >= 3 && !/[:：]$/.test(l) && !/адрес|жду вас|записат|запись|пишите|звоните|whatsapp|telegram|instagram|https?:/i.test(l) && !/^(мои услуги|услуги|оказываю услуги|прайс|цены)$/i.test(l));
  const short = lines.filter((l) => l.length <= 60);
  if (short.length >= 2) return short.slice(0, 3).join(" · ");
  const text = clean((lines.join(". ") || clean(about)).replace(/^(мои услуги|оказываю услуги|услуги)\s*:\s*/i, ""));
  const first = text.split(/(?<=[^\sА-ЯЁа-яё]{0}[а-яёa-z]{3,}[.!?])\s+(?=[А-ЯЁA-Z])/)[0] ?? "";
  return first.length > 140 ? first.slice(0, 137).replace(/\s+\S*$/, "") + "…" : first;
}
