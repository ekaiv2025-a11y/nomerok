/*
 * Проверка заявки клиента перед рассылкой: похоже ли это на рекламу/объявление специалиста,
 * а не на просьбу о помощи. Такие заявки не рассылаются, а ждут решения администратора.
 */
const AD_WORDS =
  /(предлагаю|предлагаем|наши услуги|мои услуги|оказываю|оказываем|выполняю|выполняем|запись открыта|предварительная запись|записывайтесь|звоните|пишите в|обращайтесь|скидк|акци[яи]|прайс|приглашаем|набор в групп|мини-групп|курсы|ооо|llc|ltd|ип\b|компания|наш салон|наша студия|опыт работы|гарантия качества|we offer|our services|discount|book now)/i;
const ASK_WORDS = /(нужен|нужна|нужно|нужны|ищу|ищем|помогите|подскажите|требуется|кто может|сломал|не работает|течёт|течет|протека|need|looking for|help)/i;

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
  const asking = ASK_WORDS.test(r.description);
  const score = reasons.length + (adHits >= 2 ? 1 : 0) - (asking ? 1 : 0);
  return { ad: score >= 2, reasons };
}
