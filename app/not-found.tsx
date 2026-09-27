import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Страница не найдена</h1>
        <p className="mt-2 text-muted">Возможно, ссылка устарела.</p>
        <Link href="/" className="btn-primary mt-6">На главную</Link>
      </div>
      <Footer />
    </>
  );
}
