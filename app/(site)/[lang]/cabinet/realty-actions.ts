"use server";

import { revalidatePath } from "next/cache";
import { currentPoster, currentRealtor, ownsListing } from "@/lib/realty-auth";
import { notifyListingPending } from "@/lib/realty-moderation";
import { bumpListing, channelsOf, deleteListing, duplicateListing, getListing, removeChannel, updateChannel, updateListing } from "@/lib/realty-db";
import { redirect } from "next/navigation";

/** Действия с объявлением: опубликовать, продлить, в архив, удалить (риелтор из кабинета или автор из «Моих объявлений»). */
export async function listingAction(fd: FormData) {
  const who = await currentPoster();
  if (!who) return;
  const l = await getListing(String(fd.get("id") ?? ""));
  if (!l || !ownsListing(who, l)) return;
  const act = String(fd.get("act") ?? "");
  const lang = ["ru", "en", "ka"].includes(String(fd.get("lang"))) ? String(fd.get("lang")) : "ru";
  if (act === "publish" || act === "renew") {
    if (!l.photos.length) return;
    // продлить уже проверенное (после архива) — сразу; черновик — сначала на проверку администратору
    if (l.status === "archived" || l.status === "published") await updateListing(l.id, { status: "published", expire_warned_at: null });
    else if (l.status === "draft") {
      await updateListing(l.id, { status: "pending" });
      await notifyListingPending({ ...l, status: "pending" }, who.kind === "realtor" ? who.m.name : null).catch(() => null);
    }
  } else if (act === "bump") await bumpListing(l);
  else if (act === "copy") {
    const c = await duplicateListing(l);
    revalidatePath("/[lang]/cabinet", "page");
    redirect(who.kind === "realtor" ? `/${lang}/cabinet?tab=realty&edit=${c.id}` : `/${lang}/realty/my?edit=${c.id}`);
  } else if (act === "archive") await updateListing(l.id, { status: "archived" });
  else if (act === "delete") await deleteListing(l.id);
  revalidatePath("/[lang]/cabinet", "page");
  revalidatePath("/[lang]/realty", "page");
  revalidatePath("/[lang]/realty/my", "page");
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
