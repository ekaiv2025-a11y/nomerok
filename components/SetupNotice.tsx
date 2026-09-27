export function SetupNotice() {
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-accent/50 bg-[#fdf6e6] p-6 text-center">
      <p className="font-semibold">Сайт почти готов</p>
      <p className="mt-1 text-[14px] text-muted">База данных ещё не подключена. Владелец сайта: добавьте ключи Supabase в настройках Vercel (см. README).</p>
    </div>
  );
}
