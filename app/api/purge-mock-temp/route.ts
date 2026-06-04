import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: {
                bio: {
                    contains: 'Managing tier-1 liquidity on EVM.'
                }
            }
        });

        const userIds = users.map((u: any) => u.id);
        
        if (userIds.length === 0) {
            return NextResponse.json({ success: true, message: "No mock users found." });
        }

        // Delete associated records first
        await prisma.forumNotification.deleteMany({
            where: { OR: [{ userId: { in: userIds } }, { actorId: { in: userIds } }] }
        });

        await prisma.forumLike.deleteMany({
            where: { userId: { in: userIds } }
        });

        await prisma.forumPost.deleteMany({
            where: { authorId: { in: userIds } }
        });

        await prisma.forumTopic.deleteMany({
            where: { authorId: { in: userIds } }
        });

        // Delete users
        const delRes = await prisma.user.deleteMany({
            where: { id: { in: userIds } }
        });

        return NextResponse.json({ 
            success: true, 
            deletedUsers: delRes.count,
            message: `Successfully purged ${delRes.count} mock personas and their associated data.`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
