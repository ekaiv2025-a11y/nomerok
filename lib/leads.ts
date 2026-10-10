/*
 * Поиск специалистов в выгрузке чатов Telegram (Telegram Desktop → «Экспорт истории чата» → JSON).
 * Работает в браузере: файл никуда не загружается, на сервер уходит только короткий список найденных.
 */

export type Lead = {
  userId: string; // числовой id автора в Telegram
  name: string;
  category: string; // id категории NomerOk
  text: string; // текст объявления (самое свежее)
  date: string;
  chat: string;
  chatId: string | null; // для ссылки на сообщение
  msgId: number;
  usernames: string[]; // @ники из текста
  phones: string[];
  count: number; // сколько подходящих сообщений у автора
};

/* Слова-признаки категорий (начала слов, без учёта регистра). */
const CATS: [string, RegExp][] = [
  ["plumber", /сантехн|засор|унитаз|смесител|бойлер|водонагрев|канализац|plumb|სანტექნ/i],
  ["electrician", /электрик|электромонтаж|проводк|розетк|автомат[ыа]? в щит|electrician|ელექტრიკ/i],
  ["aircon", /кондиционер|сплит[- ]систем|заправк[аи] кондиц|air ?con|კონდიციონ/i],
  ["appliances", /ремонт (стиральн|холодильн|техники|посудомо|телефон|ноутбук|компьютер)|стиральн\w* машин/i],
  ["repair", /ремонт (квартир|под ключ|помещен)|отделк|штукатур|плиточн|укладк\w* плитк|гипсокартон|маляр|покраск\w* стен|ламинат|натяжн\w* потол/i],
  ["inspection", /технадзор|технический надзор|приемк\w* квартир|приёмк\w* квартир|приемк\w* от застройщ|приёмк\w* от застройщ|строительн\w* экспертиз|обследован\w* (здан|дом|квартир)|тепловизор|building inspection/i],
  ["handyman", /муж на час|мастер на час|мелкий ремонт|сборк\w* мебел|повесить (полк|карниз|телевиз)/i],
  ["cleaning", /уборк|клининг|генеральн\w* уборк|химчистк\w* (мебел|диван|ковр)|мойк\w* окон|cleaning|დალაგ/i],
  ["moving", /грузчик|переезд|грузоперевоз|вывоз мусора|перевезти|movers?/i],
  ["nanny", /\bнян[яиюе]|присмотр за ребен|бебиситт|babysit|nanny|ძიძ/i],
  ["speech", /логопед|дефектолог|нейропсихолог|speech therap/i],
  ["tutor", /репетитор|подготовк\w* к (егэ|огэ|школ|экзамен|ielts|toefl)|занятия по (математ|физик|хими|русск)|tutor|რეპეტიტ/i],
  ["languages", /(английск|грузинск|немецк|испанск|французск|турецк)\w* язык|уроки (английск|грузинск)|преподаватель (английск|грузинск)|english teacher/i],
  ["music", /уроки (вокал|гитар|фортепиан|рисован|танц)|преподаватель (вокал|музык|гитар|фортепиан)|художественн\w* студи|вокал/i],
  ["dentist", /стоматолог|зубн\w* врач|dentist|სტომატოლ/i],
  ["psychologist", /психолог|психотерапевт|гештальт|кпт-терап|сексолог|psycholog|ფსიქოლოგ/i],
  ["massage", /массаж|массажист|massage|მასაჟ/i],
  ["vet", /ветеринар|груминг|\bvet\b|ვეტერინ/i],
  ["doctor", /\bврач\b|педиатр|терапевт|невролог|гинеколог|кардиолог|эндокринолог|остеопат|\bdoctor\b|ექიმ/i],
  ["beauty", /маникюр|педикюр|наращиван|ресниц|бров[ие]|визажист|макияж|парикмахер|стрижк|окрашиван|колорист|косметолог|депиляц|шугаринг|эпиляц|лешмейк|барбер|nails?\b|manicure|makeup|მანიკ/i],
  ["it", /чат-?бот|разработк\w* сайт|создани\w* сайт|маркетолог|smm|таргетолог|программист|веб-?дизайн/i],
  ["food", /торты на заказ|десерты на заказ|кондитер|кейтеринг|выпечка на заказ/i],
  ["furniture", /мебел\w* на заказ|корпусн\w* мебел|кухни на заказ|шкаф\w*[- ]купе|перетяжк|обивк\w* мебел|реставрац\w* мебел|столяр/i],
  ["fitness", /фитнес|персональн\w* тренер|тренировк|пилатес|йог[аи]\b|стретчинг|айкидо|карате|бокс|единоборств|плаван|тренер по|fitness|trainer|coach/i],
  ["lawyer", /юрист|адвокат|юридическ|внж|регистрац\w* (ип|компани)|lawyer|იურისტ/i],
  ["accountant", /бухгалтер|налогов\w* деклара|бухучет|accountant|ბუღალტ/i],
  ["translator", /переводчик|перевод документ|нотариальн\w* перевод|translator|თარჯიმ/i],
  ["realtor", /риелтор|риэлтор|агент по недвижим|realtor|რიელტ/i],
  ["art", /картин\w* на заказ|пишу картин|художни|портрет по фото|роспись стен|интерьерн\w* картин|ручной работы|хендмейд|handmade|керамик|artist/i],
  ["photo", /фотограф|фотосесси|видеограф|видеосъемк|видеосъёмк|photographer|ფოტოგრაფ/i],
];

