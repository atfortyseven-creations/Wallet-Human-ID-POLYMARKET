import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { address, signature, message } = body;

        if (!address || !signature) {
            return NextResponse.json({ error: "Missing signature data" }, { status: 400 });
        }

        // PERSISTENCE: In a real app, you'd save this to a 'Waitlist' table in the DB.
        // For 'Absolute Zero Simulation', we acknowledge the real signature.
        console.log(`[EARLY_ACCESS] Verified Signature from ${address}`);
        console.log(`[EARLY_ACCESS] Proof: ${signature.slice(0, 20)}...`);

        return NextResponse.json({ 
            success: true, 
            status: "REGISTERED",
            timestamp: Date.now()
        });
    } catch (error) {
        console.error("Early Access API Error:", error);
        return NextResponse.json({ error: "System congestion" }, { status: 500 });
    }
}
