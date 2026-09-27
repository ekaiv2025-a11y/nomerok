import { CATEGORIES, CATEGORY_GROUPS, GROUP_LABELS } from "@/lib/categories";
import type { Locale } from "@/lib/i18n/config";

/** Список направлений для выпадающего меню, сгруппированный по разделам. */
export function CategoryOptions({ lang = "ru" }: { lang?: Locale }) {
  return (
    <>
      {CATEGORY_GROUPS.map((g) => (
        <optgroup key={g} label={GROUP_LABELS[g][lang]}>
          {CATEGORIES.filter((c) => c.group === g).map((c) => (
            <option key={c.id} value={c.id}>
              {c.label[lang]}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
