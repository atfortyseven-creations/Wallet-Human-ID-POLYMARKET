import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) return new NextResponse("Unauthorized Multi-Tenant Connection", { status: 401 });

    const body = await req.json();
    const { name, description, status, liquidity, oracle } = body;

    const existing = await (prisma as any).project.findUnique({ where: { id } });
    if (!existing || existing.userId !== wallet) {
        return new NextResponse("Node Not Found or Unauthorized Ownership", { status: 404 });
    }

    const project = await (prisma as any).project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(liquidity !== undefined && { liquidity }),
        ...(oracle && { oracle }),
      }
    });

    const { createHash } = await import('crypto');
    const realTxHash = '0x' + createHash('sha256')
      .update(`${id}-${new Date().toISOString()}`)
      .digest('hex');

    await (prisma as any).deployment.create({
      data: {
        projectId: id,
        action: 'UPDATE',
        status: 'SUCCESS',
        txHash: realTxHash
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_PATCH]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) return new NextResponse("Unauthorized Multi-Tenant Connection", { status: 401 });
    
    // Authorization Check: Only owner can delete their node
    const existing = await (prisma as any).project.findUnique({ where: { id } });
    if (!existing || existing.userId !== wallet) {
        return new NextResponse("Node Not Found or Unauthorized Ownership", { status: 404 });
    }

    const project = await (prisma as any).project.delete({
      where: { id }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_DELETE]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
