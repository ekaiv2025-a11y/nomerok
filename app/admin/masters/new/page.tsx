import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { MasterEditForm } from "@/components/MasterEditForm";

export const dynamic = "force-dynamic";

export default async function NewMasterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin?tab=masters" className="text-[14px] text-muted">← Назад</Link>
      <h1 className="mt-3 text-2xl font-bold">Новый специалист</h1>
      <p className="mt-1 text-[14px] text-muted">Для специалистов, с которыми вы договорились лично или в чате. Публикуйте только с их согласия.</p>
      {error && <p className="mt-3 rounded-xl bg-[#fdecea] p-3 text-[14px] text-danger">{error}</p>}
      <div className="mt-4"><MasterEditForm /></div>
    </div>
  );
}
