import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Institutional Asset Bridge API
 * 
 * Streams high-fidelity wallpapers from the system root to the frontend, 
 * bypassing filesystem isolation to incorporate user-provided assets.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "No asset specified" }, { status: 400 });
  }

  // Security: Restrict access to designated high-fidelity assets only
  const allowedAssets = [
    "peakpx.jpg",
    "illustration_web3-scaled.jpg",
    "illustration_web3-scaled.png",
    "olas-hokusai-4k.png",
    "patron-cosmico-4k.png",
  ];
  if (!allowedAssets.includes(name)) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  try {
    // Resolve from the Next.js project public directory (portable across environments)
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, name);

    // Path traversal guard: ensure resolved path stays within /public
    if (!filePath.startsWith(publicDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Asset not found on disk" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = name.endsWith(".png") ? "image/png" : "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[ASSET_BRIDGE_ERROR]:", error);
    return NextResponse.json({ error: "Internal Streaming Error" }, { status: 500 });
  }
}
