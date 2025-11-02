import { NextResponse } from 'next/server';
import { ActivityType } from '@prisma/client';
import { prisma } from '@/server/db/client';
import { ensureSeedData } from '@/server/data/seed';

export async function GET(_: Request, { params }: { params: { assetId: string } }) {
  await ensureSeedData();

  const asset = await prisma.researchAsset.findUnique({
    where: { id: params.assetId },
    include: {
      owner: { select: { id: true, displayName: true, walletAddress: true } },
      dao: { select: { id: true, name: true } },
      proposal: { select: { id: true, title: true, status: true } },
      reviews: {
        include: {
          reviewer: { select: { id: true, displayName: true, walletAddress: true } }
        }
      },
      comments: {
        where: { type: ActivityType.ASSET_COMMENTED },
        orderBy: { createdAt: 'asc' },
        include: {
          actor: { select: { id: true, displayName: true, walletAddress: true } }
        }
      }
    }
  });

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  return NextResponse.json({ asset });
}
