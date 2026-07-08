import { NextRequest, NextResponse } from "next/server";
import { revokeToken } from "@/lib/security/jwt-blacklist";

export async function POST(request: NextRequest) {
  // [QUANTUM HARDENING] Cryptographically revoke the active JWTs at logout.
  // Clearing cookies alone is insufficient — a captured token can still be replayed.
  // We blacklist both session tokens so the middleware rejects them instantly.
  const whaleSession = request.cookies.get("whale_session")?.value;
  const humanSession = request.cookies.get("human_session")?.value;
  if (whaleSession) revokeToken(whaleSession);
  if (humanSession && humanSession !== whaleSession) revokeToken(humanSession);

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  // [FIX] The middleware (middleware.ts:367) adds SameSite=Strict to whale_session cookies
  // when they are SET. To DELETE a cookie, the browser requires the deletion attributes
  // to match the original attributes EXACTLY. Using SameSite=Lax to delete a
  // SameSite=Strict cookie results in the browser treating them as different cookies,
  // so the original cookie is never cleared — users stay authenticated after Disconnect.
  //
  // Rule: delete whale_session with Strict, everything else with Lax.
  const host = request.headers.get("host") || "";
  const cookieDomain = (process.env.NODE_ENV === "production" && host.includes("humanidfi.com")) ? "humanidfi.com" : undefined;
  const strictBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict' as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    domain: cookieDomain,
  };

  const laxBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax' as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    domain: cookieDomain,
  };

  const laxPublic = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax' as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    domain: cookieDomain,
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
  // To guarantee clearing cookies across all possible domain permutations (e.g. localhost, railway, production),
  // we emit headers for BOTH the current implied domain and the explicit production domain.
  const expiredDate = "Thu, 01 Jan 1970 00:00:00 GMT";
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const explicitDomain = (process.env.NODE_ENV === "production" && host.includes("humanidfi.com")) ? "; Domain=humanidfi.com" : "";

  const permutations = [
    { name: "whale_session", opts: `Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Strict` },
    { name: "whale_session", opts: `Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Lax` },
    { name: "human_session", opts: `Path=/; Expires=${expiredDate}; HttpOnly${secure}; SameSite=Lax` },
    { name: "system_handshake", opts: `Path=/; Expires=${expiredDate}${secure}; SameSite=Lax` },
    { name: "wallet-auth", opts: `Path=/; Expires=${expiredDate}${secure}; SameSite=Lax` }
  ];

  permutations.forEach(p => {
    // 1. Without domain (current host)
    response.headers.append("Set-Cookie", `${p.name}=; ${p.opts}`);
    // 2. With explicit domain (if applicable)
    if (explicitDomain) {
      response.headers.append("Set-Cookie", `${p.name}=; ${p.opts}${explicitDomain}`);
    }
  });

  return response;
}

