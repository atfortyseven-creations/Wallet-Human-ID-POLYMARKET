import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/clean-posts
 * Deletes ALL topics EXCEPT the one with the word "Welcome" in the title
 * (case-insensitive). The welcome post is always preserved.
 */
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const address = cookieStore.get('system_handshake')?.value;
    if (!isAdmin(address)) {
        return NextResponse.json({ error: 'Unauthorized: System Admin Only' }, { status: 403 });
    }
    // Find all topics
    const allTopics = await (prisma as any).forumTopic.findMany({
      select: { id: true, title: true },
    });

    // Partition: keep topics whose title contains "welcome" or "bienvenid"
    const keepIds = allTopics
      .filter((t: any) =>
        /welcome|bienvenid|humanityledger|announcement|inaugural/i.test(t.title)
      )
      .map((t: any) => t.id);

    const deleteIds = allTopics
      .filter((t: any) => !keepIds.includes(t.id))
      .map((t: any) => t.id);

    if (deleteIds.length === 0) {
      return NextResponse.json({ message: 'Nothing to delete  only welcome posts found.', kept: keepIds.length });
    }

    // Cascade-delete everything for each topic being deleted
    const postsToDelete = await (prisma as any).forumPost.findMany({
      where: { topicId: { in: deleteIds } },
      select: { id: true },
    });
    const postIds = postsToDelete.map((p: any) => p.id);

    // 1. Likes on posts
    await (prisma as any).forumLike.deleteMany({ where: { postId: { in: postIds } } });
    // 2. Posts themselves
    await (prisma as any).forumPost.deleteMany({ where: { topicId: { in: deleteIds } } });
    // 3. Likes on topics
    await (prisma as any).forumLike.deleteMany({ where: { topicId: { in: deleteIds } } });
    // 4. Notifications (best-effort)
    try { await (prisma as any).forumNotification.deleteMany({ where: { topicId: { in: deleteIds } } }); } catch {}
    // 5. Topics
    await (prisma as any).forumTopic.deleteMany({ where: { id: { in: deleteIds } } });

    return NextResponse.json({
      success: true,
      deleted: deleteIds.length,
      preserved: keepIds.length,
      preservedTitles: allTopics.filter((t: any) => keepIds.includes(t.id)).map((t: any) => t.title),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
