"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Send, Loader2 } from "lucide-react";
import { formatPhone, telegramLink, whatsappLink } from "@/lib/phone";
import { SITE_NAME } from "@/lib/site";

type Contacts = { phone: string; telegram: string | null; whatsapp: boolean };

export function ContactReveal({ masterId, slug }: { masterId: string; slug: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [c, setC] = useState<Contacts | null>(null);

  async function reveal() {
    setState("loading");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Ошибка");
      setC({ phone: data.phone, telegram: data.telegram, whatsapp: data.whatsapp });
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setState("error");
    }
  }

  const greeting = `Здравствуйте! Нашёл(ла) вас на ${SITE_NAME}.`;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      {!c ? (
        <>
          <button onClick={reveal} disabled={state === "loading"} className="btn-primary h-12 w-full">
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            Показать контакты
          </button>
          {state === "error" && <p className="mt-2 text-center text-[13px] text-danger">{error}</p>}
          <p className="mt-3 text-center text-[12px] leading-snug text-muted">
            Вы связываетесь со специалистом напрямую. {SITE_NAME} не берёт с клиентов денег.
          </p>
        </>
      ) : (
        <div className="space-y-2.5">
          <a href={`tel:${c.phone}`} className="btn-dark h-12 w-full">
            <Phone className="h-4 w-4" /> {formatPhone(c.phone)}
          </a>
          {c.whatsapp && (
            <a href={whatsappLink(c.phone, greeting)} target="_blank" rel="noopener noreferrer" className="btn h-12 w-full bg-[#25D366] text-white hover:bg-[#1eb457]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          <a href={telegramLink(c.telegram, c.phone)} target="_blank" rel="noopener noreferrer" className="btn h-12 w-full bg-[#229ED9] text-white hover:bg-[#1c89bd]">
            <Send className="h-4 w-4" /> Telegram{c.telegram ? ` @${c.telegram}` : ""}
          </a>
          <p className="pt-1 text-center text-[12px] leading-snug text-muted">
            Упомяните, что нашли контакт на {SITE_NAME}.
          </p>
        </div>
      )}
      <div className="mt-4 border-t border-line pt-4 text-center">
        <Link href={`/request?master=${slug}`} className="text-[14px] font-semibold text-brand hover:underline">
          Или оставьте заявку — специалист перезвонит
        </Link>
      </div>
    </div>
  );
}
