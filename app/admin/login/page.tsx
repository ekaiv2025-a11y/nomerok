import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { login } from "../actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-6">
        <p className="font-semibold">Пароль админки не задан</p>
        <p className="mt-2 text-[14px] text-muted">Добавьте переменную ADMIN_PASSWORD (минимум 8 символов) в настройках Vercel и сделайте Redeploy.</p>
      </div>
    );
  }
  return (
    <form action={login} className="mx-auto max-w-sm space-y-4 rounded-2xl bg-white p-6">
      <h1 className="text-xl font-bold">Вход</h1>
      <input type="password" name="password" placeholder="Пароль" className="field" autoFocus required />
      {error && <p className="text-[14px] text-danger">{error === "wait" ? "Слишком много попыток, подождите 15 минут." : "Неверный пароль"}</p>}
      <button className="btn-primary w-full">Войти</button>
    </form>
  );
}
