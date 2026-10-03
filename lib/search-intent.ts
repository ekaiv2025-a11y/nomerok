/*
 * Умный поиск: понимаем, какой специалист нужен, по обычным словам («течёт кран» → сантехник).
 * Ключи — начала слов (стемы), без учёта регистра. Работает для ru / ka / en.
 */
type Rule = { cat: string; sub?: string; re: RegExp };

const R = (cat: string, re: RegExp, sub?: string): Rule => ({ cat, sub, re });

export const INTENTS: Rule[] = [
  R("plumber", /теч[её]т|протека|кран|смесител|унитаз|засор|канализ|труб[аыу]|бойлер|водонагрев|душ|ванн|раковин|сантех|ტექნიკ|ონკან|plumb|leak|toilet|faucet|tap\b|pipe|clog/i),
  R("electrician", /свет\b|света|электр|розетк|выключат|проводк|щит|автомат|люстр|искрит|замыкан|лампоч|ელექტრ|socket|wiring|electric|light switch|fuse/i),
  R("aircon", /кондиц|сплит|не холодит|не греет|ფრეონ|კონდიც|air ?con|a\/c|\bac\b/i),
  R("appliances", /стиральн|холодильн|посудомо|духовк|микроволн|плит[аыу]|ремонт\w* телевизор|телевизор\w* (не|сломал)|ноутбук|компьютер|телефон.*(ремонт|сломал)|ремонт техники|washing machine|fridge|laptop/i),
  R("repair", /ремонт квартир|отделк|штукатур|плитк|покрас|обои|ламинат|потол|стяжк|гипсокартон|ремонт под ключ|renovat|tiling|painting walls/i),
  R("inspection", /при[её]мк|технадзор|застройщик|новостро|дефект|обследован|inspection|snagging/i),
  R("handyman", /муж на час|мастер на час|повесить|собрать мебел|сборк\w* мебел|карниз|полк[аиу]|дверн\w* замок|ручк[аиу] двер|handyman|assemble|mount tv/i),
  R("cleaning", /уборк|убрать|клининг|помыть|мойк\w* окон|химчистк|генеральн|после ремонта|cleaning|cleaner|დალაგ/i),
  R("moving", /переезд|перевез|грузчик|вывез|вывоз|груз|moving|movers|ტვირთ/i),
  R("nanny", /нян|присмотр|посидеть с ребен|бебиситт|babysit|nanny|ძიძ/i),
  R("tutor", /репетит|подготовк\w* к (школ|экзам|егэ|огэ)|математик|физик|хими[яи]|домашн\w* задан|уроки с ребен|tutor|homework|maths|რეპეტ/i),
  R("speech", /логопед|дефектолог|тьютор|сопровожд\w* (в|ребен)|особенност|особ\w* ребен|аутизм|рас\b|овз|сдвг|не говорит|плохо говорит|картав|заика|речь ребен|speech|special needs|autis|ლოგოპ/i),
  R("languages", /английск|грузинск\w* язык|немецк|испанск|французск|турецк|выучить язык|english|georgian lessons|language/i),
  R("music", /вокал|петь|гитар|фортепиан|пианино|рисован|танц|музык|singing|guitar|piano|drawing|dance|მუსიკ/i),
  R("dentist", /зуб|стоматолог|пломб|кариес|брекет|dentist|tooth|teeth|სტომატ|კბილ/i),
  R("doctor", /врач|доктор|педиатр|терапевт|гинеколог|невролог|давлени|температур|анализ|doctor|ექიმ/i),
  R("psychologist", /психолог|психотерап|тревог|депресс|паническ|стресс|отношени|выгоран|psycholog|therap|anxiety|ფსიქოლ/i),
  R("massage", /массаж|бол\w* спин|спин\w* бол|бол\w* ше[яи]|поясниц|антицеллюл|лимфодренаж|massage|მასაჟ/i),
  R("vet", /ветеринар|кошк|собак|кот\b|котен|щен|питом|прививк\w* (кошк|собак)|груминг|vet\b|cat\b|dog\b|ვეტერ/i),
  R("beauty", /парикмах|стрижк|подстричь|покрас\w* волос|окрашиван|укладк|волос|кератин|hair|თმ/i, "hair"),
  R("beauty", /маникюр|педикюр|ногт|гель[- ]?лак|nails?|manicure|pedicure|მანიკ/i, "nails"),
  R("beauty", /бров|ресниц|ламинир|lash|brow|წარბ|წამწამ/i, "brows"),
  R("beauty", /косметолог|чистк\w* лица|пилинг|прыщ|акне|морщин|ботокс|cosmetolog|facial|კოსმეტ/i, "cosmetology"),
  R("beauty", /визаж|макияж|make-?up|ვიზაჟ/i, "makeup"),
  R("beauty", /депиляц|эпиляц|шугаринг|воск|waxing/i, "epilation"),
  R("beauty", /барбер|бород|barber|beard/i, "barber"),
  R("fitness", /тренер|тренировк|фитнес|похуд|йог|пилатес|растяжк|fitness|trainer|workout|yoga/i),
  R("lawyer", /юрист|адвокат|внж|вид на жительство|регистрац\w* (ип|компан)|договор|суд|lawyer|residence permit|იურისტ/i),
  R("accountant", /бухгалт|налог|декларац|отч[её]тност|accountant|tax|ბუღალტ/i),
  R("translator", /перевод|переводчик|нотариальн|апостиль|translat|თარჯიმ/i),
  R("realtor", /риелтор|риэлтор|снять квартир|аренд|купить квартир|продать квартир|недвижим|realtor|rent a flat|apartment|ბინ/i),
  R("photo", /фотограф|фотосесс|видеограф|съ[её]мк|свадебн\w* фото|photographer|photoshoot|videograph|ფოტოგრ/i),
  R("art", /картин|художник|портрет по фото|роспись|хендмейд|ручной работы|artist|painting|handmade/i),
];

/** Что, скорее всего, ищет человек: список направлений (и уточнений) по запросу. */
export function detectIntent(query: string): { cat: string; sub?: string }[] {
  const q = query.trim();
  if (q.length < 3) return [];
  const out: { cat: string; sub?: string }[] = [];
  for (const r of INTENTS) if (r.re.test(q) && !out.some((o) => o.cat === r.cat && o.sub === r.sub)) out.push({ cat: r.cat, sub: r.sub });
  return out.slice(0, 3);
}
