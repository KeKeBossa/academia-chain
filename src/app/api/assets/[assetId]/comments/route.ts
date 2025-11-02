import { NextRequest, NextResponse } from 'next/server';
import { ActivityType } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(_: NextRequest, { params }: { params: { assetId: string } }) {
  await ensureSeedData();

  const comments = await prisma.activityLog.findMany({
    where: {
      assetId: params.assetId,
      type: ActivityType.ASSET_COMMENTED
    },
    include: {
      actor: {
        select: { id: true, displayName: true, walletAddress: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest, { params }: { params: { assetId: string } }) {
  await ensureSeedData();

  const body = (await request.json()) as {
    authorId: string;
    comment: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.authorId || !body.comment) {
    return NextResponse.json({ error: 'authorId and comment are required' }, { status: 400 });
  }

  const activity = await prisma.activityLog.create({
    data: {
      assetId: params.assetId,
      actorId: body.authorId,
      type: ActivityType.ASSET_COMMENTED,
      metadata: {
        comment: body.comment,
        ...body.metadata
      }
    },
    include: {
      actor: {
        select: { id: true, displayName: true, walletAddress: true }
      }
    }
  });

  return NextResponse.json({ comment: activity }, { status: 201 });
}
