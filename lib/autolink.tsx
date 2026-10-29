import Link from "next/link";
import type { ReactNode } from "react";

/*
 * Ссылки прямо в тексте статей журнала.
 * 1) Ручные: [текст](/ru/guide/slug) или [текст](https://…) — пишет автор или бот новостей.
 * 2) Автоссылки по словарю: первое упоминание темы ведёт на статью или раздел каталога.
 *    Каждая цель — один раз на статью, всего не больше MAX_AUTO, на саму статью не ссылаемся.
 */
const MAX_AUTO = 6;
const W = "(?<![\\p{L}\\p{N}])"; // начало слова
const E = "(?![\\p{L}\\p{N}])"; // конец слова
const any = "\\p{L}*"; // окончания: котёл, котла, котлом…

type Rule = { re: RegExp; href: string };
const r = (src: string, href: string, caseSensitive = false): Rule => ({ re: new RegExp(`${W}(?:${src})${E}`, caseSensitive ? "u" : "iu"), href });
const G = (slug: string) => `/ru/guide/${slug}`;
const S = (cat: string) => `/ru/services/${cat}`;

// Порядок важен: сначала длинные и точные фразы, потом общие слова
const RULES: Rule[] = [
  // статьи журнала
  r(`газов${any} кот(?:ёл|ел|л${any})`, G("gazovyy-kotel-zima-gruziya")),
  r(`чистк${any} кондиционер${any}`, G("chistka-kondicionera")),
  r(`генеральн${any} уборк${any}`, G("generalnaya-uborka-chek-list")),
  r(`(?:сн(?:ять|имать|имаете|имают)|аренд${any}) квартир${any}`, G("snyat-kvartiru-batumi-chek-list")),
  r(`грузинск${any} язык${any}`, G("gruzinskiy-yazyk-s-nulya")),
  r(`(?:оплат${any} коммунал${any}|коммуналк${any}|квитанци${any})`, G("kak-oplatit-kommunalku-gruziya")),
  r(`(?:Telasi|Теласи|GWP|Energo-?Pro|Энерго-?Про|Tbilisi Energy|Тбилиси Энерджи)`, G("kommunalnye-sluzhby-gruzii")),
  r(`(?:пропал${any} свет|отключени${any} (?:света|электричества))`, G("propal-svet-batumi")),
  r(`(?:нет воды|отключени${any} воды|протечк${any}|теч(?:ёт|ет) труба)`, G("net-vody-batumi")),
  r(`(?:плесен${any}|сырост${any})`, G("plesen-v-kvartire-batumi")),
  r(`переезд${any}`, G("pereezd-bez-nervov")),
  r(`новостройк${any}`, G("remont-novostroyki-batumi")),
  r(`коворкинг${any}`, G("kovorkingi-batumi")),
  r(`(?:хачапури|хинкали)`, G("hachapuri-i-hinkali-batumi")),
  r(`ремонт${any} телефон${any}`, G("remont-telefonov-batumi")),
  r(`репетитор${any}`, G("kak-vybrat-repetitora")),
  r(`нян(?:я|ю|и|ей|ям|ями|ях|ь)`, G("kak-nayti-nyanyu-batumi")),
  r(`психолог${any}`, G("kak-vybrat-psihologa")),
  r(`ветеринар${any}`, G("kogda-srochno-k-veterinaru")),
  // города → городской гид (с заглавной буквы, чтобы «гори» и «поти» в других значениях не путались)
  r(`Тбилиси`, G("mastera-i-byt-tbilisi"), true),
  r(`Кутаис${any}`, G("mastera-i-byt-kutaisi"), true),
  r(`Рустав${any}`, G("mastera-i-byt-rustavi"), true),
  r(`Кобулет${any}`, G("mastera-i-byt-kobuleti"), true),
  r(`Зугдид${any}`, G("mastera-i-byt-zugdidi"), true),
  r(`Поти`, G("mastera-i-byt-poti"), true),
  r(`Гори`, G("mastera-i-byt-gori"), true),
  r(`(?:Телав${any}|Кахети${any})`, G("mastera-i-byt-telavi"), true),
  r(`Боржом${any}`, G("mastera-i-byt-borjomi"), true),
  // разделы каталога
  r(`электрик${any}`, S("electrician")),
  r(`сантехник${any}`, S("plumber")),
  r(`кондиционер${any}`, S("aircon")),
  r(`(?:клининг${any}|уборк${any})`, S("cleaning")),
  r(`грузчик${any}`, S("moving")),
  r(`(?:юрист${any}|адвокат${any})`, S("lawyer")),
  r(`переводчик${any}`, S("translator")),
  r(`(?:риелтор${any}|риэлтор${any})`, S("realtor")),
  r(`фотограф${any}`, S("photo")),
  r(`стоматолог${any}`, S("dentist")),
  r(`массаж${any}`, S("massage")),
  r(`(?:маникюр${any}|педикюр${any})`, S("beauty")),
  r(`(?:оставьте|оставить|разместите|разместить) заявк${any}`, "/ru/request"),
  r(`(?:полезн${any} телефон${any}|экстренн${any} номер${any})`, "/ru/phones"),
];

const MD = /\[([^\]\n]{1,120})\]\(((?:\/[\w\-/?=&#.%]*)|(?:https:\/\/[^\s)]+))\)/g;
const linkCls = "font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand";

export function makeLinker(selfHref: string, opts: { auto?: boolean } = {}) {
  const used = new Set<string>([selfHref]);
  let auto = opts.auto === false ? MAX_AUTO : 0;
  let key = 0;

  function autoLink(text: string): ReactNode[] {
    const out: ReactNode[] = [];
    let rest = text;
    while (rest && auto < MAX_AUTO) {
      // ищем самое раннее совпадение среди ещё не использованных целей
      let best: { i: number; len: number; href: string } | null = null;
      for (const rule of RULES) {
        if (used.has(rule.href)) continue;
        const m = rule.re.exec(rest);
        if (m && (best === null || m.index < best.i)) best = { i: m.index, len: m[0].length, href: rule.href };
      }
      if (!best) break;
      if (best.i > 0) out.push(rest.slice(0, best.i));
      out.push(
        <Link key={`a${key++}`} href={best.href} className={linkCls}>
          {rest.slice(best.i, best.i + best.len)}
        </Link>,
      );
      used.add(best.href);
      auto++;
      rest = rest.slice(best.i + best.len);
    }
    if (rest) out.push(rest);
    return out;
  }

  /** Текст абзаца/пункта/совета → текст со ссылками. */
  return function linkify(text: string): ReactNode[] {
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of text.matchAll(MD)) {
      const i = m.index ?? 0;
      if (i > last) out.push(...autoLink(text.slice(last, i)));
      const href = m[2].replace(/^https:\/\/(www\.)?nomerok\.ge/, "") || "/";
      used.add(href);
      out.push(
        href.startsWith("/") ? (
          <Link key={`m${key++}`} href={href} className={linkCls}>
            {m[1]}
          </Link>
        ) : (
          <a key={`m${key++}`} href={href} target="_blank" rel="noopener noreferrer nofollow" className={linkCls}>
            {m[1]}
          </a>
        ),
      );
      last = i + m[0].length;
    }
    if (last < text.length) out.push(...autoLink(text.slice(last)));
    return out;
  };
}
