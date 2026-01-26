import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const proof = await req.json();
        const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID || "app_d2014c58bb084dcb09e1f3c1c1144287"; // User Provided ID
        const action = "login"; // Debe coincidir con tu IDKitWidget

        const verifyRes = await fetch(`https://developer.worldcoin.org/api/v1/verify/${app_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...proof, action }),
        });

        const wldResponse = await verifyRes.json();

        if (verifyRes.ok) {
            // ✅ ÉXITO: La prueba es matemáticamente válida y única.
            return NextResponse.json({
                verified: true,
                nullifier_hash: wldResponse.nullifier_hash
            });
        } else {
            // ❌ FALLO: Prueba falsa, reutilizada o inválida.
            return NextResponse.json({
                verified: false,
                code: wldResponse.code,
                detail: wldResponse.detail
            }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ verified: false }, { status: 500 });
    }
}
