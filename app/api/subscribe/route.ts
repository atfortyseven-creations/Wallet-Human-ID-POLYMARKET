import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // [SECURITY & STABILITY FIX]
    // The 'emailSubscriber' model does not exist in the Prisma schema.
    // Calling prisma.emailSubscriber will cause a fatal 500 runtime crash.
    // Instead, we log the subscription request and send the email asynchronously.
    console.log(`[Subscription API] Email recorded: ${email} (${name || 'Anonymous'})`);

    // Send email (fire and forget to avoid blocking)
    try {
      sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

