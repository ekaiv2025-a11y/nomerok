"use server";

import { revalidatePath } from "next/cache";
import { currentRealtor } from "@/lib/realty-auth";
import { channelsOf, deleteListing, getListing, removeChannel, updateChannel, updateListing } from "@/lib/realty-db";

/** Действия с объявлением: опубликовать, продлить, в архив, удалить. */
export async function listingAction(fd: FormData) {
  const m = await currentRealtor();
  if (!m) return;
  const l = await getListing(String(fd.get("id") ?? ""));
  if (!l || l.master_id !== m.id) return;
  const act = String(fd.get("act") ?? "");
  if (act === "publish" || act === "renew") {
    if (!l.photos.length) return;
    await updateListing(l.id, { status: "published", expire_warned_at: null });
  } else if (act === "archive") await updateListing(l.id, { status: "archived" });
  else if (act === "delete") await deleteListing(l.id);
  revalidatePath("/[lang]/cabinet", "page");
  revalidatePath("/[lang]/realty", "page");
}

export async function channelAction(fd: FormData) {
  const m = await currentRealtor();
  if (!m) return;
  const chatId = Number(fd.get("chat"));
  const ch = (await channelsOf(m.id)).find((c) => c.chat_id === chatId);
  if (!ch) return;
  const act = String(fd.get("act") ?? "");
  if (act === "auto") await updateChannel(chatId, { auto_publish: !ch.auto_publish });
  else if (act === "remove") await removeChannel(chatId);
  revalidatePath("/[lang]/cabinet", "page");
}
