import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/purge-forum
 * Deletes ALL forum posts and topics from the database.
 * Admin-only. Single-use cleanup endpoint.
 */
export async function POST(req: Request) {
    const deny = requireAdmin(req);
    if (deny) return deny;

    try {
        const cookieStore = await cookies();
        const address = cookieStore.get('system_handshake')?.value;
        if (!isAdmin(address)) {
            return NextResponse.json({ error: 'Unauthorized: System Admin Only' }, { status: 403 });
        }

        // Delete posts first (FK constraint  posts reference topics)
        let deletedPosts = 0;
        let deletedTopics = 0;

        try {
            const r = await (prisma as any).forumPost.deleteMany({});
            deletedPosts = r.count;
        } catch { /* table may not exist yet */ }

        try {
            const r = await (prisma as any).forumTopic.deleteMany({});
            deletedTopics = r.count;
        } catch { /* table may not exist yet */ }

        return NextResponse.json({
            success: true,
            deleted: { posts: deletedPosts, topics: deletedTopics },
            message: `Forum purged. ${deletedTopics} topics and ${deletedPosts} posts removed. The forum is now empty and ready for your first post.`,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
