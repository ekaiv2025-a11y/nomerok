import type { Locale } from "./i18n/config";

export type MasterStatus = "pending" | "published" | "hidden" | "rejected";
export type RequestStatus = "new" | "sent" | "taken" | "in_work" | "done" | "spam";

export type WorkMode = "at_client" | "at_place" | "both" | "online";
export type PortfolioItem = { url: string; caption: string };
export type DocKind = "diploma" | "certificate" | "license" | "other";
export type DocStatus = "pending" | "verified" | "rejected";
/** Документ специалиста. path — путь в закрытом хранилище (открывается по временной ссылке). */
export type MasterDocument = {
  id: string;
  path: string;
  title: string;
  kind: DocKind;
  type: "image" | "pdf";
  /** Показывать клиентам (после проверки). Иначе — только для проверки администрацией. */
  public: boolean;
  status: DocStatus;
  uploaded_at: string;
};
/** Документ для страницы специалиста: только проверенные и открытые. */
export type PublicDocument = { id: string; title: string; kind: DocKind; type: "image" | "pdf"; url: string };

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
  /** Дополнительные направления (до 3), по ним тоже приходят заявки */
  extra_categories: string[];
  /** «В отпуске / не принимаю заявки» — до даты away_until (или без срока) */
  is_away: boolean;
  away_until: string | null;
  /** Последняя активность: бот, кабинет, отклик на заявку */
  last_active_at: string | null;
  inactive_warned_at: string | null;
  /** Профиль в архиве — клиенты его не видят */
  archived_at: string | null;
  archived_reason: "inactive" | "missed" | "admin" | null;
  /** Личных заявок подряд без ответа */
  missed_direct: number;
  /** Фото работ (до 12) */
  portfolio: PortfolioItem[];
  /** Где работает: выезд к клиенту, у себя, и то и другое, онлайн */
  work_mode: WorkMode;
  /** Город (id из lib/cities), по умолчанию batumi */
  city: string;
  /** Точка, где принимает (показывается на карте) */
  place_address: string;
  place_lat: number | null;
  place_lng: number | null;
  /** Районы выезда */
  service_area: string;
  work_hours: string;
  documents: MasterDocument[];
  /** Когда отправили недельную сводку в бот */
  stats_sent_at: string | null;
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
  | "extra_categories"
  | "away_until"
  | "portfolio"
  | "work_mode"
  | "place_address"
  | "place_lat"
  | "place_lng"
  | "service_area"
  | "work_hours"
  | "city"
> & { docs_verified: boolean; away: boolean; verified: boolean; demo: boolean; rating: number | null; reviews: number };

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
  city: string;
  client_link_token: string;
  sent_count: number;
  /** Когда клиенту отправили вопрос «Удалось договориться?» */
  followup_at: string | null;
  /** agreed — договорились, none — никто не помог, closed — заявка больше не нужна */
  outcome: "agreed" | "none" | "closed" | null;
  outcome_master_id: string | null;
  outcome_at: string | null;
  review_invited_at: string | null;
  direct_checked_at: string | null;
  created_at: string;
};

export type RequestResponse = { id: number; request_id: string; master_id: string; created_at: string };

export type NewMaster = Omit<
  Master,
  "id" | "slug" | "created_at" | "updated_at" | "admin_note" | "tg_chat_id" | "tg_username" | "tg_link_token" | "phone_verified_at" | "notify_requests" | "lang" | "extra_categories" | "is_away" | "away_until" | "last_active_at" | "inactive_warned_at" | "archived_at" | "archived_reason" | "missed_direct" | "portfolio" | "work_mode" | "place_address" | "place_lat" | "place_lng" | "service_area" | "work_hours" | "documents" | "stats_sent_at" | "city"
> & {
  admin_note?: string;
  lang?: Locale;
};

export type NewRequest = Pick<ClientRequest, "category" | "description" | "when_text" | "name" | "phone" | "master_id"> & { lang?: Locale; city?: string };

export type ReviewStatus = "pending" | "published" | "rejected";
export type Review = {
  id: string;
  master_id: string;
  request_id: string | null;
  author_name: string;
  author_chat_id: number;
  rating: number;
  text: string;
  photos: string[];
  status: ReviewStatus;
  reply: string;
  reply_at: string | null;
  created_at: string;
};
export type PublicReview = Pick<Review, "id" | "author_name" | "rating" | "text" | "photos" | "reply" | "reply_at" | "created_at">;

export type ComplaintStatus = "new" | "in_review" | "resolved" | "rejected";
export type Complaint = {
  id: string;
  master_id: string | null;
  master_name: string;
  reason: string;
  text: string;
  contact: string;
  photos: string[];
  status: ComplaintStatus;
  admin_note: string;
  created_at: string;
};
