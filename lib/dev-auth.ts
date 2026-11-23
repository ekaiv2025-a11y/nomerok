import "server-only";
import { currentPoster, type Poster } from "./realty-auth";
import type { DevProject } from "./dev-projects";

/** Кто ведёт ЖК: тот же вход, что для объявлений (Telegram, почта, Google или анкета риелтора/агентства). */
export const currentDev = currentPoster;
export const ownsDev = (who: Poster, d: Pick<DevProject, "owner_chat_id" | "master_id">) =>
  who.kind === "realtor" ? d.master_id === who.m.id : d.owner_chat_id === who.chatId && !d.master_id;
