import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 *  DEPRECATED API ENDPOINT
 * 
 * This manual SQL migration script has been dismantled to ensure absolute 
 * structural integrity and prevent "Schema Drift".
 * 
 * All migrations and schema definitions must now be handled exclusively 
 * via `prisma/schema.prisma` and the `npx prisma db push` command.
 * 
 * Executing raw SQL ALTER TABLE commands in production bypasses Prisma's 
 * internal graph, destroying Cascade Deletion relations and corrupting data.
 */
export async function GET() {
    return NextResponse.json(
        { 
            error: "Endpoint Locked (410 Gone)", 
            reason: "Manual DB sync is deprecated to prevent Schema Drift.",
            directive: "Use 'npx prisma db push' for all structural changes."
        }, 
        { status: 410 }
    );
}

export async function POST() {
    return NextResponse.json(
        { 
            error: "Endpoint Locked (410 Gone)", 
            reason: "Manual DB sync is deprecated to prevent Schema Drift.",
            directive: "Use 'npx prisma db push' for all structural changes."
        }, 
        { status: 410 }
    );
}
