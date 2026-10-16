/*
 * Адрес места по-русски из грузинского или английского варианта открытых карт.
 * Та же логика, что в scripts/place_addr.py (там считается при импорте); здесь — запасной вариант при показе.
 */

const KA: Record<string, string> = {
  ა: "а", ბ: "б", გ: "г", დ: "д", ე: "е", ვ: "в", ზ: "з", თ: "т", ი: "и", კ: "к", ლ: "л", მ: "м", ნ: "н", ო: "о", პ: "п", ჟ: "ж", რ: "р",
  ს: "с", ტ: "т", უ: "у", ფ: "п", ქ: "к", ღ: "г", ყ: "к", შ: "ш", ჩ: "ч", ც: "ц", ძ: "дз", წ: "ц", ჭ: "ч", ხ: "х", ჯ: "дж", ჰ: "х",
};
const KA_TYPES: Record<string, string> = {
  ქუჩა: "ул.", "ქ.": "ул.", გამზირი: "просп.", შესახვევი: "пер.", ჩიხი: "тупик", ხეივანი: "аллея", დასახლება: "посёлок", მოედანი: "пл.",
  სანაპირო: "наб.", ბულვარი: "бульвар", გზატკეცილი: "шоссе", კვარტალი: "квартал", უბანი: "район", მიკრორაიონი: "мкр.",
};
const FIRST: Record<string, string> = { Илиа: "Илья", Илия: "Илья", Гиорги: "Георгий", Давит: "Давид" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const GEO = /[Ⴀ-ჿ]/;

function kaWord(w0: string): string {
  let w = w0;
  if (w.endsWith("ძის")) w = w.slice(0, -3) + "ძე";
  else if (w.endsWith("შვილის")) w = w.slice(0, -1);
  else if (w.endsWith("ის") && w.length > 4) w = w.slice(0, -2) + "ი";
  else if (/[აოუე]ს$/.test(w) && w.length > 3) w = w.slice(0, -1);
  let r = [...w].map((c) => KA[c] ?? c).join("");
  r = r.replace(/иа$/, "ия");
  r = cap(r);
  return FIRST[r] ?? r;
}

function fromKa(a: string): string {
  return a
    .split(",")
    .map((part) => {
      let typ: string | null = null;
      const rest: string[] = [];
      for (const w of part.trim().split(/\s+/)) {
        if (KA_TYPES[w]) typ = KA_TYPES[w];
        else if (GEO.test(w)) rest.push(/^\d/.test(w) ? [...w].map((c) => KA[c] ?? c).join("") : kaWord(w));
        else rest.push(w);
      }
      const nums = rest.filter((w) => /^\d/.test(w));
      let s = rest.filter((w) => !/^\d/.test(w)).join(" ");
      if (typ && s) s = `${typ} ${s}`;
      if (nums.length) s = s ? `${s}, ${nums.join(" ")}` : nums.join(" ");
      return s;
    })
    .filter(Boolean)
    .join(", ");
}

const LAT: [string, string][] = [
  ["shch", "щ"], ["kh", "х"], ["gh", "г"], ["ch", "ч"], ["sh", "ш"], ["zh", "ж"], ["ts", "ц"], ["dz", "дз"], ["ya", "я"], ["yu", "ю"],
  ["a", "а"], ["b", "б"], ["c", "ц"], ["d", "д"], ["e", "е"], ["f", "ф"], ["g", "г"], ["h", "х"], ["i", "и"], ["j", "дж"], ["k", "к"], ["l", "л"],
  ["m", "м"], ["n", "н"], ["o", "о"], ["p", "п"], ["q", "к"], ["r", "р"], ["s", "с"], ["t", "т"], ["u", "у"], ["v", "в"], ["w", "в"], ["x", "кс"], ["y", "й"], ["z", "з"],
];
function latWord(w: string): string {
  const s = w.toLowerCase().replace(/['’]/g, "");
  let o = "";
  for (let i = 0; i < s.length; ) {
    const hit = LAT.find(([a]) => s.startsWith(a, i));
    if (hit) {
      o += hit[1];
      i += hit[0].length;
    } else o += s[i++];
  }
  return cap(o.replace(/иа$/, "ия"));
}
const EN_TYPES: Record<string, string> = {
  st: "ул.", "st.": "ул.", street: "ул.", str: "ул.", "str.": "ул.", ave: "просп.", "ave.": "просп.", avenue: "просп.", av: "просп.", lane: "пер.", ln: "пер.",
  blvd: "бульвар", boulevard: "бульвар", highway: "шоссе", hwy: "шоссе", sq: "пл.", square: "пл.", turn: "поворот", embankment: "наб.", district: "район", settlement: "посёлок",
};
const SKIP = new Set(["batumi", "georgia", "adjara", "ajara", "city", "n", "no", "#", "of", "the"]);

function fromLat(a0: string): string {
  const a = a0.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/\b(Batumi|Georgia|Adjara|Ajara)\b,?/gi, "").replace(/\b\d{4}\b(?=\s*,|\s*$)/g, "");
  return a
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      let typ: string | null = null;
      const nums: string[] = [];
      const names: string[] = [];
      for (const w of part.split(/\s+/)) {
        const lw = w.toLowerCase().replace(/[.,]+$/, "");
        if (EN_TYPES[lw] || EN_TYPES[w.toLowerCase()]) typ = EN_TYPES[lw] ?? EN_TYPES[w.toLowerCase()];
        else if (SKIP.has(lw)) continue;
        else if (/^\d+[a-zA-Z]?(\/\d+[a-zA-Z]?)?$/.test(w) || (nums.length && /^[a-zA-Z]$/.test(w))) nums.push(w);
        else if (/^[A-Za-z'’-]+$/.test(w)) names.push(latWord(w));
        else names.push(w);
      }
      let s = names.join(" ");
      if (typ) s = `${typ} ${s}`.trim();
      if (nums.length) s = s ? `${s}, ${nums.join(" ")}` : nums.join(" ");
      return s;
    })
    .filter(Boolean)
    .join(", ");
}

export function toRussianAddress(a: string | null | undefined): string | null {
  if (!a) return null;
  const s = a.trim();
  if (/[А-Яа-яЁё]/.test(s)) return s.split(/\s*\/\s*(?=[A-Za-z])/)[0];
  let r: string;
  if (GEO.test(s)) r = fromKa(s);
  else if (/[A-Za-z]/.test(s)) r = fromLat(s);
  else return null;
  r = r.replace(/\s+/g, " ").replace(/^[\s,]+|[\s,]+$/g, "");
  if (!/[А-Яа-я]{3}/.test(r)) return null;
  return /^батуми/i.test(r) ? r : `Батуми, ${r}`;
}

/** Грузинское название русскими буквами (без падежей). */
export function georgianToRussian(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => cap([...w].map((c) => KA[c] ?? c).join("")))
    .join(" ");
}
