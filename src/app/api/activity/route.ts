import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  await ensureSeedData();

  const { searchParams } = new URL(request.url);
  const daoId = searchParams.get('daoId');
  const limitParam = searchParams.get('limit');

  const limit = limitParam ? Math.min(Number(limitParam), 100) || DEFAULT_LIMIT : DEFAULT_LIMIT;

  const activity = await prisma.activityLog.findMany({
    where: {
      daoId: daoId ?? undefined
    },
    include: {
      actor: {
        select: { id: true, displayName: true, walletAddress: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return NextResponse.json({ activity });
}
