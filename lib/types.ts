export type MasterStatus = "pending" | "published" | "hidden" | "rejected";
export type RequestStatus = "new" | "in_work" | "done" | "spam";

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
  created_at: string;
  updated_at: string;
};

/** То, что можно показывать посетителю сайта: без телефона и служебных полей. */
export type PublicMaster = Omit<Master, "phone" | "telegram" | "whatsapp" | "admin_note" | "consent_at" | "status">;

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
  created_at: string;
};

export type NewMaster = Omit<Master, "id" | "slug" | "created_at" | "updated_at" | "admin_note"> & {
  admin_note?: string;
};

export type NewRequest = Pick<ClientRequest, "category" | "description" | "when_text" | "name" | "phone" | "master_id">;
