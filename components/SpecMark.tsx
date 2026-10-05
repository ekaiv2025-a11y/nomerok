"use client";
import { useEffect } from "react";

/** Метка «этот браузер — специалиста»: шапка покажет «Мой кабинет» вместо «Я специалист». */
export function SpecMark() {
  useEffect(() => {
    try {
      if (!/(?:^|; )nm_is_spec=1/.test(document.cookie)) document.cookie = `nm_is_spec=1; path=/; max-age=${365 * 86400}; samesite=lax`;
    } catch {}
  }, []);
  return null;
}
