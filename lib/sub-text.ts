/* Подписка специалиста на общие заявки (тексты бота и кабинета). */
export const SUB: Record<string, { ask: string; on: string; off: string; btnOn: string; btnOff: string; isOn: string; isOff: string; label: string; hint: string }> = {
  ru: {
    ask: "📬 <b>Хотите получать заявки клиентов?</b>\nКогда кто-то ищет специалиста вашего направления, мы пришлём заявку сюда — откликнитесь, если удобно. Отписаться можно в любой момент.",
    on: "✅ Готово! Заявки вашего направления будут приходить сюда. Отключить — команда /zayavki.",
    off: "🔕 Заявки отключены. Включить снова — команда /zayavki.",
    btnOn: "🔔 Получать заявки", btnOff: "🔕 Не получать",
    isOn: "Сейчас заявки приходят вам.", isOff: "Сейчас заявки вам не приходят.",
    label: "Получать заявки клиентов в Telegram", hint: "Когда кто-то ищет специалиста вашего направления, бот пришлёт заявку. Личные сообщения клиентов приходят всегда.",
  },
  en: {
    ask: "📬 <b>Want to receive client requests?</b>\nWhen someone looks for a specialist in your field, we'll send the request here. You can unsubscribe anytime.",
    on: "✅ Done! Requests in your field will arrive here. To turn off — /zayavki.",
    off: "🔕 Requests turned off. To turn on again — /zayavki.",
    btnOn: "🔔 Receive requests", btnOff: "🔕 Don't receive",
    isOn: "Requests are currently on.", isOff: "Requests are currently off.",
    label: "Receive client requests in Telegram", hint: "When someone looks for a specialist in your field, the bot sends the request. Direct messages always arrive.",
  },
  ka: {
    ask: "📬 <b>გსურთ კლიენტების განაცხადების მიღება?</b>\nროცა ვინმე თქვენი მიმართულების სპეციალისტს ეძებს, განაცხადს აქ გამოგიგზავნით.",
    on: "✅ მზადაა! განაცხადები აქ მოვა. გამორთვა — /zayavki.",
    off: "🔕 განაცხადები გამორთულია. ჩართვა — /zayavki.",
    btnOn: "🔔 განაცხადების მიღება", btnOff: "🔕 არ მივიღო",
    isOn: "განაცხადები ჩართულია.", isOff: "განაცხადები გამორთულია.",
    label: "კლიენტების განაცხადების მიღება Telegram-ში", hint: "პირადი შეტყობინებები ყოველთვის მოდის.",
  },
};
export const sub = (lang: string) => SUB[lang] ?? SUB.ru;
