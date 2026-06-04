import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json({ topics: [], posts: [] });
    }

    // A simple LIKE search or FullTextSearch depending on Prisma config.
    // Assuming Postgres fullTextSearch is enabled as per schema.
    const topics = await prisma.forumTopic.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        author: { select: { displayName: true, walletAddress: true, avatarUrl: true } }
      },
      take: 10
    });

    const posts = await prisma.forumPost.findMany({
      where: {
        content: { contains: q, mode: 'insensitive' }
      },
      include: {
        topic: { select: { title: true, id: true } },
        author: { select: { displayName: true, walletAddress: true, avatarUrl: true } }
      },
      take: 10
    });

    return NextResponse.json({ topics, posts });
  } catch (error) {
    console.error('[Forum Search GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
