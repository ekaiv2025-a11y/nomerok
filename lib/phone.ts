/**
 * Приводит телефон к виду +995XXXXXXXXX (или другой международный номер).
 * Возвращает null, если номер явно неправильный.
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);

  // Грузинский номер без кода страны: 5XX XXX XXX (9 цифр)
  if (digits.length === 9 && !raw.startsWith("+")) digits = "995" + digits;

  if (digits.startsWith("995")) {
    return digits.length === 12 ? "+" + digits : null;
  }
  // Другие страны: 10–15 цифр с кодом страны
  if (digits.length >= 10 && digits.length <= 15) return "+" + digits;
  return null;
}

/** +995555123456 → +995 555 12 34 56 */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("995") && d.length === 12) {
    return `+995 ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  return phone;
}

/** Имя пользователя Telegram из «@name», «t.me/name» или «https://t.me/name». */
export function normalizeTelegram(input: string | null | undefined): string | null {
  if (!input) return null;
  let v = input.trim();
  v = v.replace(/^https?:\/\//i, "").replace(/^(t\.me|telegram\.me)\//i, "").replace(/^@/, "");
  v = v.split(/[/?#\s]/)[0];
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(v) ? v : null;
}

export function telegramLink(username: string | null, phone: string): string {
  if (username) return `https://t.me/${username}`;
  return `https://t.me/+${phone.replace(/\D/g, "")}`;
}

export function whatsappLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
