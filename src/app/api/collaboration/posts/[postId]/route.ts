import { NextRequest, NextResponse } from 'next/server';
import { CollaborationStatus } from '@prisma/client';
import { prisma } from '@/server/db/client';

export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  const body = (await request.json()) as {
    status?: string;
  };

  if (!params.postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 });
  }

  const statusKey = body.status.toUpperCase() as keyof typeof CollaborationStatus;
  const status = CollaborationStatus[statusKey];
  if (!status) {
    return NextResponse.json({ error: `Unsupported status: ${body.status}` }, { status: 400 });
  }

  const post = await prisma.collaborationPost.update({
    where: { id: params.postId },
    data: {
      status
    },
    include: {
      dao: { select: { id: true, name: true } },
      author: { select: { id: true, displayName: true, walletAddress: true } }
    }
  });

  return NextResponse.json({ post });
}
