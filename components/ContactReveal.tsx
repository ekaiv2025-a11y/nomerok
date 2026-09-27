"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Send, Loader2, Mail } from "lucide-react";
import { formatPhone, telegramLink, whatsappLink } from "@/lib/phone";
import { getDict, href, type Locale } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";

type Contacts = { phone: string; telegram: string | null; whatsapp: boolean };

export function ContactReveal({ masterId, slug, lang, hideRequest = false }: { masterId: string; slug: string; lang: Locale; hideRequest?: boolean }) {
  const t = getDict(lang).reveal;
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [c, setC] = useState<Contacts | null>(null);

  async function reveal() {
    setState("loading");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId, lang }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error");
      setC({ phone: data.phone, telegram: data.telegram, whatsapp: data.whatsapp });
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setState("error");
    }
  }

  // Пришли из каталога по кнопке «Связаться» — сразу показываем контакты
  useEffect(() => {
    if (window.location.hash === "#contact") {
      reveal();
      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ block: "center" }), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Кнопка «Контакты» в нижней панели на телефоне просит открыть контакты здесь
  useEffect(() => {
    const onReveal = () => {
      if (!c && state !== "loading") reveal();
    };
    window.addEventListener("nm:reveal", onReveal);
    return () => window.removeEventListener("nm:reveal", onReveal);
  });

  return (
    <div id="contact" className="scroll-mt-20 rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      {!c ? (
        <>
          <button onClick={reveal} disabled={state === "loading"} className="btn-primary h-12 w-full">
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            {t.show}
          </button>
          {state === "error" && <p className="mt-2 text-center text-[13px] text-danger">{error}</p>}
          <p className="mt-3 text-center text-[12px] leading-snug text-muted">{t.noFee(SITE_NAME)}</p>
        </>
      ) : (
        <div className="space-y-2.5">
          <a href={`tel:${c.phone}`} className="btn-dark h-12 w-full">
            <Phone className="h-4 w-4" /> {formatPhone(c.phone)}
          </a>
          {c.whatsapp && (
            <a href={whatsappLink(c.phone, t.greeting(SITE_NAME))} target="_blank" rel="noopener noreferrer" className="btn h-12 w-full bg-[#25D366] text-white hover:bg-[#1eb457]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          <a href={telegramLink(c.telegram, c.phone)} target="_blank" rel="noopener noreferrer" className="btn h-12 w-full bg-[#229ED9] text-white hover:bg-[#1c89bd]">
            <Send className="h-4 w-4" /> Telegram{c.telegram ? ` @${c.telegram}` : ""}
          </a>
          <p className="pt-1 text-center text-[12px] leading-snug text-muted">{t.mention(SITE_NAME)}</p>
        </div>
      )}
      {!hideRequest && (
        <div className="mt-4 border-t border-line pt-4 text-center">
          <Link href={href(lang, `/master/${slug}/message`)} className="btn-ghost h-11 w-full">
            <Mail className="h-4 w-4" /> {t.orMessage}
          </Link>
          <p className="mt-2 text-[12px] leading-snug text-muted">{t.orMessageHint}</p>
        </div>
      )}
    </div>
  );
}
