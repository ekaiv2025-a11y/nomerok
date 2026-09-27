import type { Locale } from "./i18n/config";

export type MasterStatus = "pending" | "published" | "hidden" | "rejected";
export type RequestStatus = "new" | "sent" | "taken" | "in_work" | "done" | "spam";

export type Master = {
  id: string;
  slug: string;
  name: string;
  category: string;
  services: string;
  about: string;
  /** Образование, лицензия, место работы — важно для врачей, юристов, репетиторов */
  credentials: string;
  experience_years: number | null;
  languages: string[];
  price_from: number | null;
  price_unit: string;
  phone: string;
  telegram: string | null;
  whatsapp: boolean;
  photo_url: string | null;
  status: MasterStatus;
  admin_note: string;
  consent_at: string | null;
  /** Язык, на котором специалист заполнял анкету — на нём пишет бот */
  lang: Locale;
  /** Telegram: чат со специалистом (появляется после /start в боте) */
  tg_chat_id: number | null;
  tg_username: string | null;
  /** Секретный код для ссылки t.me/бот?start=m_… */
  tg_link_token: string;
  /** Когда номер подтверждён через Telegram */
  phone_verified_at: string | null;
  /** Получать ли новые заявки своей категории */
  notify_requests: boolean;
  created_at: string;
  updated_at: string;
};

/** То, что можно показывать посетителю сайта: без телефона и служебных полей. */
export type PublicMaster = Pick<
  Master,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "services"
  | "about"
  | "credentials"
  | "experience_years"
  | "languages"
  | "price_from"
  | "price_unit"
  | "photo_url"
  | "created_at"
  | "updated_at"
> & { verified: boolean; demo: boolean };

export type MasterContacts = {
  phone: string;
  telegram: string | null;
  whatsapp: boolean;
};

export type ClientRequest = {
  id: string;
  category: string;
  description: string;
  when_text: string;
  name: string;
  phone: string;
  master_id: string | null;
  status: RequestStatus;
  admin_note: string;
  lang: Locale;
  client_tg_chat_id: number | null;
  client_link_token: string;
  sent_count: number;
  created_at: string;
};

export type RequestResponse = { id: number; request_id: string; master_id: string; created_at: string };

export type NewMaster = Omit<
  Master,
  "id" | "slug" | "created_at" | "updated_at" | "admin_note" | "tg_chat_id" | "tg_username" | "tg_link_token" | "phone_verified_at" | "notify_requests" | "lang"
> & {
  admin_note?: string;
  lang?: Locale;
};

export type NewRequest = Pick<ClientRequest, "category" | "description" | "when_text" | "name" | "phone" | "master_id"> & { lang?: Locale };
