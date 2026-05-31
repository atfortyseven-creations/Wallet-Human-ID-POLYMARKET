import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax' as const,
    path: "/",
    maxAge: 0, // Immediately expire
  };

  //  Clear all system session cookies 
  response.cookies.set("whale_session", "", cookieBase);      // httpOnly — MUST be cleared server-side
  response.cookies.set("human_session", "", cookieBase);      // httpOnly — MUST be cleared server-side
  response.cookies.set("system_handshake", "", { ...cookieBase, httpOnly: false });
  response.cookies.set("wallet-auth", "", { ...cookieBase, httpOnly: false });

  //  Legacy cookies (email/next-auth) 
  response.cookies.set("auth_token", "", cookieBase);
  response.cookies.set("human.access-token", "", cookieBase);
  response.cookies.set("human.refresh-token", "", cookieBase);

  return response;
}
