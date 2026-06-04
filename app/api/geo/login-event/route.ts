import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ──────────────────────────────────────────────────────────────
// POST /api/geo/login-event
// Called server-side at authentication time to record geo data
// GDPR compliant: no raw IP stored, no PII, only hash + country
// ──────────────────────────────────────────────────────────────

const GEO_SALT = process.env.GEO_IP_SALT || "humanity-ledger-geo-salt-2026";

function hashIP(ip: string): string {
  return crypto.createHmac("sha256", GEO_SALT).update(ip).digest("hex").slice(0, 16);
}

async function resolveGeo(ip: string): Promise<{
  countryCode: string;
  countryName: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  isTor?: boolean;
  isVpn?: boolean;
  isDatacenter?: boolean;
} | null> {
  // Skip local/private IPs
  if (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip === "unknown"
  ) {
    return null;
  }

  try {
    // Use ip-api.com (free, 45req/min — sufficient for our auth rate)
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,as`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "success") return null;

    return {
      countryCode: data.countryCode || "XX",
      countryName: data.country || "Unknown",
      region: data.regionName,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
      asn: data.as,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      sessionType = "UNKNOWN",
      authMethod = "UNKNOWN",
      deviceType,
      wasSuccessful = true,
    } = body;

    // Extract real IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = (forwardedFor?.split(",")[0] || realIp || "unknown").trim();

    const geo = await resolveGeo(ip);
    if (!geo) {
      // Don't fail silently — still record with unknown geo
      return NextResponse.json({ ok: true, geo: null });
    }

    await prisma.loginGeoEvent.create({
      data: {
        userId: userId || null,
        sessionType,
        authMethod,
        deviceType,
        wasSuccessful,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        asn: geo.asn,
        ipHash: hashIP(ip),
      },
    });

    return NextResponse.json({ ok: true, geo: { country: geo.countryName, code: geo.countryCode } });
  } catch (err) {
    console.error("[GEO_LOGIN_EVENT]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
