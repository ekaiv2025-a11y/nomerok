import Link from "next/link";

export default function MasterNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Специалист не найден</h1>
      <p className="mt-2 text-muted">Возможно, профиль скрыт или ссылка устарела.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className="btn-ghost">Все специалисты</Link>
        <Link href="/request" className="btn-primary">Оставить заявку</Link>
      </div>
    </div>
  );
}
