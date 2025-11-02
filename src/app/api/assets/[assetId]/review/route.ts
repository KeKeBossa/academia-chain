import { NextRequest, NextResponse } from 'next/server';
import { ActivityType, ReviewStatus } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function POST(request: NextRequest, { params }: { params: { assetId: string } }) {
  await ensureSeedData();

  const body = (await request.json()) as {
    reviewerId: string;
    comment: string;
    status?: string;
  };

  if (!params.assetId || !body.reviewerId || !body.comment) {
    return NextResponse.json(
      { error: 'assetId, reviewerId, and comment are required' },
      { status: 400 }
    );
  }

  const statusKey = body.status?.toUpperCase() as keyof typeof ReviewStatus | undefined;
  const normalizedStatus =
    statusKey && ReviewStatus[statusKey] ? ReviewStatus[statusKey] : ReviewStatus.PENDING;

  const review = await prisma.review.create({
    data: {
      assetId: params.assetId,
      reviewerId: body.reviewerId,
      comment: body.comment,
      status: normalizedStatus
    },
    include: {
      reviewer: { select: { id: true, displayName: true } }
    }
  });

  await prisma.activityLog.create({
    data: {
      assetId: params.assetId,
      actorId: body.reviewerId,
      type: ActivityType.REVIEW_SUBMITTED,
      metadata: {
        reviewId: review.id,
        status: review.status
      }
    }
  });

  return NextResponse.json({ review }, { status: 201 });
}
