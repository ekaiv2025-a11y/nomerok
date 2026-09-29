import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { adminGetMaster, adminUpdateMaster } from "@/lib/db";
import { DOC_TYPES, MAX_DOC_SIZE, MAX_DOCUMENTS, removeDocumentFile, uploadDocument } from "@/lib/documents";
import { currentSpecialistId } from "@/lib/spec-auth";
import { escapeHtml, notifyAdmin } from "@/lib/telegram";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import type { DocKind, MasterDocument } from "@/lib/types";

const KINDS: DocKind[] = ["diploma", "certificate", "license", "other"];

async function me(lang: Locale) {
  const id = await currentSpecialistId();
  if (!id) return { error: NextResponse.json({ ok: false, error: getDict(lang).cabinet.sessionExpired }, { status: 401 }) };
  const m = await adminGetMaster(id);
  if (!m) return { error: NextResponse.json({ ok: false }, { status: 404 }) };
  return { m };
}

/** Клиенту не отдаём пути к файлам — только то, что нужно для списка. */
function view(docs: MasterDocument[]) {
  return docs.map(({ path, ...d }) => ({ ...d, hasFile: !!path }));
}

async function save(id: string, docs: MasterDocument[]) {
  await adminUpdateMaster(id, { documents: docs });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, documents: view(docs) });
}

/** Загрузить документ. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const l = form?.get("lang");
  const lang = isLocale(l) ? l : "ru";
  const t = getDict(lang).cabinet;
  const r = await me(lang);
  if (r.error) return r.error;
  const docs = Array.isArray(r.m.documents) ? r.m.documents : [];
  if (docs.length >= MAX_DOCUMENTS) return NextResponse.json({ ok: false, error: t.docsFull }, { status: 400 });
  const file = form?.get("file");
  const title = String(form?.get("title") ?? "").trim().slice(0, 120);
  const kind = KINDS.includes(form?.get("kind") as DocKind) ? (form!.get("kind") as DocKind) : "other";
  if (!(file instanceof Blob) || !DOC_TYPES[file.type]) return NextResponse.json({ ok: false, error: t.docsType }, { status: 400 });
  if (file.size > MAX_DOC_SIZE) return NextResponse.json({ ok: false, error: t.docsSize }, { status: 400 });
  if (title.length < 2) return NextResponse.json({ ok: false, error: t.docsNeedName }, { status: 400 });
  try {
    const up = await uploadDocument(r.m.id, file);
    const doc: MasterDocument = {
      id: randomUUID(),
      path: up.path,
      type: up.type,
      title,
      kind,
      public: form?.get("public") !== "false",
      status: "pending",
      uploaded_at: new Date().toISOString(),
    };
    await notifyAdmin(
      `📄 <b>${escapeHtml(r.m.name)}</b> загрузил(а) документ: ${escapeHtml(title)}${doc.public ? " — уже в профиле" : " (скрыт от клиентов)"}\nПосмотреть: ${SITE_URL}/admin?tab=docs`,
    );
    return save(r.m.id, [...docs, doc]);
  } catch (e) {
    console.error("[docs]", e);
    return NextResponse.json({ ok: false, error: t.photoError }, { status: 500 });
  }
}

/** Изменить: { id, public?, title? }. Проверка при этом не сбрасывается. */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const lang: Locale = isLocale(body?.lang) ? body.lang : "ru";
  const r = await me(lang);
  if (r.error) return r.error;
  const docs = [...(r.m.documents ?? [])];
  const i = docs.findIndex((d) => d.id === body?.id);
  if (i < 0) return NextResponse.json({ ok: false }, { status: 404 });
  if (typeof body.public === "boolean") docs[i] = { ...docs[i], public: body.public };
  if (typeof body.title === "string" && body.title.trim().length >= 2) docs[i] = { ...docs[i], title: body.title.trim().slice(0, 120) };
  return save(r.m.id, docs);
}

/** Удалить: { id }. Файл тоже удаляется из хранилища. */
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const lang: Locale = isLocale(body?.lang) ? body.lang : "ru";
  const r = await me(lang);
  if (r.error) return r.error;
  const docs = r.m.documents ?? [];
  const doc = docs.find((d) => d.id === body?.id);
  if (!doc) return NextResponse.json({ ok: false }, { status: 404 });
  await removeDocumentFile(doc.path).catch(() => null);
  return save(
    r.m.id,
    docs.filter((d) => d.id !== doc.id),
  );
}
