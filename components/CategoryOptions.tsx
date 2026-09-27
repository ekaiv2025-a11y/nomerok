import { CATEGORIES, CATEGORY_GROUPS } from "@/lib/categories";

/** Список направлений для выпадающего меню, сгруппированный по разделам. */
export function CategoryOptions() {
  return (
    <>
      {CATEGORY_GROUPS.map((g) => (
        <optgroup key={g} label={g}>
          {CATEGORIES.filter((c) => c.group === g).map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
