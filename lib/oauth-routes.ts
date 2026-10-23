import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { authorizeUrl, fetchUser, newPkce, providerEnabled, type Provider } from "./oauth";
import { loginAccount } from "./accounts";
import { OAUTH_COOKIE, applyCookies, asIntent, asLang, authOrigin, finishLogin, oauthStateValue, readOAuthState, safeNext } from "./account-auth";

/** /api/auth/<google|facebook>?as=client|spec|join|link&lang=ru&next=/ru/...&claim=... → страница входа Google/Facebook */
export function startOAuth(p: Provider) {
  return async (req: NextRequest) => {
    const sp = req.nextUrl.searchParams;
    const lang = asLang(sp.get("lang"));
    const origin = authOrigin(req);
    if (!providerEnabled(p)) return NextResponse.redirect(`${origin}/${lang}/login?err=off`);
    const { state, verifier, challenge } = newPkce();
    const claim = sp.get("claim");
    const res = NextResponse.redirect(authorizeUrl(p, origin, state, challenge, lang));
    res.cookies.set(OAUTH_COOKIE, oauthStateValue({ s: state, v: verifier, i: asIntent(sp.get("as")), l: lang, x: safeNext(sp.get("next"), lang), c: claim && /^[\w-]{6,64}$/.test(claim) ? claim : null, p }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 900,
    });
    return res;
  };
}

/** Возврат от Google/Facebook: проверяем state, получаем человека, входим. */
export function finishOAuth(p: Provider) {
  return async (req: NextRequest) => {
    const sp = req.nextUrl.searchParams;
    const st = await readOAuthState();
    const origin = authOrigin(req);
    const lang = st?.l ?? "ru";
    const fail = (why: string) => {
      const r = NextResponse.redirect(`${origin}/${lang}/login?err=${why}${st ? `&as=${st.i}` : ""}`);
      r.cookies.set(OAUTH_COOKIE, "", { path: "/", maxAge: 0 });
      return r;
    };
    if (sp.get("error")) return fail("cancel");
    const code = sp.get("code");
    if (!st || st.p !== p || !code || sp.get("state") !== st.s) return fail("state");
    const u = await fetchUser(p, origin, code, st.v);
    if (!u) return fail("failed");
    const acc = await loginAccount({ provider: p, key: u.key, email: u.email, emailVerified: u.emailVerified, name: u.name, lang });
    const done = await finishLogin(acc, st.i, lang, st.x, st.c);
    const res = applyCookies(NextResponse.redirect(`${origin}${done.url}`), done.cookies);
    res.cookies.set(OAUTH_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  };
}