/* Человек предлагает услугу (а не ищет её). */
const OFFER = /предлага|оказыва|выполня|делаю|работаю|принима[юе]|запис[ьа]|записаться|обращайтесь|пишите|звоните|в (лс|личк|директ)|по всем вопросам|стоимост|цен[аы]|прайс|от \d+|\d+\s*(₾|лар|gel|lari)|₾|опыт \d|свободн\w* (окошк|время|дат)|выезд|услуг|портфолио|мастер/i;
const ASKING = /\b(ищу|ищем|нужен|нужна|нужно|нужны|посоветуйте|подскажите|порекомендуйте|кто может|требуется|есть ли|ищется|who can|looking for|need a)\b/i;

type TgText = string | ({ type?: string; text?: string } | string)[];
type TgMsg = { id: number; type?: string; date?: string; from?: string | null; from_id?: string; text?: TgText; forwarded_from?: string };
type TgChat = { name?: string; id?: number; type?: string; messages?: TgMsg[] };

function flat(t: TgText | undefined): string {
  if (!t) return "";
  if (typeof t === "string") return t;
  return t.map((p) => (typeof p === "string" ? p : (p.text ?? ""))).join("");
}

export function classify(text: string): string | null {
  if (text.length < 25) return null;
  if (!OFFER.test(text)) return null;
  const head = text.slice(0, 200);
  if (ASKING.test(head)) return null;
  for (const [id, re] of CATS) if (re.test(text)) return id;
  return null;
}

/** Ссылка на сообщение в чате (работает у участников чата). */
export function messageLink(l: Pick<Lead, "chatId" | "msgId">): string | null {
  if (!l.chatId) return null;
  return `https://t.me/c/${l.chatId}/${l.msgId}`;
}

/** Разбирает один или несколько файлов result.json. */
export function findLeads(files: unknown[]): { leads: Lead[]; chats: string[]; messages: number } {
  const chats: TgChat[] = [];
  for (const f of files) {
    const o = f as { messages?: TgMsg[]; chats?: { list?: TgChat[] } };
    if (Array.isArray(o?.messages)) chats.push(o as TgChat);
    else if (Array.isArray(o?.chats?.list)) chats.push(...o.chats!.list!.filter((c) => Array.isArray(c.messages)));
  }
  const byUser = new Map<string, Lead>();
  let total = 0;
  for (const c of chats) {
    // В экспорте id супергруппы без префикса -100 — такой и нужен для ссылки t.me/c/…
    const chatId = c.id != null && /group|supergroup|channel/i.test(c.type ?? "") ? String(c.id).replace(/^-100/, "") : null;
    for (const m of c.messages ?? []) {
      if (m.type !== "message" || !m.from_id?.startsWith("user") || m.forwarded_from) continue;
      total++;
      const text = flat(m.text).trim();
      const cat = classify(text);
      if (!cat) continue;
      const userId = m.from_id.slice(4);
      const usernames = [...text.matchAll(/(?:^|[^\w@])@([a-z0-9_]{5,32})\b/gi)].map((x) => x[1]).concat([...text.matchAll(/t\.me\/([a-z0-9_]{5,32})\b/gi)].map((x) => x[1]));
      const phones = [...text.matchAll(/(?:\+?995|\b5)\s*\(?\d[\d\s\-()]{7,14}\d/g)].map((x) => x[0].replace(/\D/g, "")).map((d) => (d.startsWith("995") ? d : "995" + d));
      const prev = byUser.get(userId);
      const date = m.date ?? "";
      if (!prev || date > prev.date) {
        byUser.set(userId, {
          userId,
          name: m.from ?? "—",
          category: cat,
          text: text.slice(0, 700),
          date,
          chat: c.name ?? "",
          chatId,
          msgId: m.id,
          usernames: [...new Set([...(prev?.usernames ?? []), ...usernames])],
          phones: [...new Set([...(prev?.phones ?? []), ...phones])],
          count: (prev?.count ?? 0) + 1,
        });
      } else {
        prev.count++;
        prev.usernames = [...new Set([...prev.usernames, ...usernames])];
        prev.phones = [...new Set([...prev.phones, ...phones])];
      }
    }
  }
  const leads = [...byUser.values()].sort((a, b) => b.date.localeCompare(a.date));
  return { leads, chats: chats.map((c) => c.name ?? "?"), messages: total };
}

/** Текст приглашения (подписывается Дмитрием). */
export function inviteText(catLabel: string, name: string): string {
  const first = name.split(/\s+/)[0];
  const hello = first && first !== "—" && /^[\p{L}-]{2,}$/u.test(first) ? `Здравствуйте, ${first}!` : "Здравствуйте!";
  return `${hello} Увидел ваше объявление в чате.

Меня зовут Дмитрий, я сделал сайт NomerOk.ge — каталог специалистов Батуми и Грузии. Там можно разместить профиль в категории «${catLabel}»: услуги и цены, фото работ, адрес или выезд, ссылки на соцсети.

Клиенты звонят и пишут вам напрямую, а заявки приходят в Telegram. Регистрация пара минут: https://nomerok.ge

Если будут вопросы — пишите!`;
}
