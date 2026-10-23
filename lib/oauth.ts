import "server-only";
import { createHash, randomBytes } from "crypto";

/*
 * Вход через Google и Facebook (стандартный OAuth: сайт → страница Google/Facebook → обратно на сайт с кодом).
 * Ключи берутся из настроек Vercel:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   — console.cloud.google.com → Credentials → OAuth client
 *   FACEBOOK_APP_ID, FACEBOOK_APP_SECRET     — developers.facebook.com → My Apps
 * Адреса возврата: https://nomerok.ge/api/auth/google/callback и https://nomerok.ge/api/auth/facebook/callback
 */
export type Provider = "google" | "facebook";
export type OAuthUser = { key: string; email: string | null; emailVerified: boolean; name: string };

const FB_V = "v21.0";
const env = (k: string) => (process.env[k] ?? "").trim();

export function providerEnabled(p: Provider): boolean {
  return p === "google" ? !!(env("GOOGLE_CLIENT_ID") && env("GOOGLE_CLIENT_SECRET")) : !!(env("FACEBOOK_APP_ID") && env("FACEBOOK_APP_SECRET"));
}

export const callbackUrl = (origin: string, p: Provider) => `${origin}/api/auth/${p}/callback`;

export function newPkce() {
  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, verifier, challenge };
}

export function authorizeUrl(p: Provider, origin: string, state: string, challenge: string, lang: string): string {
  if (p === "google") {
    const q = new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      redirect_uri: callbackUrl(origin, p),
      response_type: "code",
      scope: "openid email profile",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      prompt: "select_account",
      hl: lang,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  }
  const q = new URLSearchParams({
    client_id: env("FACEBOOK_APP_ID"),
    redirect_uri: callbackUrl(origin, p),
    response_type: "code",
    scope: "public_profile,email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `https://www.facebook.com/${FB_V}/dialog/oauth?${q}`;
}

/** Обменять код на данные человека. null — не получилось. */
export async function fetchUser(p: Provider, origin: string, code: string, verifier: string): Promise<OAuthUser | null> {
  try {
    if (p === "google") {
      const r = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env("GOOGLE_CLIENT_ID"),
          client_secret: env("GOOGLE_CLIENT_SECRET"),
          redirect_uri: callbackUrl(origin, p),
          grant_type: "authorization_code",
          code_verifier: verifier,
        }),
        signal: AbortSignal.timeout(10000),
      });
      const j = (await r.json()) as { id_token?: string };
      if (!r.ok || !j.id_token) return null;
      // id_token получен напрямую от Google по защищённому соединению — его содержимое можно читать
      const c = JSON.parse(Buffer.from(j.id_token.split(".")[1], "base64url").toString("utf8")) as {
        sub?: string; email?: string; email_verified?: boolean | string; name?: string; given_name?: string; aud?: string; iss?: string;
      };
      if (!c.sub || c.aud !== env("GOOGLE_CLIENT_ID") || !String(c.iss).includes("accounts.google.com")) return null;
      return { key: c.sub, email: c.email ?? null, emailVerified: c.email_verified === true || c.email_verified === "true", name: c.name || c.given_name || "" };
    }
    const q = new URLSearchParams({ client_id: env("FACEBOOK_APP_ID"), client_secret: env("FACEBOOK_APP_SECRET"), redirect_uri: callbackUrl(origin, p), code, code_verifier: verifier });
    const t = await fetch(`https://graph.facebook.com/${FB_V}/oauth/access_token?${q}`, { signal: AbortSignal.timeout(10000) });
    const tj = (await t.json()) as { access_token?: string };
    if (!t.ok || !tj.access_token) return null;
    const me = await fetch(`https://graph.facebook.com/${FB_V}/me?fields=id,name,email&access_token=${encodeURIComponent(tj.access_token)}`, { signal: AbortSignal.timeout(10000) });
    const mj = (await me.json()) as { id?: string; name?: string; email?: string };
    if (!me.ok || !mj.id) return null;
    // Facebook отдаёт только подтверждённую почту
    return { key: mj.id, email: mj.email ?? null, emailVerified: !!mj.email, name: mj.name ?? "" };
  } catch (e) {
    console.error(`[oauth ${p}]`, e);
    return null;
  }
}
