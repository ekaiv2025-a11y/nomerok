import { categoryLabel } from "@/lib/categories";
import { href, type Locale } from "@/lib/i18n";
import type { PublicMaster } from "@/lib/types";
import { priceText } from "../MasterCard";
import type { MapPoint } from "./LeafletMap";

const BONUS_WORD = { ru: "бонус", en: "bonus", ka: "ბონუსი" } as const;
const OPEN = { ru: "Открыть анкету", en: "Open profile", ka: "ანკეტის ნახვა" } as const;
const BONUS_KIND = {
  repost: { ru: "за репост", en: "for a repost", ka: "რეპოსტისთვის" },
  ref: { ru: "другу по рекомендации", en: "for a referred friend", ka: "მეგობარს რეკომენდაციით" },
} as const;

/** Специалист на карте: в подсказке и всплывающей карточке — фото, направление, рейтинг, цена, адрес и бонус. */
export function masterPoint(m: PublicMaster, lang: Locale): MapPoint {
  const bonus = m.bonus && m.bonusText && !m.away ? `${m.bonusText} · ${BONUS_KIND[m.bonusKind === "repost" ? "repost" : "ref"][lang]}` : null;
  return {
    lat: m.place_lat!,
    lng: m.place_lng!,
    title: m.name,
    subtitle: m.place_address || undefined,
    href: href(lang, `/master/${m.slug}`),
    photo: m.photo_url,
    card: {
      cat: categoryLabel(m.category, lang),
      tip: categoryLabel(m.category, lang) + (bonus ? ` · 🎁 ${BONUS_WORD[lang]}` : ""),
      rating: m.reviews ? `★ ${(m.rating ?? 0).toFixed(1)} · ${m.reviews}` : null,
      price: priceText(m, lang),
      verified: !!m.verified,
      bonus,
      cta: OPEN[lang],
    },
  };
}
