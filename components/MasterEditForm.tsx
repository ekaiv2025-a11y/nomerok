import { LANGUAGES, PRICE_UNITS } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import type { Master } from "@/lib/types";
import { CategoryOptions } from "./CategoryOptions";
import { saveMaster } from "@/app/admin/actions";

export function MasterEditForm({ m }: { m?: Master }) {
  const L = ({ label, children, hint }: { label: string; hint?: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="text-[14px] font-semibold">{label}</span>
      {hint && <span className="block text-[12px] text-muted">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
  return (
    <form action={saveMaster} className="space-y-4 rounded-2xl bg-white p-5">
      {m && <input type="hidden" name="id" value={m.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <L label="Имя и фамилия"><input name="name" defaultValue={m?.name} className="field" required /></L>
        <L label="Направление">
          <select name="category" defaultValue={m?.category ?? ""} className="field" required>
            <option value="" disabled>Выберите…</option>
            <CategoryOptions />
          </select>
        </L>
      </div>
      <L label="Услуги" hint="Каждая с новой строки"><textarea name="services" rows={6} defaultValue={m?.services} className="field" /></L>
      <L label="О специалисте"><textarea name="about" rows={4} defaultValue={m?.about} className="field" /></L>
      <L label="Образование и документы" hint="Диплом, лицензия, место работы. Обязательно проверьте у врачей"><textarea name="credentials" rows={3} defaultValue={m?.credentials} className="field" /></L>
      <div className="grid grid-cols-3 gap-4">
        <L label="Опыт, лет"><input name="experience_years" type="number" min={0} defaultValue={m?.experience_years ?? ""} className="field" /></L>
        <L label="Цена от, ₾"><input name="price_from" type="number" min={0} defaultValue={m?.price_from ?? ""} className="field" /></L>
        <L label="За что">
          <select name="price_unit" defaultValue={m?.price_unit ?? "час"} className="field">
            {PRICE_UNITS.map((u) => <option key={u} value={u}>за {u}</option>)}
          </select>
        </L>
      </div>
      <fieldset>
        <legend className="text-[14px] font-semibold">Языки</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {LANGUAGES.map((l) => (
            <label key={l} className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" name="languages" value={l} defaultChecked={m ? m.languages.includes(l) : l === "Русский"} /> {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <L label="Телефон"><input name="phone" defaultValue={m ? formatPhone(m.phone) : ""} className="field" required /></L>
        <L label="Ник Telegram"><input name="telegram" defaultValue={m?.telegram ? "@" + m.telegram : ""} className="field" /></L>
      </div>
      <label className="flex items-center gap-2 text-[14px]">
        <input type="checkbox" name="whatsapp" defaultChecked={m?.whatsapp ?? true} /> Есть WhatsApp
      </label>
      <L label="Ссылка на фото" hint="Необязательно. Прямая ссылка https://… на картинку (например, из Supabase Storage)">
        <input name="photo_url" defaultValue={m?.photo_url ?? ""} className="field" />
      </L>
      <L label="Заметка для себя" hint="Клиенты её не видят"><textarea name="admin_note" rows={2} defaultValue={m?.admin_note} className="field" /></L>
      {!m && (
        <div className="space-y-2 rounded-xl bg-cream p-3 text-[14px]">
          <label className="flex items-center gap-2"><input type="checkbox" name="consent" /> Специалист дал согласие на публикацию (например, в переписке)</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="status" value="published" /> Сразу опубликовать</label>
        </div>
      )}
      <button className="btn-primary">{m ? "Сохранить" : "Добавить специалиста"}</button>
    </form>
  );
}
