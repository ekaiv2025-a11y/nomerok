import ru, { type Dict } from "./ru";
import en from "./en";
import ka from "./ka";
import type { Locale } from "./config";

export * from "./config";
export type { Dict };

const DICTS: Record<Locale, Dict> = { ru, en, ka };

export function getDict(lang: Locale): Dict {
  return DICTS[lang] ?? ru;
}
