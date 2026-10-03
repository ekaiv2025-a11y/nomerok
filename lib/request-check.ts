/*
 * Проверка заявки клиента перед рассылкой: похоже ли это на рекламу/объявление специалиста,
 * а не на просьбу о помощи. Такие заявки не рассылаются, а ждут решения администратора.
 */
const AD_WORDS =
  /(предлагаю|предлагаем|наши услуги|мои услуги|оказываю|оказываем|выполняю|выполняем|запись открыта|предварительная запись|записывайтесь|звоните|пишите в|обращайтесь|скидк|акци[яи]|прайс|приглашаем|набор в групп|мини-групп|курсы|ооо|llc|ltd|ип\b|компания|наш салон|наша студия|опыт работы|гарантия качества|we offer|our services|discount|book now)/i;
const ASK_WORDS = /(нужен|нужна|нужно|нужны|ищу|ищем|помогите|подскажите|требуется|кто может|сломал|не работает|течёт|течет|протека|need|looking for|help)/i;

// Специалист рассказывает о себе (анкета/резюме), а не ищет мастера.
const SELF_STRONG =
  /(стремлюсь|профессиональн\S* рост|стабильн\S* работ|ищу (работу|подработку|заказы|клиентов)|резюме|рассмотрю предложения|беру заказы|принимаю заказы|looking for (work|a job|clients)|years of experience)/i;
const SELF_WEAK =
  /(опытн\S* (мастер|специалист)|(?:^|[\s,.!])я\s*[—-]?\s*(опытн\S*\s+)?(мастер|специалист|профессионал)|работаю (мастером|специалистом|в сфере)|выполняю|выполню|качественно|аккуратно|в срок|мой опыт|опыт работы|стаж|\bi am an? (professional|experienced))/gi;
const CLIENT_ASK = /(нужен|нужна|нужно|нужны|помогите|подскажите|требуется|кто может|сломал|не работает|течёт|течет|протека|ищу (мастера|специалиста|сантехника|электрика|репетитора|няню)|need a|looking for a (master|specialist|plumber))/i;

/** Похоже, что специалист прислал о себе анкету вместо заявки клиента. */
export function looksLikeSelf(description: string): boolean {
  const t = description || "";
  if (SELF_STRONG.test(t)) return true;
  const weak = (t.match(SELF_WEAK) ?? []).length;
  return weak >= 2 && !CLIENT_ASK.test(t);
}

export function looksLikeAd(r: { description: string; name?: string }): { ad: boolean; reasons: string[] } {
  const text = `${r.description}\n${r.name ?? ""}`;
  const reasons: string[] = [];
  if (/https?:\/\/|www\.|t\.me\/|instagram\.com/i.test(text)) reasons.push("ссылка");
  if (/(^|\s)@[a-z0-9_]{4,}/i.test(r.description)) reasons.push("@ник в тексте");
  if (/(\+?995|\b5\d{2})[\s\-()]*\d{2}[\s\-()]*\d{2}[\s\-()]*\d{2}/.test(r.description)) reasons.push("телефон в тексте");
  const adHits = (text.match(new RegExp(AD_WORDS.source, "gi")) ?? []).length;
  if (adHits) reasons.push("рекламные слова");
  if (/\b(llc|ltd|ооо|ип)\b/i.test(r.name ?? "")) reasons.push("в имени — компания");
  const emojis = (r.description.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  if (emojis >= 3) reasons.push("много эмодзи");
  if (looksLikeSelf(r.description)) return { ad: true, reasons: [...reasons, "похоже на анкету специалиста"] };
  const asking = ASK_WORDS.test(r.description);
  const score = reasons.length + (adHits >= 2 ? 1 : 0) - (asking ? 1 : 0);
  return { ad: score >= 2, reasons };
}
