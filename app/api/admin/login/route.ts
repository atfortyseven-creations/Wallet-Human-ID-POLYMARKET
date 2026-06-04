import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET_STR = process.env.JWT_SECRET;
if (!JWT_SECRET_STR) {
    if (process.env.NODE_ENV === 'production') {
        console.error("[Admin Login] ️ JWT_SECRET not defined. Admin logins disabled.");
    }
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR || 'build-fallback-secret');

//  Brute-Force Protection: In-memory rate limiter 
// Max 5 failed attempts per IP within a 15-minute window.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    const MAX_ATTEMPTS = 5;

    const record = loginAttempts.get(ip);
    if (!record || now > record.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, retryAfterMs: 0 };
    }
    if (record.count >= MAX_ATTEMPTS) {
        return { allowed: false, retryAfterMs: record.resetAt - now };
    }
    record.count += 1;
    return { allowed: true, retryAfterMs: 0 };
}

export async function POST(req: NextRequest) {
    try {
        // Brute-force check before touching DB
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
        const rateCheck = checkRateLimit(ip);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { success: false, message: 'Too many login attempts. Try again later.' },
                { 
                    status: 429,
                    headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) }
                }
            );
        }

        await connectMongoDB();

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password required" },
                { status: 400 }
            );
        }

        // Find user
        const user = await AdminUser.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create JWT token
        const token = await new SignJWT({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user: {
                email: user.email,
                role: user.role,
            },
        });

        // Set HTTP-only cookie  strict sameSite to prevent CSRF on admin panel
        response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return response;

    } catch (error: any) {
        console.error("[Admin Login] Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

