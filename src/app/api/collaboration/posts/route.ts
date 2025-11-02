import { NextRequest, NextResponse } from 'next/server';
import { CollaborationStatus, ActivityType, Prisma } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(request: NextRequest) {
  await ensureSeedData();

  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');
  const status = searchParams.get('status');
  const query = searchParams.get('q');
  const authorId = searchParams.get('authorId');
  const skill = searchParams.get('skill');

  const defaultQuery = process.env.COLLABORATION_FILTER_DEFAULT_Q;
  const defaultSkill = process.env.COLLABORATION_FILTER_DEFAULT_SKILL;
  const defaultAuthor = process.env.COLLABORATION_FILTER_DEFAULT_AUTHOR;

  const effectiveQuery =
    query ?? (defaultQuery && defaultQuery.length > 0 ? defaultQuery : undefined);
  const effectiveSkill =
    skill ?? (defaultSkill && defaultSkill.length > 0 ? defaultSkill : undefined);
  const effectiveAuthor =
    authorId ?? (defaultAuthor && defaultAuthor.length > 0 ? defaultAuthor : undefined);

  let normalizedStatus: CollaborationStatus | undefined;
  if (status) {
    const key = status.toUpperCase() as keyof typeof CollaborationStatus;
    normalizedStatus = CollaborationStatus[key] ?? undefined;
  }

  const posts = await prisma.collaborationPost.findMany({
    where: {
      daoId: daoId ?? undefined,
      status: normalizedStatus ?? undefined,
      authorId: effectiveAuthor ?? undefined,
      ...(effectiveQuery
        ? {
            OR: [
              { title: { contains: effectiveQuery, mode: 'insensitive' } },
              { body: { contains: effectiveQuery, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(effectiveSkill
        ? {
            requiredSkills: {
              has: effectiveSkill
            }
          }
        : {})
    },
    include: {
      dao: {
        select: { id: true, name: true }
      },
      author: {
        select: { id: true, displayName: true, walletAddress: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as {
    daoId: string;
    authorId: string;
    title: string;
    body: string;
    requiredSkills?: string[];
    status?: string;
  };

  if (!input.daoId || !input.authorId || !input.title || !input.body) {
    return NextResponse.json(
      { error: 'daoId, authorId, title, and body are required' },
      { status: 400 }
    );
  }

  const normalizedStatus =
    input.status && input.status.toUpperCase() in CollaborationStatus
      ? (CollaborationStatus[
          input.status.toUpperCase() as keyof typeof CollaborationStatus
        ] as CollaborationStatus)
      : CollaborationStatus.OPEN;

  const post = await prisma.collaborationPost.create({
    data: {
      daoId: input.daoId,
      authorId: input.authorId,
      title: input.title,
      body: input.body,
      requiredSkills: input.requiredSkills ?? [],
      status: normalizedStatus
    },
    include: {
      dao: {
        select: { id: true, name: true }
      },
      author: {
        select: { id: true, displayName: true, walletAddress: true }
      }
    }
  });

  await prisma.activityLog.create({
    data: {
      daoId: post.daoId,
      actorId: post.authorId,
      type: ActivityType.COLLABORATION_POSTED,
      targetId: post.id,
      metadata: {
        title: post.title,
        requiredSkills: post.requiredSkills
      }
    }
  });

  const members = await prisma.daoMembership.findMany({
    where: { daoId: post.daoId },
    select: { userId: true }
  });

  const notifications = members
    .filter((membership) => membership.userId !== post.authorId)
    .map((membership) => ({
      userId: membership.userId,
      type: 'COLLABORATION_POST',
      payload: {
        collaborationPostId: post.id,
        daoId: post.daoId,
        title: post.title
      }
    })) as Prisma.NotificationCreateManyInput[];

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  return NextResponse.json({ post }, { status: 201 });
}
