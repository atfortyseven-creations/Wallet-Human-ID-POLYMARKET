import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

export async function POST(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const address = validation.userId;

        // Upsert user  create them if they don't exist yet.
        const user = await prisma.user.upsert({
            where:  { walletAddress: address },
            update: {},
            create: { walletAddress: address },
            select: { id: true }
        });

        const body = await req.json();
        const { content, topicId, replyToId } = body;
        if (!content || !topicId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        const newPost = await (prisma as any).forumPost.create({
            data: {
                content,
                topicId,
                authorId: user.id,
                replyToId: replyToId || undefined
            },
            include: {
                author: { select: { walletAddress: true } }
            }
        });

        // Fire-and-forget side effects  never let failures block the response
        const sideEffects = async () => {
            // Update topic timestamp
            try {
                const topic = await (prisma as any).forumTopic.update({
                    where: { id: topicId },
                    data: { updatedAt: new Date() },
                    select: { authorId: true }
                });
                // Notify topic author (only if different user)
                if (topic.authorId !== user.id) {
                    try {
                        await (prisma as any).forumNotification.create({
                            data: { userId: topic.authorId, type: 'REPLY', actorId: user.id, topicId, postId: newPost.id }
                        });
                    } catch { /* ForumNotification may not exist yet */ }
                }
            } catch { /* ForumTopic update may fail */ }

            // AuditLog  optional, table may not exist
            try {
                await prisma.auditLog.create({
                    data: {
                        userId: user.id, action: 'FORUM_POST_CREATED', resource: 'ForumPost',
                        metadata: { postId: newPost.id, topicId },
                        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
                    }
                });
            } catch { /* AuditLog table may not exist yet */ }

            // ForumTelemetry  optional, table may not exist
            try {
                await (prisma as any).forumTelemetry.create({
                    data: {
                        userId: user.id, action: 'REPLY_POST',
                        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
                        metadata: { topicId, postId: newPost.id }
                    }
                });
            } catch { /* ForumTelemetry table may not exist yet */ }
        };

        // Don't await  fire and forget
        sideEffects().catch(() => {});

        return NextResponse.json(newPost);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
