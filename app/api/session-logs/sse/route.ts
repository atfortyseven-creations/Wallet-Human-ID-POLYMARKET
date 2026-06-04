import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue('event: connected\ndata: connected\n\n');

      let lastCheckedId = '';
      
      // Get the most recent log first to establish baseline
      const latest = await (prisma as any).userSessionLog.findFirst({
        orderBy: { timestamp: 'desc' }
      });
      if (latest) {
        lastCheckedId = latest.id;
      }

      const intervalId = setInterval(async () => {
        try {
          const newLogs = await (prisma as any).userSessionLog.findMany({
            where: {
              timestamp: latest ? { gt: latest.timestamp } : undefined,
              id: { not: lastCheckedId }
            },
            take: 5,
            orderBy: { timestamp: 'desc' }
          });

          if (newLogs.length > 0) {
            lastCheckedId = newLogs[0].id;
            controller.enqueue(`event: new_logs\ndata: ${JSON.stringify(newLogs)}\n\n`);
          }
        } catch (error) {
          console.error("SSE Poll error", error);
        }
      }, 2000);

      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
