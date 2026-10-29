/** Текст, в котором голые ссылки https://… становятся кликабельными (подпись — адрес сайта без https://). */
export function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+[^\s).,;:!?»"'])/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!/^https?:\/\//.test(p)) return p;
        let label = p;
        try {
          const u = new URL(p);
          label = (u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname : "")).slice(0, 48) + ((u.hostname + u.pathname).length > 52 ? "…" : "");
        } catch {}
        return (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer nofollow" className="break-words text-brand underline">
            {label}
          </a>
        );
      })}
    </>
  );
}
