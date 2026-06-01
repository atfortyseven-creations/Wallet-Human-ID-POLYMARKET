import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  // [FIX] The middleware (middleware.ts:367) adds SameSite=Strict to whale_session cookies
  // when they are SET. To DELETE a cookie, the browser requires the deletion attributes
  // to match the original attributes EXACTLY. Using SameSite=Lax to delete a
  // SameSite=Strict cookie results in the browser treating them as different cookies,
  // so the original cookie is never cleared — users stay authenticated after Disconnect.
  //
  // Rule: delete whale_session with Strict, everything else with Lax.
  const strictBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict' as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  const laxBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax' as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  const laxPublic = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax' as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  // whale_session: created with SameSite=Strict by middleware — MUST delete with Strict
  response.cookies.set("whale_session", "", strictBase);
  // Also attempt Lax variant in case older sessions were created before the middleware fix
  response.cookies.set("whale_session", "", laxBase);

  // human_session: standard Lax session cookie
  response.cookies.set("human_session", "", laxBase);

  // Public cookies (no httpOnly)
  response.cookies.set("system_handshake", "", laxPublic);
  response.cookies.set("wallet-auth", "", laxPublic);

  // Legacy / email-auth cookies
  response.cookies.set("auth_token", "", laxBase);
  response.cookies.set("human.access-token", "", laxBase);
  response.cookies.set("human.refresh-token", "", laxBase);

  // NextAuth cookie purge — both prefixed and non-prefixed variants
  response.cookies.set("next-auth.session-token", "", laxBase);
  response.cookies.set("__Secure-next-auth.session-token", "", laxBase);
  response.cookies.set("next-auth.callback-url", "", laxPublic);
  response.cookies.set("__Secure-next-auth.callback-url", "", laxPublic);
  response.cookies.set("next-auth.csrf-token", "", laxPublic);
  response.cookies.set("__Host-next-auth.csrf-token", "", laxPublic);

  // [FIX] Belt-and-suspenders: also emit raw Set-Cookie headers to cover edge cases
  // where response.cookies.set() de-duplicates keys and drops the Strict variant.
  // These headers arrive alongside the cookies above — the browser processes all of them.
  const expiredDate = "Thu, 01 Jan 1970 00:00:00 GMT";
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `whale_session=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Strict`
  );
  response.headers.append(
    "Set-Cookie",
    `whale_session=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Lax`
  );
  response.headers.append(
    "Set-Cookie",
    `human_session=; Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Lax`
  );
  response.headers.append(
    "Set-Cookie",
    `system_handshake=; Path=/; Expires=${expiredDate}${secure}; SameSite=Lax`
  );

  return response;
}

