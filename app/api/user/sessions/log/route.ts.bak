import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    let ip = headersList.get("x-forwarded-for")?.split(",")[0] || 
             headersList.get("x-real-ip") || 
             "127.0.0.1";
             
    // Localhost fallback for testing
    if (ip === "::1" || ip === "127.0.0.1") {
        ip = "8.8.8.8"; // Default to a known IP for geo-testing
    }

    const userAgent = headersList.get("user-agent") || "Unknown";
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    // Prevent spam: Check if we already logged this IP in the last 5 minutes
    const recentLog = await prisma.securityEvent.findFirst({
        where: {
            ipAddress: ip,
            type: "SYSTEM_ACCESS",
            timestamp: {
                gte: new Date(Date.now() - 5 * 60 * 1000)
            }
        }
    });

    if (recentLog) {
        return NextResponse.json({ success: true, message: "Already logged recently" });
    }

    // Geolocate
    let geo = { country: "Unknown", city: "Unknown", lat: 0, lon: 0 };
    try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`);
        if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.status === "success") {
                geo = {
                    country: geoData.country,
                    city: geoData.city,
                    lat: geoData.lat,
                    lon: geoData.lon
                };
            }
        }
    } catch (e) {
        console.error("Geo check failed:", e);
    }

    // Record access
    await prisma.securityEvent.create({
        data: {
            type: "SYSTEM_ACCESS",
            ipAddress: ip,
            userAgent: userAgent,
            severity: "INFO",
            metadata: {
                browser: `${browser.name || "Unknown"} ${browser.version || ""}`,
                os: `${os.name || "Unknown"} ${os.version || ""}`,
                deviceType: device.type || "desktop",
                location: `${geo.city}, ${geo.country}`,
                lat: geo.lat,
                lon: geo.lon
            }
        }
    });

    const response = NextResponse.json({ success: true });
    
    // Set human_session cookie to authenticate the browser for the middleware
    response.cookies.set('human_session', 'active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Access log error:", error);
    return NextResponse.json({ error: "Failed to log access" }, { status: 500 });
  }
}
